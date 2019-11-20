package service

import (
	"net/http"

	"github.com/apex/log"
	"github.com/deviceplane/deviceplane/pkg/agent/metrics"
	"github.com/deviceplane/deviceplane/pkg/agent/netns"
	"github.com/deviceplane/deviceplane/pkg/agent/supervisor"
	"github.com/deviceplane/deviceplane/pkg/agent/variables"
	"github.com/deviceplane/deviceplane/pkg/engine"
	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type Service struct {
	variables        variables.Interface
	supervisorLookup supervisor.Lookup
	confDir          string
	netnsManager     *netns.Manager
	router           *mux.Router
}

func NewService(
	variables variables.Interface, supervisorLookup supervisor.Lookup,
	engine engine.Engine, confDir string,
) *Service {
	s := &Service{
		variables:        variables,
		supervisorLookup: supervisorLookup,
		confDir:          confDir,
		netnsManager:     netns.NewManager(engine),
		router:           mux.NewRouter(),
	}

	s.router.HandleFunc("/ssh", s.ssh).Methods("POST")
	s.router.HandleFunc("/applications/{application}/services/{service}/imagepullprogress", s.imagePullProgress).Methods("GET")
	s.router.HandleFunc("/applications/{application}/services/{service}/metrics", s.metrics).Methods("GET")

	s.router.Handle("/metrics/agent", promhttp.Handler())

	hostMetricsHandler, err := metrics.HostMetricsHandler()
	if err != nil {
		log.WithError(err).Error("create host metrics handler")
	} else {
		s.router.Handle("/metrics/host", *hostMetricsHandler)
	}

	return s
}

func (s *Service) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}
