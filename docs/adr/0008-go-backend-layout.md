# 0008 Go Backend Layout

## Status

Accepted

## Context

The bootstrap requested Go layout only for Mode B or Mode C.

## Decision

Skip Go backend folders in v1 because the app is Mode A.

## Consequences

There is no `cmd/`, `internal/`, `pkg/`, `api/`, `configs/`, or Go Docker build. If a future backend is added, it must start with a new ADR.

## Alternatives Considered

Creating empty Go folders was rejected because it would imply a backend surface that does not exist.
