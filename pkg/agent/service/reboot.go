package service

import (
	"net/http"
	"os/exec"
	"time"

	"github.com/apex/log"
)

func (s *Service) reboot(w http.ResponseWriter, r *http.Request) {
	cmd := exec.Command("/sbin/reboot")
	go func() {
		time.Sleep(1000)
		err := cmd.Run()
		if err != nil {
			log.WithError(err).Error("failed to reboot")
		}
	}()

	w.Write([]byte("Scheduling reboot"))
	w.WriteHeader(200)
	return
}
