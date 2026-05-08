# 0015 Deployment Topology

## Status

Accepted

## Context

Mode A deploys only static assets.

## Decision

GitHub Pages serves `https://baditaflorin.github.io/vagus-reset-coach/` from `main /docs`. There is no runtime server, Docker Compose, nginx, or GHCR image.

## Consequences

Deployment is a git push containing a fresh `docs/` build.

## Alternatives Considered

Docker backend deployment was rejected in ADR 0001.
