package updater

import (
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"runtime"
	"sync"
	"syscall"
	"time"

	"github.com/apex/log"
)

const (
	location = "https://agent.deviceplane.com/%s/linux/%s/deviceplane-agent"
)

type Updater struct {
	projectID  string
	version    string
	binaryPath string

	desiredVersion string
	once           sync.Once
	lock           sync.RWMutex
}

func NewUpdater(projectID, version, binaryPath string) *Updater {
	return &Updater{
		projectID:  projectID,
		version:    version,
		binaryPath: binaryPath,
	}
}

func (u *Updater) SetDesiredVersion(desiredVersion string) {
	u.lock.Lock()
	u.desiredVersion = desiredVersion
	u.lock.Unlock()

	u.once.Do(func() {
		go u.updater()
	})
}

func (u *Updater) updater() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for {
		u.lock.RLock()
		desiredVersion := u.desiredVersion
		u.lock.RUnlock()

		if desiredVersion != "" && desiredVersion != u.version {
			u.update(desiredVersion)
		}

		<-ticker.C
	}
}

func (u *Updater) update(desiredVersion string) {
	f, err := ioutil.TempFile("", "")
	if err != nil {
		log.WithError(err).Error("create temp file")
		return
	}
	defer f.Close()

	resp, err := http.Get(fmt.Sprintf(location, desiredVersion, runtime.GOARCH))
	if err != nil {
		log.WithError(err).Error("get agent")
		return
	}
	defer resp.Body.Close()

	if _, err = io.Copy(f, resp.Body); err != nil {
		log.WithError(err).Error("download agent")
		return
	}

	if err = syscall.Unlink(u.binaryPath); err != nil {
		log.WithError(err).Error("unlink existing agent")
		return
	}

	if err = os.Rename(f.Name(), u.binaryPath); err != nil {
		log.WithError(err).Error("rename agent")
		return
	}

	os.Exit(0)
}
