# 0014 Error Handling Conventions

## Status

Accepted

## Context

Camera permission, unsupported APIs, DuckDB initialization, and storage quota can fail.

## Decision

Return typed result objects from core logic, surface recoverable errors in UI, and never block a breathing-only session if measurement or analytics are unavailable.

## Consequences

The reset tool remains usable with degraded measurement when the environment is imperfect.

## Alternatives Considered

Throwing through React boundaries for expected browser failures was rejected.
