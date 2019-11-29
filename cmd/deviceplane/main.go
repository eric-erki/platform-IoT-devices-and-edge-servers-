package main

import (
	"os"

	"github.com/deviceplane/deviceplane/pkg/client"
	kingpin "gopkg.in/alecthomas/kingpin.v2"
)

var (
	// Command and global flags
	// TODO: new custom template
	app                   = kingpin.New("deviceplane", "The Deviceplane CLI.").UsageTemplate(kingpin.CompactUsageTemplate).Version("dev")
	globalAPIEndpointFlag = app.Flag("url", "API Endpoint.").Hidden().Default("https://cloud.deviceplane.com:443/api").URL()
	globalAccessKeyFlag   = app.Flag("access-key", "Access Key used for authentication.").Envar("DEVICEPLANE_ACCESS_KEY").String()
	globalProjectFlag     = app.Flag("project", "Project name.").Envar("DEVICEPLANE_PROJECT").String()
	globalConfigFileFlag  = app.Flag("config", "Config file to use.").Default("~/.deviceplane/config").String()
	_                     = app.PreAction(initializeClient)
)

var (
	apiClient *client.Client
	table     = createDefaultTable()
)

func main() {
	kingpin.MustParse(app.Parse(os.Args[1:]))
}
