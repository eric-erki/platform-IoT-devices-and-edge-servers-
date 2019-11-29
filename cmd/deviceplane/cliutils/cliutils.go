package cliutils

import (
	"errors"
	"log"
	"os"

	"github.com/deviceplane/deviceplane/cmd/deviceplane/global"
	"github.com/deviceplane/deviceplane/pkg/client"

	"github.com/olekukonko/tablewriter"
	kingpin "gopkg.in/alecthomas/kingpin.v2"
)

func RequireAccessKey(config *global.Config, c interface{}) interface{} {
	return RequireVariableForPreAction(config.Flags.AccessKey, errors.New("access key flag/env/config not provided"), c)
}

func RequireProject(config *global.Config, c interface{}) interface{} {
	return RequireVariableForPreAction(config.Flags.Project, errors.New("project flag/env/config not provided"), c)
}

func RequireVariableForPreAction(variable *string, err error, c interface{}) interface{} {
	requirePreAction := func(c *kingpin.ParseContext) error {
		if c.Error() {
			return nil
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
		if config.Flags.APIEndpoint == nil || config.Flags.AccessKey == nil {
			return nil // Kingpin will write a better error after it validates required flags
		}
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
	table.SetTablePadding("\t") // pad with tabs
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
