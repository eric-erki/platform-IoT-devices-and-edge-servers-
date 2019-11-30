package application

import (
	"github.com/deviceplane/deviceplane/cmd/deviceplane/cliutils"
	"github.com/deviceplane/deviceplane/cmd/deviceplane/global"
)

var (
	applicationArg *string = &[]string{""}[0]

	applicationDeployFileArg *string = &[]string{""}[0]

	applicationOutputFlag *string = &[]string{""}[0]

	config *global.Config
)

func Initialize(c *global.Config) {
	config = c

	applicationCmd := config.App.Command("application", "Manage applications.")
	cliutils.RequireAccessKey(config, applicationCmd)
	cliutils.RequireProject(config, applicationCmd)

	applicationListCmd := applicationCmd.Command("list", "List applications.")
	cliutils.AddFormatFlag(applicationOutputFlag, applicationListCmd,
		cliutils.FormatTable,
		cliutils.FormatJSON,
		cliutils.FormatYAML,
	)
	applicationListCmd.Action(applicationListAction)

	applicationCreateCmd := applicationCmd.Command("create", "Create a new application.")
	addApplicationArg(applicationCreateCmd)
	applicationCreateCmd.Action(applicationCreateAction)

	applicationEditCmd := applicationCmd.Command("edit", "Manually modify an application's latest release config.")
	addApplicationArg(applicationEditCmd)
	applicationEditCmd.Action(applicationEditAction)

	applicationInspectCmd := applicationCmd.Command("inspect", "Inspect an application's latest release config.")
	addApplicationArg(applicationInspectCmd)
	cliutils.AddFormatFlag(applicationOutputFlag, applicationInspectCmd,
		cliutils.FormatYAML,
		cliutils.FormatJSON,
	)
	applicationInspectCmd.Action(applicationInspectAction)

	applicationDeployCmd := applicationCmd.Command("deploy", "Deploy an application from a yaml file.")
	applicationDeployFileArg = applicationDeployCmd.Arg("file", "File path of the yaml file to deploy.").Required().ExistingFile()
	addApplicationArg(applicationDeployCmd)
	applicationDeployCmd.Action(applicationDeployAction)
}
