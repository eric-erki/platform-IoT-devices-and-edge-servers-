package main

import (
	"errors"
	"log"
	"os"

	"github.com/deviceplane/deviceplane/pkg/client"

	"github.com/olekukonko/tablewriter"
	kingpin "gopkg.in/alecthomas/kingpin.v2"
)

func requireAccessKey(c interface{}) interface{} {
	return requireVariableForPreAction(globalAccessKeyFlag, errors.New("access key flag/env/config not provided"), c)
}

func requireProject(c interface{}) interface{} {
	return requireVariableForPreAction(globalProjectFlag, errors.New("project flag/env/config not provided"), c)
}

func requireVariableForPreAction(variable *string, err error, c interface{}) interface{} {
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

func initializeClient(c *kingpin.ParseContext) error {
	if globalAPIEndpointFlag == nil || globalAccessKeyFlag == nil {
		return nil // Kingpin will write a better error after it validates required flags
	}
	apiClient = client.NewClient(*globalAPIEndpointFlag, *globalAccessKeyFlag, nil)
	return nil
}

func createDefaultTable() *tablewriter.Table {
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
	table.SetTablePadding("\t\t") // pad with tabs
	table.SetNoWhiteSpace(true)
	return table
}
