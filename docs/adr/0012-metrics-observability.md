# 0012 Metrics And Observability

## Status

Accepted

## Context

Usage analytics can erode trust for a webcam biometric tool.

## Decision

Ship with no analytics in v1. Health is verified through local tests and the public Pages URL.

## Consequences

The project does not collect usage metrics. Success metrics are validated through local smoke tests and manual verification.

## Alternatives Considered

Plausible or a Cloudflare Worker beacon were rejected for v1.
