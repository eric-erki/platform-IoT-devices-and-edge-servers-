package project

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/deviceplane/deviceplane/cmd/deviceplane/cliutils"
	"github.com/hako/durafmt"
	kingpin "gopkg.in/alecthomas/kingpin.v2"
)

func projectListAction(c *kingpin.ParseContext) error {
	return errors.New("This requires a projects endpoint which we don't have yet")

	projects, err := config.APIClient.ListProjects(context.TODO(), *config.Flags.Project)
	if err != nil {
		return err
	}

	// TODO: serialize this properly
	if projectJSONOutputFlag != nil && *projectJSONOutputFlag == true {
		fmt.Printf("%+v\n", projects)
	} else {
		table := cliutils.DefaultTable()
		table.SetHeader([]string{"Name", "Description", "Created At"})
		for _, p := range projects {
			duration := durafmt.Parse(time.Now().Sub(p.CreatedAt)).LimitFirstN(2)
			table.Append([]string{p.Name, duration.String() + " ago"})
		}
		table.Render()
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
