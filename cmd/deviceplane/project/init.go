package project

import (
	"github.com/deviceplane/deviceplane/cmd/deviceplane/global"
)

var (
	config *global.Config
)

func Initialize(c *global.Config) {
	config = c

	projectCmd := config.App.Command("project", "Manage projects.")

	projectListCmd := projectCmd.Command("list", "List projects.")
	projectListCmd.Action(projectListAction)

	projectCreateCmd := projectCmd.Command("create", "Create a new project.")
	projectCreateCmd.Action(projectCreateAction)
}
