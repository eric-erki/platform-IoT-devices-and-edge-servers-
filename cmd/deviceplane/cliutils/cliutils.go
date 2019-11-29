package cliutils

import (
	"fmt"
	"log"
	"os"

	"github.com/deviceplane/deviceplane/cmd/deviceplane/global"
	"github.com/deviceplane/deviceplane/pkg/client"

	"github.com/olekukonko/tablewriter"
	kingpin "gopkg.in/alecthomas/kingpin.v2"
)

func RequireAccessKey(config *global.Config, c interface{}) interface{} {
	return RequireVariableForPreAction(
		config,
		config.Flags.AccessKey,
		fmt.Errorf("Access Key not found as a flag, env var, or in config (%s)", *config.Flags.ConfigFile),
		c,
	)
}

func RequireProject(config *global.Config, c interface{}) interface{} {
	return RequireVariableForPreAction(
		config,
		config.Flags.Project,
		fmt.Errorf("Project not found as a flag, env var, or in config (%s)", *config.Flags.ConfigFile),
		c,
	)
}

func RequireVariableForPreAction(config *global.Config, variable *string, err error, c interface{}) interface{} {
	requirePreAction := func(c *kingpin.ParseContext) error {
		if c.Error() || !*config.ParsedCorrectly {
			return nil // Let kingpin's errors precede
		}
		if variable == nil || *variable == "" {
			return err
		}
		return nil
	}

	switch v := c.(type) {
	case *kingpin.CmdClause:
		return v.PreAction(requirePreAction)
	case *kingpin.ArgClause:
		return v.PreAction(requirePreAction)
	case *kingpin.FlagClause:
		return v.PreAction(requirePreAction)
	default:
		log.Fatal("Cannot require access key on this type")
		return nil
	}
}

func InitializeAPIClient(config *global.Config) func(c *kingpin.ParseContext) error {
	return func(c *kingpin.ParseContext) error {
		config.APIClient = client.NewClient(*config.Flags.APIEndpoint, *config.Flags.AccessKey, nil)
		return nil
	}
}

func DefaultTable() *tablewriter.Table {
	table := tablewriter.NewWriter(os.Stdout)
	table.SetAutoWrapText(false)
	table.SetAutoFormatHeaders(true)
	table.SetHeaderAlignment(tablewriter.ALIGN_LEFT)
	table.SetAlignment(tablewriter.ALIGN_LEFT)
	table.SetCenterSeparator("")
	table.SetColumnSeparator("")
	table.SetRowSeparator("")
	table.SetHeaderLine(false)
	table.SetBorder(false)
	table.SetTablePadding(" \t ")
	table.SetNoWhiteSpace(true)
	return table
}

type HasCommand interface {
	Command(name string, help string) *kingpin.CmdClause
}

func GlobalAndCategorizedCmd(globalApp *kingpin.Application, categoryCmd *kingpin.CmdClause, do func(HasCommand)) {
	for _, attachmentPoint := range []HasCommand{globalApp, categoryCmd} {
		do(attachmentPoint)
	}
}
