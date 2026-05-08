# 0002 Architecture Overview And Module Boundaries

## Status

Accepted

## Context

The app needs real-time signal processing, a calm interaction loop, local persistence, and a static deploy target.

## Decision

Use a feature-first frontend:

- `features/rppg`: webcam frame sampling, ROI selection, pulse estimation, HRV metrics, signal quality.
- `features/breath`: breath pacing state machine, adaptive target cadence, Web Audio cues.
- `features/sessions`: local persistence, DuckDB-backed analytics, export.
- `components`: shared UI primitives.
- `lib`: browser capability, formatting, and metadata helpers.

## Consequences

Feature modules own their logic and tests. Shared utilities remain small and framework-agnostic where practical.

## Alternatives Considered

A page-only implementation was rejected because signal processing, pacing, and storage need separable tests.
