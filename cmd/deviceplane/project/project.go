package project

import (
	"context"
	"errors"
	"fmt"

	kingpin "gopkg.in/alecthomas/kingpin.v2"
)

func projectListAction(c *kingpin.ParseContext) error {
	return errors.New("NOT IMPLEMENTED YET")
}

func projectCreateAction(c *kingpin.ParseContext) error {
	project, err := config.APIClient.CreateProject(context.TODO(), *config.Flags.Project)
	if err != nil {
		return err
	}

	fmt.Printf("Project %s successfully created at %s!\n", project.Name, project.CreatedAt.Format("Mon Jan _2 15:04:05 2006"))

	return nil
}
