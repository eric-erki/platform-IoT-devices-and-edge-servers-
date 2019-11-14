package datadog

import (
	"bufio"
	"context"
	"net/http"

	"github.com/apex/log"
	"github.com/deviceplane/deviceplane/pkg/controller/store"
	"github.com/deviceplane/deviceplane/pkg/models"
)

type appServiceConfigs map[*models.Application][]*models.ServiceMetricConfig

func (r *Runner) getAppServiceConfigs(ctx context.Context, project *models.Project) (configs appServiceConfigs) {
	applications, err := r.applications.ListApplications(ctx, project.ID)
	if err != nil {
		log.WithField("project", project.ID).WithError(err).Error("listing applications")
		return nil
	}

	configs = make(appServiceConfigs, len(applications))

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
			_, ok := release.Config[serviceMetricConfig.Service]
			if ok {
				configs[&applications[i]] = append(configs[&applications[i]], &serviceMetricConfigs[j])
			} else {
				// we don't do anything here, but we should
				// TODO: we want to present to the user a list
				// of mistyped applications that don't exist
			}
		}
	}

	return configs
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
		return resp, err
	}

	return resp, nil
}
