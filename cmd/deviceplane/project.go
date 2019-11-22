package main

import (
	"context"
	"fmt"

	"github.com/deviceplane/deviceplane/pkg/client"
	kingpin "gopkg.in/alecthomas/kingpin.v2"
)

func createProjectFunc(c *kingpin.ParseContext) error {
	client := client.NewClient(*apiEndpointFlag, *accessKeyFlag, nil)
	project, err := client.CreateProject(context.TODO(), *projectFlag)
	if err != nil {
		return err
	}

	fmt.Printf("Project %s successfully created at %s!\n", project.Name, project.CreatedAt.Format("Mon Jan _2 15:04:05 2006"))

	return nil
}
