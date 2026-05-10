# Makefile - LekkerAtlas frontend development helpers
#
# What this does:
# - Builds the "development" stage of the Docker image for the React frontend
# - Runs the container with:
#   - live-mounted source code (. -> /app)
#   - an anonymous volume for /app/node_modules (prevents host node_modules issues)
#   - environment variables for Docker-based dev
#   - port mapping (host 80 -> container 80)
#
# Usage examples:
#   make dev       # build + run (most common)
#   make build     # only build the dev image
#   make run       # only run (assumes image already built)
#   make clean     # remove the dev image
#
# Notes:
# - If port 80 requires sudo or is already in use, override PORT:
#     make dev PORT=3000
# - If you want a different image name:
#     make dev IMAGE=lekkeratlas-frontend-dev

SHELL := /bin/bash

# --- Configurable variables (override like: make dev PORT=3000) ---
IMAGE        ?= lekkeratlas-frontend-dev
TARGET       ?= development
PORT         ?= 80

# Environment passed into the container
REACT_APP_USING_DOCKER ?= true
NODE_ENV              ?= development

# --- Derived values ---
PWD := $(shell pwd)

# Default target when you run: make
.DEFAULT_GOAL := help

.PHONY: help dev build run clean rebuild logs

help: ## Show available targets and how to use them
	@echo ""
	@echo "LekkerAtlas Frontend Docker Dev"
	@echo "--------------------------------"
	@echo "Common commands:"
	@echo "  make dev            Build + run the development container"
	@echo "  make build          Build only"
	@echo "  make run            Run only (requires image already built)"
	@echo "  make clean          Remove dev image"
	@echo ""
	@echo "Optional overrides:"
	@echo "  make dev PORT=3000"
	@echo "  make dev IMAGE=my-image"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  %-12s %s\n", $$1, $$2}'
	@echo ""

dev: build run ## Build the dev image and run the container

build: ## Build the Docker image (development target)
	docker build --target $(TARGET) -t $(IMAGE) .

run: ## Run the dev container with volume mounts and env vars
	docker run --rm -it \
		-v "$(PWD):/app" \
		-v /app/node_modules \
		-e REACT_APP_USING_DOCKER=$(REACT_APP_USING_DOCKER) \
		-e NODE_ENV=$(NODE_ENV) \
		-p $(PORT):80 \
		$(IMAGE)

rebuild: clean build ## Clean image then build again

clean: ## Remove the dev image (if it exists)
	@docker image rm -f $(IMAGE) >/dev/null 2>&1 || true
	@echo "Removed image: $(IMAGE) (if it existed)"

logs: ## Show recent Docker build/run related images/containers (quick helper)
	@echo "Images matching '$(IMAGE)':"
	@docker images | head -n 1
	@docker images | grep -F "$(IMAGE)" || true