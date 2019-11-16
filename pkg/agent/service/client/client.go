package client

import (
	"bufio"
	"fmt"
	"io"
	"net"
	"net/http"
)

func GetDeviceMetrics(deviceConn net.Conn) (*http.Response, error) {
	req, _ := http.NewRequest(
		"GET",
		"/metrics",
		nil,
	)

	if err := req.Write(deviceConn); err != nil {
		return nil, err
	}

	return http.ReadResponse(bufio.NewReader(deviceConn), req)
}

func GetServiceMetrics(deviceConn net.Conn, applicationId, service string) (*http.Response, error) {
	req, _ := http.NewRequest(
		"GET",
		fmt.Sprintf(
			"/applications/%s/services/%s/metrics",
			applicationId, service,
		),
		nil,
	)

	if err := req.Write(deviceConn); err != nil {
		return nil, err
	}

	return http.ReadResponse(bufio.NewReader(deviceConn), req)
}

func InitiateSSH(deviceConn net.Conn) error {
	req, _ := http.NewRequest("POST", "/ssh", nil)
	return req.Write(deviceConn)
}

func ExecuteCommand(deviceConn net.Conn, command io.ReadCloser, background bool) (*http.Response, error) {
	// TODO: build a proper client for this API
	req, _ := http.NewRequest("POST", "/execute", command)

	if background {
		query := req.URL.Query()
		query.Add("background", "")
		req.URL.RawQuery = query.Encode()
	}

	if err := req.Write(deviceConn); err != nil {
		return nil, err
	}

	resp, err := http.ReadResponse(bufio.NewReader(deviceConn), req)
	if err != nil {
		return nil, err
	}
	return resp, nil
}
