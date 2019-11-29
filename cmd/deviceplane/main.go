package main

import (
	"os"

	"github.com/deviceplane/deviceplane/cmd/deviceplane/application"
	"github.com/deviceplane/deviceplane/cmd/deviceplane/cliutils"
	"github.com/deviceplane/deviceplane/cmd/deviceplane/configure"
	"github.com/deviceplane/deviceplane/cmd/deviceplane/device"
	"github.com/deviceplane/deviceplane/cmd/deviceplane/global"
	"github.com/deviceplane/deviceplane/cmd/deviceplane/project"
	kingpin "gopkg.in/alecthomas/kingpin.v2"
)

var (
	// Command and global flags
	// TODO: new custom template
	app = kingpin.New("deviceplane", "The Deviceplane CLI.").UsageTemplate(kingpin.CompactUsageTemplate).Version("dev")

	config = global.Config{
		App: app,

		Flags: global.ConfigFlags{
			APIEndpoint: app.Flag("url", "API Endpoint.").Hidden().Default("https://cloud.deviceplane.com:443/api").URL(),
			AccessKey:   app.Flag("access-key", "Access Key used for authentication.").Envar("DEVICEPLANE_ACCESS_KEY").String(),
			Project:     app.Flag("project", "Project name.").Envar("DEVICEPLANE_PROJECT").String(),
			ConfigFile:  app.Flag("config", "Config file to use.").Default("~/.deviceplane/config").String(),
		},

		APIClient: nil,
	}
)

func main() {
	application.Initialize(&config)
	device.Initialize(&config)
	configure.Initialize(&config)
	project.Initialize(&config)

	app.PreAction(cliutils.InitializeAPIClient(&config))
	kingpin.MustParse(app.Parse(os.Args[1:]))
}
