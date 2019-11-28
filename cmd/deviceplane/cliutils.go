package main

import (
	"errors"
	"log"

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
