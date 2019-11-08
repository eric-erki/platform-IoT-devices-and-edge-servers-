package datadog

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
)

type postMetricsRequest struct {
	Series series `json:"series"`
}

type series []metric

type metric struct {
	Metric   string       `json:"metric"`
	Points   [][2]float32 `json:"points"`
	Type     string       `json:"type"`
	Interval *int64       `json:"interval,omitempty"`
	Host     string       `json:"host,omitempty"`
	Tags     []string     `json:"tags"`
}

type client struct {
	apiKey string
}

func newClient(apiKey string) *client {
	return &client{
		apiKey: apiKey,
	}
}

func (c *client) postMetrics(ctx context.Context, req postMetricsRequest) error {
	reqBytes, err := json.Marshal(req)
	if err != nil {
		return err
	}

	resp, err := http.Post(
		fmt.Sprintf("https://api.datadoghq.com/api/v1/series?api_key=%s", c.apiKey),
		"application/json", bytes.NewBuffer(reqBytes),
	)
	if err != nil {
		return err
	}

	return resp.Body.Close()
}
