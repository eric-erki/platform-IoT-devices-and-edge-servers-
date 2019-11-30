package cliutils

import (
	"fmt"
	"strings"

	kingpin "gopkg.in/alecthomas/kingpin.v2"
)

type HasCommand interface {
	Command(name string, help string) *kingpin.CmdClause
}

func GlobalAndCategorizedCmd(globalApp *kingpin.Application, categoryCmd *kingpin.CmdClause, do func(HasCommand)) {
	for _, attachmentPoint := range []HasCommand{globalApp, categoryCmd} {
		do(attachmentPoint)
	}
}

var (
	FormatTable string = "table"
	FormatJSON  string = "json"
	FormatYAML  string = "yaml"
)

func AddFormatFlag(formatVar *string, categoryCmd *kingpin.CmdClause, allowedFormats ...string) {
	fFlag := categoryCmd.Flag("output", fmt.Sprintf("Output format to use. (%s)", strings.Join(allowedFormats, ", ")))
	fFlag.Short('o')
	fFlag.Default(allowedFormats[0])
	fFlag.EnumVar(formatVar, allowedFormats...)
}
