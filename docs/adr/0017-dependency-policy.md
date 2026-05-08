# 0017 Dependency Policy

## Status

Accepted

## Context

The app handles biometric-derived signals and should stay maintainable.

## Decision

Use production-ready libraries for framework, build, testing, icons, validation, PWA, and DuckDB-WASM. Keep custom code focused on app-specific rPPG and breath pacing.

## Consequences

Dependencies are audited with `npm audit`, reviewed before upgrades, and kept out of critical paths unless they are needed.

## Alternatives Considered

Hand-rolling persistence analytics was rejected because DuckDB-WASM is a better fit.
