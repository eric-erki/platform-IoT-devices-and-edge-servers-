package datadog

import (
	"context"
	"fmt"
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
	projects            store.Projects
	applications        store.Applications
	devices             store.Devices
	releases            store.Releases
	metricTargetConfigs store.MetricTargetConfigs
	st                  *statsd.Client
	connman             *connman.ConnectionManager
}

func NewRunner(projects store.Projects, applications store.Applications, releases store.Releases, devices store.Devices, metricTargetConfigs store.MetricTargetConfigs, st *statsd.Client, connman *connman.ConnectionManager) *Runner {
	return &Runner{
		projects:            projects,
		applications:        applications,
		devices:             devices,
		releases:            releases,
		metricTargetConfigs: metricTargetConfigs,
		st:                  st,
		connman:             connman,
	}
}

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
				r.getStateMetrics(ctx, &project, &device)...,
			)

			// If the device is offline, we can't get any more
			// metrics from it anyway
			if device.Status != models.DeviceStatusOnline {
				continue
			}

			req.Series = append(
				req.Series,
				r.getHostMetrics(ctx, &project, &device)...,
			)

		}

		req.Series = append(
			req.Series,
			r.getServiceMetrics(ctx, &project)...,
		)

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

func getFilteredMetrics(
	project *models.Project,
	app *models.Application,
	device *models.Device,
	targetType models.MetricTargetType,
	config models.MetricConfig,
	metrics []datadog.Metric,
) []datadog.Metric {
	var metricPrefix = "deviceplane."
	switch targetType {
	case models.MetricHostTargetType:
		metricPrefix = "deviceplane.host."
	case models.MetricServiceTargetType:
		metricPrefix = "deviceplane.service."
	case models.MetricStateTargetType:
		metricPrefix = "deviceplane.host."
	default:
		metricPrefix += "unknown"
	}
	metricPrefix += "."

	returnedMetrics := make([]datadog.Metric, 0)
	returnedMetricsLookup := make(map[string]bool, len(metrics))

	for _, metricConfig := range config.Metrics {
		for _, m := range metrics {
			if returnedMetricsLookup[m.Metric] {
				continue
			}
			if m.Metric == metricConfig.Metric {
				returnedMetricsLookup[m.Metric] = true

				m.Metric = metricPrefix + m.Metric

				addTag := func(prefix string, tag string, value string) {
					m.Tags = append(
						m.Tags,
						fmt.Sprintf("%s.%s:%s", prefix, tag, value),
					)
				}

				// Optional labels
				for _, label := range metricConfig.Labels {
					labelValue, ok := device.Labels[label]
					if ok {
						addTag("label", label, labelValue)
					}
				}

				// Optional tags
				// implementation could be less manual
				for _, tag := range metricConfig.Tags {
					switch tag {
					case "device":
						addTag("tag", tag, device.Name)
					case "application":
						addTag("tag", tag, app.Name)
					}
				}

				// Guaranteed tags
				addTag("tag", "project", project.Name)
				returnedMetrics = append(returnedMetrics, m)
			}
		}
	}

	return returnedMetrics
}

func (r *Runner) getStateMetrics(ctx context.Context, project *models.Project, device *models.Device) datadog.Series {
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

	metricConfig, err := r.metricTargetConfigs.LookupMetricTargetConfig(ctx, project.ID, string(models.MetricStateTargetType))
	if err != nil || metricConfig == nil {
		log.WithField("project_id", project.ID).
			WithError(err).Error("getting state metric config")
		return nil
	}

	if len(metricConfig.Configs) == 0 {
		return nil
	}

	config := metricConfig.Configs[0]
	return getFilteredMetrics(project, nil, device, metricConfig.Type, config, stateMetrics)
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

	// Get metrics config
	metricConfig, err := r.metricTargetConfigs.LookupMetricTargetConfig(ctx, project.ID, string(models.MetricHostTargetType))
	if err != nil || metricConfig == nil {
		log.WithField("project_id", project.ID).
			WithError(err).Error("getting host metric config")
		return nil
	}

	if len(metricConfig.Configs) == 0 {
		return nil
	}

	config := metricConfig.Configs[0]
	return getFilteredMetrics(project, nil, device, metricConfig.Type, config, metrics)
}

func (r *Runner) getServiceMetrics(ctx context.Context, project *models.Project) (metrics datadog.Series) {
	// Get metrics config
	metricConfig, err := r.metricTargetConfigs.LookupMetricTargetConfig(ctx, project.ID, string(models.MetricServiceTargetType))
	if err != nil || metricConfig == nil {
		log.WithField("project_id", project.ID).
			WithError(err).Error("getting service metric config")
		return nil
	}

	if len(metricConfig.Configs) == 0 {
		return nil
	}

	// Add apps to map by ID
	// Add services to map by name
	apps, err := r.applications.ListApplications(ctx, project.ID)
	if err != nil {
		log.WithField("project", project.ID).WithError(err).Error("listing applications")
		return nil
	}
	appsByID := make(map[string]*models.Application, len(apps))
	latestAppReleaseByAppID := make(map[string]*models.Release, len(apps))
	for i, app := range apps {
		appsByID[app.ID] = &apps[i]

		release, err := r.releases.GetLatestRelease(ctx, project.ID, app.ID)
		if err == store.ErrReleaseNotFound {
			continue
		} else if err != nil {
			log.WithField("application", app.ID).
				WithError(err).Error("get latest release")
			continue
		}

		latestAppReleaseByAppID[app.ID] = release
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
		if device.Status != models.DeviceStatusOnline {
			continue
		}

		appIsScheduled := map[string]bool{} // we have denormalized (app, serv), (app, serv2) tuples in metricConfig.Configs
		for _, config := range metricConfig.Configs {
			if config.Params == nil {
				continue
			}

			app, exists := appsByID[config.Params.ApplicationID]
			if !exists {
				continue
			}

			scheduled, exists := appIsScheduled[app.ID]
			if !exists {
				var err error
				scheduled, err = query.DeviceMatchesQuery(device, app.SchedulingRule)
				if err != nil {
					log.WithField("application", app.ID).
						WithField("device", device.ID).
						WithError(err).Error("evaluate application scheduling rule")
					scheduled = false
				}
				appIsScheduled[app.ID] = scheduled
			}
			if !scheduled {
				continue
			}

			release, exists := latestAppReleaseByAppID[app.ID]
			if !exists {
				continue
			}

			_, exists = release.Config[config.Params.Service]
			if !exists {
				continue
			}

			// Get metrics from services
			deviceMetricsResp, err := r.queryDevice(
				ctx,
				project,
				&device,
				fmt.Sprintf(
					"/applications/%s/services/%s/metrics",
					app.ID, config.Params.Service,
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

			metrics = append(
				metrics,
				getFilteredMetrics(project, app, &device, metricConfig.Type, config, serviceMetrics)...,
			)
		}
	}

	return metrics
}
