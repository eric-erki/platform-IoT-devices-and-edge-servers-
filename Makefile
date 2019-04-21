version= $(shell git describe --tags --always --dirty="-dev")

cli:
	go build -o ./dist/cli ./cmd/cli

controller:
	docker build -t deviceplane/deviceplane:${version} -f Dockerfile.controller .

push-controller: controller
	docker push deviceplane/deviceplane:${version}

agent:
	docker build -t deviceplane/agent:${version} -f Dockerfile.agent .

push-agent: agent
	docker push deviceplane/agent:${version}