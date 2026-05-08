# 0011 Logging Strategy

## Status

Accepted

## Context

Mode A has no server logs, but browser diagnostics are useful during development.

## Decision

Keep production console output minimal. User-facing errors appear as inline banners or toasts. Development-only diagnostics may use console output behind environment checks.

## Consequences

No biometric data is logged to remote services.

## Alternatives Considered

Client log beacons were rejected for privacy.
