package datadog

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/DataDog/datadog-go/statsd"
	"github.com/apex/log"

	"github.com/deviceplane/deviceplane/pkg/controller/connman"
	"github.com/deviceplane/deviceplane/pkg/controller/query"
	"github.com/deviceplane/deviceplane/pkg/controller/store"
	"github.com/deviceplane/deviceplane/pkg/metrics/datadog"
	"github.com/deviceplane/deviceplane/pkg/metrics/datadog/translation"
	"github.com/deviceplane/deviceplane/pkg/models"
)

type Runner struct {
	projects     store.Projects
	applications store.Applications
	devices      store.Devices
	releases     store.Releases
	st           *statsd.Client
	connman      *connman.ConnectionManager
}

func NewRunner(projects store.Projects, applications store.Applications, releases store.Releases, devices store.Devices, st *statsd.Client, connman *connman.ConnectionManager) *Runner {
	return &Runner{
		projects:     projects,
		applications: applications,
		devices:      devices,
		releases:     releases,
		st:           st,
		connman:      connman,
	}
}

// [
//     {
//         "service": "prometheus",
//         "path": "/metrics",
//         "port": "2112",
//         "whitelist": [
//             {
//                 "metric": "go_threads",
//                 "labels": [
//                     "metrics"
//                 ],
//                 "tags": [
// 			"yeet"
// 		   ]
//             }
//         ]
//     }
// ]

func (r *Runner) Do(ctx context.Context) {
	projects, err := r.projects.ListProjects(ctx)
	if err != nil {
		log.WithError(err).Error("list projects")
		return
	}

	for _, project := range projects {
		if project.DatadogAPIKey == nil {
			continue
		}

		devices, err := r.devices.ListDevices(ctx, project.ID)
		if err != nil {
			log.WithError(err).Error("list devices")
			continue
		}

		var req datadog.PostMetricsRequest
		for _, device := range devices {
			req.Series = append(
				req.Series,
				r.getStateMetrics(&project, &device)...,
			)

			// If the device is offline, we can't get any more
			// metrics from it anyway
			if device.Status == models.DeviceStatusOffline {
				continue
			}

			req.Series = append(
				req.Series,
				r.getHostMetrics(ctx, &project, &device)...,
			)
		}

		m := r.getServiceMetrics(ctx, &project)
		req.Series = append(
			req.Series,
			m...,
		)

		fmt.Println("GOT METRICS")
		fmt.Println("SERVICE METRICS!")
		j, err := json.MarshalIndent(m, ">>>", "    ")
		fmt.Println(err)
		fmt.Println(string(j))

		client := datadog.NewClient(*project.DatadogAPIKey)
		if err := client.PostMetrics(ctx, req); err != nil {
			log.WithError(err).Error("post metrics")
			continue
		}
	}
}

func addedTags(project *models.Project, device *models.Device) []string {
	return []string{
		"project:" + project.Name,
		"device:" + device.Name,
	}
}

func (r *Runner) getStateMetrics(project *models.Project, device *models.Device) datadog.Series {
	addedTags := addedTags(project, device)

	stateMetrics := []datadog.Metric{
		datadog.Metric{
			Metric: "devices",
			Points: [][2]float32{
				[2]float32{
					float32(time.Now().Unix()),
					1,
				},
			},
			Type: "count",
			Tags: []string{"status:" + string(device.Status)},
		},
	}

	for i := range stateMetrics {
		// Project level metrics get the
		// "deviceplane.project." prefix.
		stateMetrics[i].Metric = "deviceplane.project." + stateMetrics[i].Metric
		stateMetrics[i].Tags = append(
			stateMetrics[i].Tags,
			addedTags...,
		)
	}

	return stateMetrics
}

func (r *Runner) getHostMetrics(ctx context.Context, project *models.Project, device *models.Device) datadog.Series {
	addedTags := addedTags(project, device)

	// Get metrics from host
	deviceMetricsResp, err := r.queryDevice(
		ctx,
		project,
		device,
		"/metrics",
	)
	if err != nil || deviceMetricsResp.StatusCode != 200 {
		return nil
	}
	r.st.Incr("runner.datadog.successful_host_metrics_pull", addedTags, 1)

	// Convert request to DataDog format
	metrics, err := translation.ConvertOpenMetricsToDataDog(deviceMetricsResp.Body)
	if err != nil {
		log.WithField("project_id", project.ID).
			WithField("device_id", device.ID).
			WithError(err).Error("parsing openmetrics")
		return nil
	}

	// Process metrics
	for i := range metrics {
		// Host metrics get the "deviceplane.host." prefix.
		metrics[i].Metric = "deviceplane.host." + metrics[i].Metric
		metrics[i].Tags = append(addedTags, metrics[i].Tags...)
	}
	return metrics
}

func (r *Runner) getServiceMetrics(ctx context.Context, project *models.Project) (metrics datadog.Series) {
	appServiceConfigs := r.getAppServiceConfigs(ctx, project)
	if len(appServiceConfigs) == 0 {
		return nil
	}

	devices, err := r.devices.ListDevices(ctx, project.ID)
	if err != nil {
		log.WithField("project", project.ID).WithError(err).Error("listing devices")
		return nil
	}

	// GET the metrics endpoint
	// ON ALL DEVICES that match this application
	//
	// TODO: if things start getting slow, the runtime of this function, and
	// specifically this following section should probably be optimized
	for _, device := range devices {
		// Add metrics for all services, in all apps, on all devices
		// O(s*a*d)
		for app, serviceConfigs := range appServiceConfigs {
			appIsScheduled, err := query.DeviceMatchesQuery(device, app.SchedulingRule)
			if err != nil {
				log.WithField("application", app.ID).
					WithField("device", device.ID).
					WithError(err).Error("evaluate application scheduling rule")
				continue
			}
			if !appIsScheduled {
				continue
			}

			for _, config := range serviceConfigs {
				// Get metrics from services
				deviceMetricsResp, err := r.queryDevice(
					ctx,
					project,
					&device,
					fmt.Sprintf(
						"/applications/%s/services/%s/metrics",
						app.ID, config.Service,
					),
				)
				if err != nil || deviceMetricsResp.StatusCode != 200 {
					r.st.Incr("runner.datadog.unsuccessful_service_metrics_pull", addedTags(project, &device), 1)
					// TODO: we want to present to the user a list
					// of applications that don't have functioning
					// endpoints
					if deviceMetricsResp != nil {
						fmt.Println(deviceMetricsResp.Status)
						fmt.Println(deviceMetricsResp.StatusCode)
					}
					continue
				}
				r.st.Incr("runner.datadog.successful_service_metrics_pull", addedTags(project, &device), 1)

				// Convert request to DataDog format
				serviceMetrics, err := translation.ConvertOpenMetricsToDataDog(deviceMetricsResp.Body)
				if err != nil {
					log.WithField("project_id", project.ID).
						WithField("device_id", device.ID).
						WithError(err).Error("parsing openmetrics")
					continue
				}

				addedMetrics := make(map[string]bool, len(serviceMetrics))
				allowedMetrics := []datadog.Metric{}
				for _, whitelistedMetric := range config.MetricWhitelist {
					for _, serviceMetric := range serviceMetrics {
						if addedMetrics[serviceMetric.Metric] {
							continue
						}

						// Add the tag if it's in the metrics list
						if strings.HasPrefix(serviceMetric.Metric, whitelistedMetric.Metric) {
							addedMetrics[serviceMetric.Metric] = true
							allowedMetric := serviceMetric

							// Service level metrics get the "deviceplane.service." prefix.
							allowedMetric.Metric = "deviceplane.service." + allowedMetric.Metric

							// Optional labels
							for _, label := range whitelistedMetric.Labels {
								labelValue, ok := device.Labels[label]
								if ok {
									allowedMetric.Tags = append(
										allowedMetric.Tags,
										"label."+label+":"+labelValue,
									)
								}
							}

							// Optional tags
							// kinda jank implementation
							addTag := func(tag string, value string) {
								allowedMetric.Tags = append(
									allowedMetric.Tags,
									fmt.Sprintf("tag.%s:%s", tag, value),
								)
							}
							for _, tag := range whitelistedMetric.Tags {
								switch tag {
								case "device":
									addTag(tag, device.Name)
								case "application":
									addTag(tag, app.Name)
								}
							}

							// Guaranteed tags
							allowedMetric.Tags = append(
								allowedMetric.Tags,
								"tag.project:"+project.Name,
							)

							allowedMetrics = append(allowedMetrics, allowedMetric)
						}
					}
				}

				metrics = append(metrics, allowedMetrics...)
			}
		}
	}

	return metrics
}
