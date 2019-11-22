package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"

	"github.com/deviceplane/deviceplane/pkg/client"
	"github.com/deviceplane/deviceplane/pkg/interpolation"
	kingpin "gopkg.in/alecthomas/kingpin.v2"
)

func createApplicationFunc(c *kingpin.ParseContext) error {
	client := client.NewClient(*apiEndpointFlag, *accessKeyFlag, nil)
	application, err := client.CreateApplication(context.TODO(), *projectFlag, *applicationFlag)
	if err != nil {
		return err
	}

	fmt.Printf("Application %s successfully created at %s!\n", application.Name, application.CreatedAt.Format("Mon Jan _2 15:04:05 2006"))

	return nil
}

func deployApplicationFunc(c *kingpin.ParseContext) error {
	client := client.NewClient(*apiEndpointFlag, *accessKeyFlag, nil)
	yamlConfigBytes, err := ioutil.ReadFile(*deployFileArg)
	if err != nil {
		return err
	}

	finalYamlConfig, err := interpolation.Interpolate(string(yamlConfigBytes), os.Getenv)
	if err != nil {
		return err
	}

	release, err := client.CreateRelease(context.TODO(), *projectFlag, *applicationFlag, finalYamlConfig)
	if err != nil {
		return err
	}

	fmt.Printf("Latest release %s for application %s successfully released at %s!\n", release.ID, *applicationFlag, release.CreatedAt.Format("Mon Jan _2 15:04:05 2006"))

	return nil
}

func editApplicationConfigFunc(c *kingpin.ParseContext) error {
	client := client.NewClient(*apiEndpointFlag, *accessKeyFlag, nil)

	release, err := client.GetLatestRelease(context.TODO(), *projectFlag, *applicationFlag)
	if err != nil {
		return err
	}

	var yamlConfig string
	if release != nil {
		yamlConfig = release.RawConfig
	}

	tmpfile, err := ioutil.TempFile("", "")
	if err != nil {
		return err
	}
	defer os.Remove(tmpfile.Name())

	if _, err := tmpfile.Write([]byte(yamlConfig)); err != nil {
		return err
	}

	editor := os.Getenv("EDITOR")
	if editor == "" {
		editor = "vi"
	}

	cmd := exec.Command(editor, tmpfile.Name())
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err = cmd.Run(); err != nil {
		fmt.Println("Edit cancelled, no changes made.")
		return nil
	}

	if err := tmpfile.Close(); err != nil {
		return err
	}

	yamlConfigFile, err := os.Open(tmpfile.Name())
	if err != nil {
		return err
	}

	yamlConfigBytes, err := ioutil.ReadAll(yamlConfigFile)
	if err != nil {
		return err
	}

	release, err = client.CreateRelease(context.TODO(), *projectFlag, *applicationFlag, string(yamlConfigBytes))
	if err != nil {
		return err
	}

	fmt.Printf("Latest release %s for application %s successfully released at %s!\n", release.ID, *applicationFlag, release.CreatedAt.Format("Mon Jan _2 15:04:05 2006"))

	return nil
}
