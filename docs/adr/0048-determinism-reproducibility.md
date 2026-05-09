# 0048 Determinism And Reproducibility

## Status

Accepted

## Context

Session summaries and fixture results must be reproducible.

## Decision

Deterministic trace inputs produce byte-identical summaries. Exports include app version, schema version, generated-at timestamp, algorithm version, source, and confidence fields. Tests normalize volatile timestamps when asserting determinism.

## Consequences

Randomness is limited to user-facing record IDs and is excluded from deterministic fixture assertions.

## Alternatives Considered

Locale-dependent formatting in records was rejected.
