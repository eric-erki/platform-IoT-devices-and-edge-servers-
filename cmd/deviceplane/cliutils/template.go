package cliutils

const CustomTemplate = `{{define "FormatCommand"}}\
{{if .FlagSummary}} {{.FlagSummary}}{{end}}\
{{range .Args}} {{if not .Required}}[{{end}}<{{.Name}}>{{if .Value|IsCumulative}}...{{end}}{{if not .Required}}]{{end}}{{end}}\
{{end}}\

{{define "CustomCmd"}}\
{{.Depth|Indent}} {{.Name}}{{if .Default}}*{{end}}{{template "FormatCommand" .}}  --  {{.Help}}
{{range .Commands}}\
{{template "CustomCmd" .}}\
{{end}}\
{{end}}\

{{define "TopLevelCmds"}}\
{{range .}}\
{{if not .Hidden}}\
{{if eq (len .FlattenedCommands) 0 }}\
{{template "CustomCmd" .}}\
{{end}}\
{{end}}\
{{end}}\
{{end}}\

{{define "NestedCmds"}}\
{{range .}}\
{{if not .Hidden}}\
{{if ne (len .FlattenedCommands) 0 }}\
{{template "CustomCmd" .}}\
{{.Depth|Indent}}
{{end}}\
{{end}}\
{{end}}\
{{end}}\

{{define "FormatCommandList"}}\
{{range .}}\
{{if not .Hidden}}\
{{.Depth|Indent}}{{.Name}}{{if .Default}}*{{end}}{{template "FormatCommand" .}}
{{end}}\
{{template "FormatCommandList" .Commands}}\
{{end}}\
{{end}}\

{{define "FormatCommands"}}\
{{range .FlattenedCommands}}\
{{if not .Hidden}}\
  {{.FullCommand}}{{if .Default}}*{{end}}{{template "FormatCommand" .}}
{{.Help|Wrap 4}}
{{end}}\
{{end}}\
{{end}}\

{{define "CustomFormatCommands"}}\
{{range .FlattenedCommands}}\
{{if not .Hidden}}\
  {{.FullCommand}}{{if .Default}}*{{end}}{{template "FormatCommand" .}}
{{.Help|Wrap 4}}
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
{{template "CustomFormatCommands" .Context.SelectedCommand}}
{{end}}\
{{else if .App.Commands}}\
Commands:
{{template "TopLevelCmds" .App.Commands}}
Nested Commands:
{{template "NestedCmds" .App.Commands}}
{{end}}\
`
