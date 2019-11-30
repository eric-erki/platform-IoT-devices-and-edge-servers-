package cliutils

import "fmt"

var CustomTemplate string

func recursiveCommandMatcher(cmds []string) string {
	if len(cmds) == 0 {
		return "false"
	}
	cmd := cmds[0]
	return fmt.Sprintf(`(or (eq .Name "%s") %s)`, cmd, recursiveCommandMatcher(cmds[1:]))
}

func init() {
	fastAccessCmdStr := recursiveCommandMatcher([]string{
		"ssh",
		"help",
	})

	CustomTemplate = `{{define "FormatCommand"}}\
{{if .FlagSummary}} {{.FlagSummary}}{{end}}\
{{range .Args}} {{if not .Required}}[{{end}}<{{.Name}}>{{if .Value|IsCumulative}}...{{end}}{{if not .Required}}]{{end}}{{end}}\
{{end}}\

{{define "CustomCmd"}}\
{{if not .Hidden}}\
{{.Depth|Indent}} {{.Name}}{{if .Default}}*{{end}}{{template "FormatCommand" .}}  --  {{.Help}}
{{range .Commands}}\
{{template "CustomCmd" .}}\
{{end}}\
{{end}}\
{{end}}\

{{define "AllCmds"}}\
{{range .}}\
{{template "CustomCmd" .}}\
{{end}}\
{{end}}\

{{define "TopLevelFastAccessCmds"}}\
{{range .}}\
{{if ` + fastAccessCmdStr + `}}\
{{template "CustomCmd" .}}\
{{end}}\
{{end}}\
{{end}}\

{{define "TopLevelRegularCmds"}}\
{{range .}}\
{{if not ` + fastAccessCmdStr + `}}\
{{template "CustomCmd" .}}\
{{.Depth|Indent}}
{{end}}\
{{end}}\
{{end}}\

{{define "FormatUsage"}}\
{{template "FormatCommand" .}}{{if .Commands}} <command> [<args> ...]{{end}}
{{if .Help}}
{{.Help|Wrap 0}}\
{{end}}\

{{end}}\

{{if .Context.SelectedCommand}}\
usage: {{.App.Name}} {{.Context.SelectedCommand}}{{template "FormatUsage" .Context.SelectedCommand}}
{{else}}\
usage: {{.App.Name}}{{template "FormatUsage" .App}}
{{end}}\
{{if .Context.Flags}}\
Flags:
{{.Context.Flags|FlagsToTwoColumns|FormatTwoColumns}}
{{end}}\
{{if .Context.Args}}\
Args:
{{.Context.Args|ArgsToTwoColumns|FormatTwoColumns}}
{{end}}\
{{if .Context.SelectedCommand}}\
{{if len .Context.SelectedCommand.Commands}}\
Subcommands:
{{template "AllCmds" .Context.SelectedCommand.Commands}}
{{end}}\
{{else if .App.Commands}}\
Fast-Access Commands:
{{template "TopLevelFastAccessCmds" .App.Commands}}
Commands:
{{template "TopLevelRegularCmds" .App.Commands}}
{{end}}\
`
}
