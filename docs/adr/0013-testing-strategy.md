# 0013 Testing Strategy

## Status

Accepted

## Context

Signal processing and persistence logic should be covered without making webcam tests flaky.

## Decision

Use Vitest for pure logic, React Testing Library for UI state, and Playwright for a static-site smoke test. Webcam APIs are mocked in tests; manual verification covers real camera behavior.

## Consequences

`make test`, `make build`, and `make smoke` are fast enough for pre-push hooks.

## Alternatives Considered

Full camera e2e automation was rejected because it is browser- and hardware-dependent.
