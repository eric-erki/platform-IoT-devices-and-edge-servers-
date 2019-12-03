package device

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"

	"github.com/deviceplane/deviceplane/cmd/deviceplane/cliutils"

	"github.com/hako/durafmt"
	kingpin "gopkg.in/alecthomas/kingpin.v2"
	"gopkg.in/yaml.v2"
)

func deviceListAction(c *kingpin.ParseContext) error {
	devices, err := config.APIClient.ListDevices(context.TODO(), *config.Flags.Project)
	if err != nil {
		return err
	}

	switch *deviceOutputFlag {
	case cliutils.FormatTable:
		table := cliutils.DefaultTable()
		table.SetHeader([]string{"Name", "Status", "IP", "OS", "Labels", "Last Seen", "Created"})
		for _, d := range devices {
			created := durafmt.Parse(time.Now().Sub(d.CreatedAt)).LimitFirstN(2)
			lastSeen := durafmt.Parse(time.Now().Sub(d.LastSeenAt)).LimitFirstN(2)

			labelsArr := make([]string, len(d.Labels))
			i := 0
			for k, v := range d.Labels {
				labelsArr[i] = fmt.Sprintf("%s:%s", k, v)
				i += 1
			}
			labelsStr := strings.Join(labelsArr, "\n")

			table.Append([]string{
				d.Name,
				string(d.Status),
				d.Info.IPAddress,
				d.Info.OSRelease.Name,
				labelsStr,
				lastSeen.String() + " ago",
				created.String() + " ago",
			})
		}
		table.Render()

	case cliutils.FormatYAML:
		bytes, err := yaml.Marshal(devices)
		if err != nil {
			return err
		}
		fmt.Println(string(bytes))

	case cliutils.FormatJSON:
		bytes, err := json.Marshal(devices)
		if err != nil {
			return err
		}
		fmt.Println(string(bytes))
	}

	return nil
}

func deviceInspectAction(c *kingpin.ParseContext) error {
	device, err := config.APIClient.GetDevice(context.TODO(), *config.Flags.Project, *deviceArg)
	if err != nil {
		return err
	}

	switch *deviceOutputFlag {
	case cliutils.FormatYAML:
		bytes, err := yaml.Marshal(device)
		if err != nil {
			return err
		}
		fmt.Println(string(bytes))

	case cliutils.FormatJSON:
		bytes, err := json.Marshal(device)
		if err != nil {
			return err
		}
		fmt.Println(string(bytes))
	}
	return nil
}

func deviceHostMetricsAction(c *kingpin.ParseContext) error {
	metrics, err := config.APIClient.GetDeviceHostMetrics(context.TODO(), *config.Flags.Project, *deviceArg)
	if err != nil {
		return err
	}

	fmt.Println(*metrics)
	return nil
}

func deviceServiceMetricsAction(c *kingpin.ParseContext) error {
	metrics, err := config.APIClient.GetDeviceServiceMetrics(context.TODO(), *config.Flags.Project, *deviceArg, *deviceMetricsApplicationArg, *deviceMetricsServiceArg)
	if err != nil {
		return err
	}

	fmt.Println(*metrics)
	return nil
}

func deviceSSHAction(c *kingpin.ParseContext) error {
	conn, err := config.APIClient.InitiateSSH(context.TODO(), *config.Flags.Project, *deviceArg)
	if err != nil {
		return err
	}

	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return err
	}
	defer listener.Close()

	var errChan = make(chan error, 2)

	go func() {
		localConn, err := listener.Accept()
		if err != nil {
			select {
			case e, open := <-errChan:
				if !open {
					return
				}
				errChan <- e
				return
			default:
			}

			errChan <- err
			return
		}

		go io.Copy(conn, localConn)
		io.Copy(localConn, conn)

		return
	}()

	go func() {
		defer conn.Close()

		port := strconv.Itoa(listener.Addr().(*net.TCPAddr).Port)

		var trailingArgs = []string{}
		nextArg := c.Next()
		for nextArg != nil && nextArg.Value != "" {
			trailingArgs = append(trailingArgs, nextArg.Value)
		}

		sshArguments := append([]string{
			"-p", port,
			"-o",
			"NoHostAuthenticationForLocalhost yes",
			"127.0.0.1",
			"-o",
			fmt.Sprintf("ConnectTimeout=%d", *sshTimeoutFlag),
		}, trailingArgs...)

		cmd := exec.Command(
			"ssh",
			sshArguments...,
		)
		cmd.Stdin = os.Stdin
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		if err := cmd.Run(); err != nil {
			if exitError, ok := err.(*exec.ExitError); ok {
				os.Exit(exitError.ExitCode())
				return
			}
			errChan <- err
			return
		}

		close(errChan)
	}()

	return <-errChan
}
