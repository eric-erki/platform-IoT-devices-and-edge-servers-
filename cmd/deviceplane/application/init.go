package application

import (
	"github.com/deviceplane/deviceplane/cmd/deviceplane/cliutils"
	"github.com/deviceplane/deviceplane/cmd/deviceplane/global"
	kingpin "gopkg.in/alecthomas/kingpin.v2"
)

var (
	applicationDeployFileArg  *string = &[]string{""}[0]
	applicationArg            *string = &[]string{""}[0]
	applicationJSONOutputFlag *bool   = &[]bool{false}[0]

	config *global.Config
)

func Initialize(c *global.Config) {
	config = c

	applicationCmd := config.App.Command("application", "Manage applications.")
	cliutils.RequireAccessKey(config, applicationCmd)
	cliutils.RequireProject(config, applicationCmd)

	applicationListCmd := applicationCmd.Command("list", "List applications.")
	applicationListCmd.Action(applicationListAction)

	applicationCreateCmd := applicationCmd.Command("create", "Create a new application.")
	addApplicationArg(applicationCreateCmd)
	applicationCreateCmd.Action(applicationCreateAction)

	applicationEditCmd := applicationCmd.Command("edit", "Manually modify an application's latest release config.")
	addApplicationArg(applicationEditCmd)
	applicationEditCmd.Action(applicationEditAction)

	applicationInspectCmd := applicationCmd.Command("inspect", "Inspect an application's latest release config.")
	addApplicationArg(applicationInspectCmd)
	applicationInspectCmd.Action(applicationInspectAction)

	applicationDeployCmd := applicationCmd.Command("deploy", "Deploy an application from a yaml file.")
	applicationDeployFileArg = applicationDeployCmd.Arg("file", "File path of the yaml file to deploy.").Required().ExistingFile()
	addApplicationArg(applicationDeployCmd)
	applicationDeployCmd.Action(applicationDeployAction)

	// TODO: check if we changed this to "raw" or "r" (can also add all three...):
	for _, cmd := range []*kingpin.CmdClause{
		applicationListCmd,
		applicationInspectCmd,
	} {
		cmd.Flag("json", "View output in JSON.").BoolVar(applicationJSONOutputFlag)
	}
}
