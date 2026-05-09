# 0040 Real-Data Audit Findings And Substance Metrics

## Status

Accepted

## Context

The v1 app works on clean webcam conditions but is brittle with low light, drift, glare, missing camera permission, early starts, and malformed local history.

## Decision

Use the 10 Phase 2 audit scenarios as the grading rubric. Success means the app avoids wrong-confident output, explains low confidence, and produces deterministic session records.

## Consequences

Every signal, scoring, storage, and export change must be covered by a fixture or deterministic unit test.

## Alternatives Considered

Adding more UI or onboarding was rejected because it would not fix the measurement engine.
