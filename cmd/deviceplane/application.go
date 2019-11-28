package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"

	"github.com/deviceplane/deviceplane/pkg/interpolation"
	kingpin "gopkg.in/alecthomas/kingpin.v2"
)

var (
	applicationCmd = app.Command("application", "Manage applications.")
	_              = requireAccessKey(applicationCmd)
	_              = requireProject(applicationCmd)

	applicationListCmd = applicationCmd.Command("list", "List applications.")

	applicationCreateCmd = applicationCmd.Command("create", "Create a new application.")
	applicationArg       = applicationCreateCmd.Arg("application", "Application name.").Required().String()

	applicationEditCmd = applicationCmd.Command("edit", "Manually modify an application's latest release config.")

	applicationDeployCmd     = applicationCmd.Command("deploy", "Deploy an application from a yaml file.")
	applicationDeployFileArg = applicationDeployCmd.Arg("deployfile", "File path of the yaml file to deploy.").Required().ExistingFile()
)

func createApplicationFunc(c *kingpin.ParseContext) error {
	application, err := apiClient.CreateApplication(context.TODO(), *globalProjectFlag, *applicationArg)
	if err != nil {
		return err
	}

	fmt.Printf("Application %s successfully created at %s!\n", application.Name, application.CreatedAt.Format("Mon Jan _2 15:04:05 2006"))

	return nil
}

func deployApplicationFunc(c *kingpin.ParseContext) error {
	yamlConfigBytes, err := ioutil.ReadFile(*applicationDeployFileArg)
	if err != nil {
		return err
	}

	finalYamlConfig, err := interpolation.Interpolate(string(yamlConfigBytes), os.Getenv)
	if err != nil {
		return err
	}

	release, err := apiClient.CreateRelease(context.TODO(), *globalProjectFlag, *applicationArg, finalYamlConfig)
	if err != nil {
		return err
	}

	fmt.Printf("Latest release %s for application %s successfully released at %s!\n", release.ID, *applicationArg, release.CreatedAt.Format("Mon Jan _2 15:04:05 2006"))

	return nil
}

func editApplicationConfigFunc(c *kingpin.ParseContext) error {
	release, err := apiClient.GetLatestRelease(context.TODO(), *globalProjectFlag, *applicationArg)
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

	release, err = apiClient.CreateRelease(context.TODO(), *globalProjectFlag, *applicationArg, string(yamlConfigBytes))
	if err != nil {
		return err
	}

	fmt.Printf("Latest release %s for application %s successfully released at %s!\n", release.ID, *applicationArg, release.CreatedAt.Format("Mon Jan _2 15:04:05 2006"))

	return nil
}
