package project

import (
	"github.com/deviceplane/deviceplane/cmd/deviceplane/global"
	"gopkg.in/alecthomas/kingpin.v2"
)

var (
	projectJSONOutputFlag *bool = &[]bool{false}[0]

	config *global.Config
)

func Initialize(c *global.Config) {
	config = c

	projectCmd := config.App.Command("project", "Manage projects.")

	projectListCmd := projectCmd.Command("list", "List projects.")
	projectListCmd.Action(projectListAction)

	projectCreateCmd := projectCmd.Command("create", "Create a new project.")
	projectCreateCmd.Action(projectCreateAction)

	// TODO: check if we changed this to "raw" or "r" (can also add all three...):
	for _, cmd := range []*kingpin.CmdClause{
		projectListCmd,
	} {
		cmd.Flag("json", "View output in JSON.").BoolVar(projectJSONOutputFlag)
	}
}
