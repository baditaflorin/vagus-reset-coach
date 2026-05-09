# 0045 State Taxonomy And State Machine

## Status

Accepted

## Context

The app must avoid half-loaded, half-saved, or stuck states.

## Decision

Document and implement explicit states: idle, camera-requesting, camera-ready, camera-denied, measuring-warmup, measuring-ready, measuring-low-confidence, breath-only, saving, saved, recoverable-error, and fatal-error.

## Consequences

Each state has a user-actionable exit. Start is idempotent while a session is running.

## Alternatives Considered

Boolean-only state was rejected because it cannot explain transitions clearly.
