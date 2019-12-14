package service

import (
	"context"
	"fmt"
	"net/http"
	"os/exec"
	"time"
)

func (s *Service) reboot(w http.ResponseWriter, r *http.Request) {
	fmt.Println("HIT REBOOT")

	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()

	cmd := exec.CommandContext(ctx, "/sbin/reboot")
	go func() {
		fmt.Println("Sleeping")
		time.Sleep(1000)
		fmt.Println("Rebooting")
		cmd.Run()
		fmt.Println("Done Rebooting?")
		w.WriteHeader(600)
	}()

	w.Write([]byte("Scheduling reboot"))
	w.WriteHeader(200)
	return
}
