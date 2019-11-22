package main

import (
	"os"

	kingpin "gopkg.in/alecthomas/kingpin.v2"
)

var (
	app             = kingpin.New("deviceplane", "The Deviceplane CLI.")
	apiEndpointFlag = app.Flag("url", "API Endpoint.").Hidden().Default("https://cloud.deviceplane.com:443/api").URL()
	accessKeyFlag   = app.Flag("access-key", "Access Key used for authentication.").Required().String()
	projectFlag     = app.Flag("project", "Project name.").Required().String()

	sshCmd         = app.Command("ssh", "SSH into a device.")
	deviceFlag     = sshCmd.Flag("device", "Device to SSH into.").Required().String()
	sshTimeoutFlag = sshCmd.Flag("timeout", "Maximum length to attempt establishing a connection.").Default("60").Int()

	projectCmd       = app.Command("project", "Manage projects.")
	createProjectCmd = projectCmd.Command("create", "Create a new project.")

	applicationCmd       = app.Command("application", "Manage applications.")
	createApplicationCmd = applicationCmd.Command("create", "Create a new application.")
	applicationFlag      = createApplicationCmd.Flag("application", "Application name.").Required().String()
	editCmd              = applicationCmd.Command("edit", "Manually modify an application's latest release config.")
	deployCmd            = applicationCmd.Command("deploy", "Deploy an application from a yaml file.")
	deployFileArg        = deployCmd.Arg("deployfile", "File path of the yaml file to deploy.").Required().String()
)

func main() {
	kingpin.Version("dev")

	sshCmd.Action(sshFunc)
	createProjectCmd.Action(createProjectFunc)

	kingpin.MustParse(app.Parse(os.Args[1:]))
}
