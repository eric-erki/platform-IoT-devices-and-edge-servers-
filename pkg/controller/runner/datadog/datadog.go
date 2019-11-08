package datadog

import (
	"bufio"
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/apex/log"

	"github.com/deviceplane/deviceplane/pkg/controller/connman"
	"github.com/deviceplane/deviceplane/pkg/controller/store"
)

type Runner struct {
	projects store.Projects
	devices  store.Devices
	connman  *connman.ConnectionManager
}

func NewRunner(projects store.Projects, devices store.Devices, connman *connman.ConnectionManager) *Runner {
	return &Runner{
		projects: projects,
		devices:  devices,
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

		var req postMetricsRequest
		for _, device := range devices {
			addedTags := []string{
				strings.Join([]string{"project", project.Name}, ":"),
				strings.Join([]string{"name", device.Name}, ":"),
			}

			req.Series = append(req.Series, metric{
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
			if err != nil {
				log.WithField("project_id", project.ID).
					WithField("device_id", device.ID).
					WithError(err).Error("getting device metrics")
				continue // in the devices loop, so we still submit previously added metrics
			}
			if deviceMetricsResp.StatusCode != 200 {
				log.WithField("project_id", project.ID).
					WithField("device_id", device.ID).
					WithField("status", deviceMetricsResp.Status).
					WithField("status_code", deviceMetricsResp.StatusCode).
					Error("non-200 device metric status code")
				continue
			}

			// Convert request to DataDog format
			metrics, err := convertOpenMetricsToDataDog(deviceMetricsResp.Body)
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

		client := newClient(*project.DatadogAPIKey)

		if err := client.postMetrics(ctx, req); err != nil {
			log.WithError(err).Error("post metrics")
			continue
		}
	}
}
