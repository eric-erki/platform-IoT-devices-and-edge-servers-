package main

import (
	"bufio"
	"fmt"
	"io/ioutil"
	"os"
	"os/user"
	"path/filepath"
	"strings"

	"github.com/deviceplane/deviceplane/pkg/interpolation"
	"github.com/pkg/errors"
	kingpin "gopkg.in/alecthomas/kingpin.v2"
	"gopkg.in/yaml.v2"
)

var (
	// Global initialization
	_ = app.PreAction(populateEmptyValuesFromConfig)

	// Commands
	configureCmd = app.Command("configure", "Configure this CLI utility.")
	_            = configureCmd.Action(configureAction)
)

type Config struct {
	AccessKey *string `yaml:"access-key,omitempty"`
	Project   *string `yaml:"project,omitempty"`
}

func populateEmptyValuesFromConfig(c *kingpin.ParseContext) (err error) {
	defer func() {
		if err != nil {
			err = errors.Wrap(err, "failed while parsing config")
		}
	}()

	// (This happens if kingpin has an error while parsing. Let it throw its
	// errors, ours don't matter at that point)
	if c.Error() {
		return nil
	}

	// This should normally be expanded by the shell,
	// but this is for the our default flag value,
	// which starts with "~/" but does not get expanded
	if strings.HasPrefix(*globalConfigFileFlag, "~/") {
		usr, err := user.Current()
		if err != nil {
			return errors.Wrap(err, "failed to get home dir")
		}
		dir := usr.HomeDir
		expandedPath := filepath.Join(dir, (*globalConfigFileFlag)[2:])
		globalConfigFileFlag = &expandedPath
	}

	gcf, err := os.Open(*globalConfigFileFlag)
	if err != nil {
		if !os.IsNotExist(err) {
			return err
		}

		// Create if not exists
		err := os.MkdirAll(filepath.Dir(*globalConfigFileFlag), os.ModeDir)
		if err != nil && !os.IsExist(err) {
			return err
		}
		err = os.Chmod(filepath.Dir(*globalConfigFileFlag), 0700)
		if err != nil {
			return err
		}
		gcf, err = os.Create(*globalConfigFileFlag)
		if err != nil {
			return err
		}
	}

	r := bufio.NewReader(gcf)
	configBytes, err := ioutil.ReadAll(r)
	if err != nil {
		return errors.Wrap(err, "failed to read file")
	}

	configString, err := interpolation.Interpolate(string(configBytes), os.Getenv)
	if err != nil {
		return err
	}

	var config Config
	err = yaml.Unmarshal([]byte(configString), &config)
	if err != nil {
		return err
	}

	// Fill config in order of FLAG -> ENV -> CONFIG
	// The first two steps are handled automatically by kingpin
	if config.AccessKey != nil {
		if globalAccessKeyFlag == nil || *globalAccessKeyFlag == "" {
			globalAccessKeyFlag = config.AccessKey
		}
	}
	if config.Project != nil {
		if globalProjectFlag == nil || *globalProjectFlag == "" {
			globalProjectFlag = config.Project
		}
	}

	return nil
}

// Configure uses the existing value as a fallback
func configureAction(c *kingpin.ParseContext) error {
	reader := bufio.NewReader(os.Stdin)

	// Read input
	var extraAccessKeyMsg string
	if globalAccessKeyFlag != nil && *globalAccessKeyFlag != "" {
		extraAccessKeyMsg = fmt.Sprintf(` (or leave empty to use "%s")`, *globalAccessKeyFlag)
	}
	fmt.Printf("Enter access key%s: \n>", extraAccessKeyMsg)
	rawAccessKey, _ := reader.ReadString('\n')

	var extraProjectMsg string
	if globalProjectFlag != nil && *globalProjectFlag != "" {
		extraProjectMsg = fmt.Sprintf(` (or leave empty to use "%s")`, *globalProjectFlag)
	}
	fmt.Printf("Enter project%s: \n>", extraProjectMsg)
	rawProject, _ := reader.ReadString('\n')

	// Clean input
	accessKey := strings.TrimSpace(rawAccessKey)
	project := strings.TrimSpace(rawProject)

	// Replace input if needed
	if accessKey == "" {
		accessKey = *globalAccessKeyFlag
	}
	if project == "" {
		project = *globalProjectFlag
	}

	fmt.Printf("Configuring with access key (%s) and project (%s)\n", accessKey, project)

	// Actually configure
	config := Config{
		AccessKey: &accessKey,
		Project:   &project,
	}

	configBytes, err := yaml.Marshal(config)
	if err != nil {
		return errors.Wrap(err, "failed to serialize config")
	}

	err = ioutil.WriteFile(*globalConfigFileFlag, configBytes, 0700)
	if err != nil {
		return errors.Wrap(err, "failed to write config to disk")
	}
	return nil
}
