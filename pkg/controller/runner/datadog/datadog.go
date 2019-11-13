package datadog

import (
	"bufio"
	"context"
	"fmt"
	"net/http"
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

type applicationServiceMetricConfig struct {
	Application         *models.Application
	ServiceMetricConfig *models.ServiceMetricConfig
}

func (r *Runner) getServiceMetrics(ctx context.Context, project *models.Project) (metrics datadog.Series) {
	applications, err := r.applications.ListApplications(ctx, project.ID)
	if err != nil {
		log.WithField("project", project.ID).WithError(err).Error("listing applications")
		return nil
	}

	asmcs := []applicationServiceMetricConfig{}
	// Get the application+service metric configs
	for i, application := range applications {
		release, err := r.releases.GetLatestRelease(ctx, project.ID, application.ID)
		if err == store.ErrReleaseNotFound {
			continue
		} else if err != nil {
			log.WithField("application", application.ID).
				WithError(err).Error("get latest release")
			return nil
		}

		serviceMetricConfigs := application.ServiceMetricConfigs
		for j, serviceMetricConfig := range serviceMetricConfigs {
			config := applicationServiceMetricConfig{
				&applications[i],
				&serviceMetricConfigs[j],
			}

			_, ok := release.Config[serviceMetricConfig.ServiceName]
			if ok {
				asmcs = append(asmcs, config)
			} else {
				// we don't do anything here, but we should
				// TODO: we want to present to the user a list
				// of mistyped applications that don't exist
			}
		}
	}

	devices, err := r.devices.ListDevices(ctx, project.ID)
	if err != nil {
		log.WithField("project", project.ID).WithError(err).Error("listing devices")
		return nil
	}

	// GET the metrics endpoint
	// ON ALL DEVICES that match this application
	//
	// This backwards-matching O(m*n) approach is unfortunately what we're
	// stuck doing unless we store the list of scheduled applications on the
	// device table
	for _, device := range devices {
		for _, asmc := range asmcs {
			match, err := query.DeviceMatchesQuery(device, asmc.Application.SchedulingRule)
			if err != nil {
				log.WithField("application", asmc.Application.ID).
					WithField("device", device.ID).
					WithError(err).Error("evaluate application scheduling rule")
				continue
			}
			if !match {
				continue
			}

			// Get metrics from services
			deviceMetricsResp, err := r.queryDevice(
				ctx,
				project,
				&device,
				fmt.Sprintf(
					"/applications/%s/services/%s/metrics",
					asmc.Application.ID, asmc.ServiceMetricConfig.ServiceName,
				),
			)
			if err != nil || deviceMetricsResp.StatusCode != 200 {
				r.st.Incr("runner.datadog.unsuccessful_service_metrics_pull", addedTags(project, &device), 1)
				// TODO: we want to present to the user a list
				// of applications that don't have functioning
				// endpoints
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

			allowedMetrics := []datadog.Metric{}
			for _, whitelistedMetric := range asmc.ServiceMetricConfig.MetricWhitelist {
				for _, serviceMetric := range serviceMetrics {
					if strings.HasPrefix(serviceMetric.Metric, whitelistedMetric.MetricName) {
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
						for _, tag := range whitelistedMetric.Tags {
							if tag == "deviceID" {
								allowedMetric.Tags = append(
									allowedMetric.Tags,
									"tag."+tag+":"+device.ID,
								)
							}
						}

						// Guaranteed tags
						allowedMetric.Tags = append(
							allowedMetric.Tags,
							"tag.projectID:"+project.ID,
						)
						allowedMetric.Tags = append(
							allowedMetric.Tags,
							"tag.applicationID:"+asmc.Application.ID,
						)

						allowedMetrics = append(allowedMetrics, allowedMetric)
					}
				}
			}

			metrics = append(metrics, allowedMetrics...)
		}
	}

	return metrics
}

func (r *Runner) queryDevice(ctx context.Context, project *models.Project, device *models.Device, url string) (*http.Response, error) {
	deviceConn, err := r.connman.Dial(ctx, project.ID+device.ID)
	if err != nil {
		return nil, err
	}

	req, _ := http.NewRequest(
		"GET",
		url,
		nil,
	)

	if err := req.Write(deviceConn); err != nil {
		return nil, err
	}

	resp, err := http.ReadResponse(bufio.NewReader(deviceConn), req)
	if err != nil {
		return nil, err
	}

	return resp, nil
}
