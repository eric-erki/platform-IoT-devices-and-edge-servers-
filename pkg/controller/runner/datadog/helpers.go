package datadog

import (
	"fmt"

	"github.com/deviceplane/deviceplane/pkg/metrics/datadog"
	"github.com/deviceplane/deviceplane/pkg/models"
)

func addedInternalTags(project *models.Project, device *models.Device) []string {
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
		metricPrefix = "deviceplane.state."
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
