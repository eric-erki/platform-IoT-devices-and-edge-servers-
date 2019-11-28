package main

import (
	"context"
	"fmt"

	kingpin "gopkg.in/alecthomas/kingpin.v2"
)

func createProjectAction(c *kingpin.ParseContext) error {
	project, err := apiClient.CreateProject(context.TODO(), *globalProjectFlag)
	if err != nil {
		return err
	}

	fmt.Printf("Project %s successfully created at %s!\n", project.Name, project.CreatedAt.Format("Mon Jan _2 15:04:05 2006"))

	return nil
}
