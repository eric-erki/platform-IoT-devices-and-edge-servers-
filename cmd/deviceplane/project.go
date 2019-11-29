package main

import (
	"context"
	"fmt"

	kingpin "gopkg.in/alecthomas/kingpin.v2"
)

var (
	projectCmd       = app.Command("project", "Manage projects.")
	projectListCmd   = projectCmd.Command("list", "List projects.")
	projectCreateCmd = projectCmd.Command("create", "Create a new project.")
)

func createProjectAction(c *kingpin.ParseContext) error {
	project, err := apiClient.CreateProject(context.TODO(), *globalProjectFlag)
	if err != nil {
		return err
	}

	fmt.Printf("Project %s successfully created at %s!\n", project.Name, project.CreatedAt.Format("Mon Jan _2 15:04:05 2006"))

	return nil
}
