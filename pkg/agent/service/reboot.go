package service

import (
	"context"
	"fmt"
	"net/http"
	"os/exec"
	"time"

	"github.com/apex/log"
)

func (s *Service) reboot(w http.ResponseWriter, r *http.Request) {
	fmt.Println("HIT REBOOT")

	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()

	cmd := exec.CommandContext(ctx, "/sbin/reboot")
	go func() {
		fmt.Println("Sleeping")
		time.Sleep(2000)
		fmt.Println("Rebooting")
		err := cmd.Run()
		if err != nil {
			log.WithError(err).Error("failed to reboot")
		}
		fmt.Println("Done Rebooting?")
	}()

	w.Write([]byte("Scheduling reboot"))
	w.WriteHeader(200)
	return
}
