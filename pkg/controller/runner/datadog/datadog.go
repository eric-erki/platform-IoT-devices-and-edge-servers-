package datadog

import (
	"bufio"
	"context"
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
	"github.com/deviceplane/deviceplane/pkg/spec"
	"gopkg.in/yaml.v2"
)

type Runner struct {
	projects store.Projects
	devices  store.Devices
	releases store.Releases
	st       *statsd.Client
	connman  *connman.ConnectionManager
}

func NewRunner(projects store.Projects, devices store.Devices, releases store.Releases, st *statsd.Client, connman *connman.ConnectionManager) *Runner {
	return &Runner{
		projects: projects,
		devices:  devices,
		releases: releases,
		st:       st,
		connman:  connman,
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
			addedTags := []string{
				strings.Join([]string{"project", project.Name}, ":"),
				strings.Join([]string{"device", device.Name}, ":"),
			}

			req.Series = append(req.Series, datadog.Metric{
				// Project level metrics get the
				// "deviceplane.project." prefix.
				Metric: "deviceplane.project.devices",
				Points: [][2]float32{
					[2]float32{float32(time.Now().Unix()), 1},
				},
				Type: "count",
				Tags: append(addedTags, []string{
					strings.Join([]string{"status", string(device.Status)}, ":"),
				}...),
			})

			// If the device is offline, we can't get any more
			// metrics from it anyway
			if device.Status == models.DeviceStatusOffline {
				continue
			}

			// Do the following for all applications
			// Do the following for all services?

			// Get metrics from prometheus
			getDeviceMetrics := func() (*http.Response, error) {
				deviceConn, err := r.connman.Dial(ctx, project.ID+device.ID)
				if err != nil {
					return nil, err
				}
				deviceMetricsReq, _ := http.NewRequest("GET", "/metrics", nil)
				if err := deviceMetricsReq.Write(deviceConn); err != nil {
					return nil, err
				}
				deviceMetricsResp, err := http.ReadResponse(bufio.NewReader(deviceConn), deviceMetricsReq)
				if err != nil {
					return nil, err
				}
				return deviceMetricsResp, nil
			}
			deviceMetricsResp, err := getDeviceMetrics()
			if err != nil || deviceMetricsResp.StatusCode != 200 {
				continue // in the devices loop, so we still submit previously added metrics
			}
			r.st.Incr("runner.datadog.successful_device_metrics_pull", addedTags, 1)

			// Convert request to DataDog format
			metrics, err := translation.ConvertOpenMetricsToDataDog(deviceMetricsResp.Body)
			if err != nil {
				log.WithField("project_id", project.ID).
					WithField("device_id", device.ID).
					WithError(err).Error("parsing openmetrics")
				continue
			}

			// Append metrics
			for i := range metrics {
				// Device level metrics get the "deviceplane.device." prefix.
				metrics[i].Metric = "deviceplane.device." + metrics[i].Metric
				metrics[i].Tags = append(addedTags, metrics[i].Tags...)
				req.Series = append(req.Series, metrics[i])
			}
		}

		client := datadog.NewClient(*project.DatadogAPIKey)
		if err := client.PostMetrics(ctx, req); err != nil {
			log.WithError(err).Error("post metrics")
			continue
		}
	}
}

func (r *Runner) getServicesToQuery(ctx context.Context, project *models.Project, device *models.Device, applications []*models.Application) error {
	releasesToQuery := make([]*models.Release, 0)

	for _, application := range applications {
		match, err := query.DeviceMatchesQuery(*device, application.SchedulingRule)
		if err != nil {
			log.WithError(err).Error("evaluate application scheduling rule")
			return err
		}
		if !match {
			continue
		}

		release, err := r.releases.GetLatestRelease(ctx, project.ID, application.ID)
		if err == store.ErrReleaseNotFound {
			continue
		} else if err != nil {
			log.WithError(err).Error("get latest release")
			return err
		}

		releasesToQuery := append(releasesToQuery, release)
	}

	for _, release := range releasesToQuery {
		var applicationConfig map[string]spec.Service
		if err := yaml.Unmarshal([]byte(release.Config), &applicationConfig); err != nil {
			log.WithError(err).Error("unmarshal")
			return err
		}

		serviceNames := make(map[string]struct{})
		for serviceName, service := range applicationConfig {
			service.
				serviceSupervisor.SetService(release.ID, service)

			serviceNames[serviceName] = struct{}{}
		}
	}

	return nil
}
