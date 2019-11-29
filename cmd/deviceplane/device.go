package main

import (
	"context"
	"fmt"
	"io"
	"net"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"

	"github.com/hako/durafmt"
	kingpin "gopkg.in/alecthomas/kingpin.v2"
)

var (
	deviceCmd = app.Command("device", "Manage devices.")

	deviceListCmd = deviceCmd.Command("list", "List devices.")
	_             = deviceListCmd.Action(deviceListAction)

	deviceMetricsCmd = deviceCmd.Command("metrics", "Get device metrics.")

	deviceMetricsHostCmd = deviceMetricsCmd.Command("host", "Get metrics on the device itself.")
	_                    = addDeviceArg(deviceMetricsHostCmd)
	_                    = deviceMetricsHostCmd.Action(deviceHostMetricsAction)

	deviceMetricsServiceCmd     = deviceMetricsCmd.Command("service", "Get the metrics from a service running on the device.")
	deviceMetricsServiceArg     = deviceMetricsServiceCmd.Arg("application", "The application under which the service is running.").Required().String()
	deviceMetricsApplicationArg = deviceMetricsServiceCmd.Arg("service", "The name of the service which is exposing a metrics endpoint.").Required().String()
	_                           = addDeviceArg(deviceMetricsServiceCmd)
	_                           = deviceMetricsServiceCmd.Action(deviceServiceMetricsAction)

	// Global and device-level commands
	sshTimeoutFlag *int = &[]int{0}[0]
	_                   = func() error {
		globalAndCategorizedCmd(app, deviceCmd, func(attachmentPoint hasCommand) {
			deviceSSHCmd := attachmentPoint.Command("ssh", "SSH into a device.")
			addDeviceArg(deviceSSHCmd)
			deviceSSHCmd.Flag("timeout", "Maximum length to attempt establishing a connection.").Default("60").IntVar(sshTimeoutFlag)
			deviceSSHCmd.Action(deviceSSHAction)
		})
		return nil
	}()

	deviceArg    *string = &[]string{""}[0]
	addDeviceArg         = func(cmd *kingpin.CmdClause) *kingpin.ArgClause {
		arg := cmd.Arg("device", "Device name.").Required()
		arg.StringVar(deviceArg)
		arg.HintAction(func() []string {
			ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
			defer cancel()

			devices, err := apiClient.ListDevices(ctx, *globalProjectFlag)
			if err != nil {
				return []string{}
			}

			names := make([]string, len(devices))
			for _, d := range devices {
				names = append(names, d.Name)
			}
			return names
		})
		return arg
	}
)

func deviceListAction(c *kingpin.ParseContext) error {
	devices, err := apiClient.ListDevices(context.TODO(), *globalProjectFlag)
	if err != nil {
		return err
	}

	// TODO: add JSON flag here
	// fmt.Printf("%+v\n", devices)

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

	return nil
}

func deviceHostMetricsAction(c *kingpin.ParseContext) error {
	fmt.Println("NOT IMPLEMENTED YET")
	return nil
}

func deviceServiceMetricsAction(c *kingpin.ParseContext) error {
	fmt.Println("NOT IMPLEMENTED YET")
	return nil
}

func deviceSSHAction(c *kingpin.ParseContext) error {
	conn, err := apiClient.InitiateSSH(context.TODO(), *globalProjectFlag, *deviceArg)
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
