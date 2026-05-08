SHELL := /usr/bin/env bash

.PHONY: help install-hooks dev build data test test-integration smoke lint fmt pages-preview release clean hooks-pre-commit hooks-commit-msg hooks-pre-push hooks-post-merge hooks-post-checkout

help:
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_-]+:.*##/ {printf "%-22s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install-hooks: ## Wire local git hooks
	git config core.hooksPath .githooks
	chmod +x .githooks/*

dev: ## Run the frontend dev server
	npm run dev

build: ## Build frontend into docs/ for GitHub Pages
	npm run build

data: ## Mode A has no generated static data
	@echo "Mode A: no data generation pipeline."

test: ## Run unit tests
	npm run test

test-integration: ## No integration tests in Mode A v1
	@echo "Mode A: integration tests are not required for v1."

smoke: ## Build and run Playwright smoke tests
	./scripts/smoke.sh

lint: ## Run linters and format checks
	npm run lint
	npm run format:check
	npm run typecheck

fmt: ## Autoformat source files
	npm run format

pages-preview: ## Serve docs/ as Pages would
	npm run pages-preview

release: ## Create v0.1.0 tag
	git tag v0.1.0
	git push origin v0.1.0

clean: ## Remove local build scratch files
	rm -rf coverage tmp node_modules/.tmp test-results playwright-report

hooks-pre-commit:
	.githooks/pre-commit

hooks-commit-msg:
	.githooks/commit-msg .git/COMMIT_EDITMSG

hooks-pre-push:
	.githooks/pre-push

hooks-post-merge:
	.githooks/post-merge

hooks-post-checkout:
	.githooks/post-checkout
