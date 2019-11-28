package main

import (
	"context"
	"fmt"
	"io"
	"net"
	"os"
	"os/exec"
	"strconv"

	kingpin "gopkg.in/alecthomas/kingpin.v2"
)

func sshAction(c *kingpin.ParseContext) error {
	conn, err := apiClient.InitiateSSH(context.TODO(), *globalProjectFlag, *deviceFlag)
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
