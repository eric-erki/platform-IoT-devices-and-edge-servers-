package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"time"

	"github.com/deviceplane/deviceplane/pkg/interpolation"
	"github.com/hako/durafmt"
	kingpin "gopkg.in/alecthomas/kingpin.v2"
)

var (
	applicationCmd = app.Command("application", "Manage applications.")
	_              = requireAccessKey(applicationCmd)
	_              = requireProject(applicationCmd)

	applicationListCmd = applicationCmd.Command("list", "List applications.")
	_                  = applicationListCmd.Action(applicationListFunc)

	applicationCreateCmd = applicationCmd.Command("create", "Create a new application.")
	_                    = applicationCreateCmd.Action(applicationCreateFunc)

	applicationEditCmd = applicationCmd.Command("edit", "Manually modify an application's latest release config.")
	_                  = applicationEditCmd.Action(applicationEditFunc)

	applicationViewCmd = applicationCmd.Command("view", "View an application's latest release config.")
	_                  = applicationViewCmd.Action(applicationViewFunc)

	applicationDeployCmd = applicationCmd.Command("deploy", "Deploy an application from a yaml file.")
	_                    = applicationDeployCmd.Action(applicationDeployFunc)

	applicationArg *string = &[]string{""}[0] // Required so kingpin doesn't crash when setting
	_                      = func() error {
		for _, cmd := range []*kingpin.CmdClause{
			applicationCreateCmd,
			applicationEditCmd,
			applicationViewCmd,
			applicationDeployCmd,
		} {
			arg := cmd.Arg("application", "Application name.").Required()
			arg.StringVar(applicationArg)
			arg.HintAction(func() []string {
				ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
				defer cancel()

				applications, err := apiClient.ListApplications(ctx, *globalProjectFlag)
				if err != nil {
					return []string{}
				}

				names := make([]string, len(applications))
				for _, app := range applications {
					names = append(names, app.Name)
				}
				return names
			})
		}
		return nil
	}()

	// We want this to come after the "application" argument
	applicationDeployFileArg = applicationDeployCmd.Arg("file", "File path of the yaml file to deploy.").Required().ExistingFile()

	// TODO: check if we changed this to "raw" or "r" (can also add all three...):
	applicationJSONViewFlag *bool = &[]bool{false}[0]
	_                             = func() error {
		for _, cmd := range []*kingpin.CmdClause{
			applicationListCmd,
			applicationViewCmd,
		} {
			cmd.Flag("json", "View JSON output.").BoolVar(applicationJSONViewFlag)
		}
		return nil
	}()
)

func applicationListFunc(c *kingpin.ParseContext) error {
	applications, err := apiClient.ListApplications(context.TODO(), *globalProjectFlag)
	if err != nil {
		return err
	}

	if applicationJSONViewFlag != nil && *applicationJSONViewFlag == true {
		fmt.Printf("%+v\n", applications)
	} else {
		table.SetHeader([]string{"Name", "Description", "Created At"})
		for _, app := range applications {
			duration := durafmt.Parse(time.Now().Sub(app.CreatedAt)).LimitFirstN(2)
			table.Append([]string{app.Name, app.Description, duration.String() + " ago"})
		}
		table.Render()
	}

	return nil
}

func applicationCreateFunc(c *kingpin.ParseContext) error {
	application, err := apiClient.CreateApplication(context.TODO(), *globalProjectFlag, *applicationArg)
	if err != nil {
		return err
	}

	fmt.Printf("Application %s successfully created at %s!\n", application.Name, application.CreatedAt.Format("Mon Jan _2 15:04:05 2006"))

	return nil
}

func applicationDeployFunc(c *kingpin.ParseContext) error {
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

func applicationViewFunc(c *kingpin.ParseContext) error {
	release, err := apiClient.GetLatestRelease(context.TODO(), *globalProjectFlag, *applicationArg)
	if err != nil {
		return err
	}

	var jsonConfig interface{}
	var yamlConfig string
	if release != nil {
		jsonConfig = release.Config
		yamlConfig = release.RawConfig
	}

	// TODO: properly serialize
	if applicationJSONViewFlag != nil && *applicationJSONViewFlag == true {
		jsonBytes, err := json.Marshal(jsonConfig)
		if err != nil {
			return err
		}
		fmt.Println(string(jsonBytes))
	} else {
		fmt.Println(yamlConfig)
	}

	return nil
}

func applicationEditFunc(c *kingpin.ParseContext) error {
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
