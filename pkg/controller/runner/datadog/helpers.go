package datadog

import (
	"bufio"
	"context"
	"net/http"

	"github.com/deviceplane/deviceplane/pkg/models"
)

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
