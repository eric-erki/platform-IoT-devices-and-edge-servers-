package project

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/deviceplane/deviceplane/cmd/deviceplane/cliutils"
	"github.com/hako/durafmt"
	kingpin "gopkg.in/alecthomas/kingpin.v2"
	"gopkg.in/yaml.v2"
)

func projectListAction(c *kingpin.ParseContext) error {
	projects, err := config.APIClient.ListProjects(context.TODO(), *config.Flags.Project)
	if err != nil {
		return err
	}

	switch *projectOutputFlag {
	case cliutils.FormatTable:
		table := cliutils.DefaultTable()
		table.SetHeader([]string{"Name", "Devices", "Applications", "Created At"})
		for _, p := range projects {
			duration := durafmt.Parse(time.Now().Sub(p.CreatedAt)).LimitFirstN(2)
			table.Append([]string{
				p.Name,
				fmt.Sprintf("%d", p.DeviceCounts.AllCount),
				fmt.Sprintf("%d", p.ApplicationCounts.AllCount),
				duration.String() + " ago",
			})
		}
		table.Render()

	case cliutils.FormatYAML:
		bytes, err := yaml.Marshal(projects)
		if err != nil {
			return err
		}
		fmt.Println(string(bytes))

	case cliutils.FormatJSON:
		bytes, err := json.Marshal(projects)
		if err != nil {
			return err
		}
		fmt.Println(string(bytes))
	}

	return nil
}

func projectCreateAction(c *kingpin.ParseContext) error {
	project, err := config.APIClient.CreateProject(context.TODO(), *config.Flags.Project)
	if err != nil {
		return err
	}

	fmt.Printf("Project %s successfully created at %s!\n", project.Name, project.CreatedAt.Format("Mon Jan _2 15:04:05 2006"))

	return nil
}
