# 0049 Inspectability And Debug Surface

## Status

Accepted

## Context

Power users and maintainers need to understand why measurement was low-confidence.

## Decision

Expose `?debug=1` with internal metrics, diagnostics, reason codes, and state. Keep it read-only and local.

## Consequences

Support can ask users for debug screenshots without collecting webcam frames.

## Alternatives Considered

Remote telemetry was rejected for privacy.
