# 0043 Domain Vocabulary And UI Language

## Status

Accepted

## Context

V1 exposed generic labels such as "signal" without telling the user what to change.

## Decision

Use breathing and webcam-measurement language: "face signal", "warm-up", "too dark", "glare", "motion", "breath-only", "low-confidence score", and "local record".

## Consequences

Errors and guidance should read like coaching, not implementation details.

## Alternatives Considered

Developer terms such as "ROI" and "sample variance" stay in debug mode only.
