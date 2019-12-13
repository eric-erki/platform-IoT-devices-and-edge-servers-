package service

import (
	"context"
	"net/http"
	"os/exec"
)

func (s *Service) reboot(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()

	// TODO: /sbin/reboot
	command := []string{"/bin/sleep", "1", "&&", "/bin/echo", "rebooting", "&&", "/bin/echo rebooting > /tmp-rebooting"}
	cmd := exec.CommandContext(ctx, command[0], command[1:]...)
	defer cmd.Run()

	w.Write([]byte("Scheduling reboot"))
	w.WriteHeader(200)
	return
}
