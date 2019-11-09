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
	"github.com/deviceplane/deviceplane/pkg/controller/store"
	"github.com/deviceplane/deviceplane/pkg/metrics/datadog"
	"github.com/deviceplane/deviceplane/pkg/metrics/datadog/translation"
	"github.com/deviceplane/deviceplane/pkg/models"
)

type Runner struct {
	projects store.Projects
	devices  store.Devices
	st       *statsd.Client
	connman  *connman.ConnectionManager
}

func NewRunner(projects store.Projects, devices store.Devices, st *statsd.Client, connman *connman.ConnectionManager) *Runner {
	return &Runner{
		projects: projects,
		devices:  devices,
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
