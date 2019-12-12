test:
	go test -v ./... -mod vendor

db-reset: state-reset
	docker-compose down
	docker-compose build
	docker-compose up -d
	sleep 30
	./scripts/seed

state-reset:
	rm -rf ./cmd/controller/state

controller:
	./scripts/build-controller

controller-with-db:
	./scripts/build-controller-with-db

agent-binaries:
	./scripts/build-agent-binaries

cli:
	./scripts/build-cli

cli-binaries:
	./scripts/build-cli-binaries
