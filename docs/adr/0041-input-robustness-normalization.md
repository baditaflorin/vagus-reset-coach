# 0041 Input Robustness And Normalization Policy

## Status

Accepted

## Context

The main input is a live webcam stream represented internally as frame-stat traces. Local history is structured JSON in IndexedDB.

## Decision

Normalize frame statistics at the boundary. Clamp ratios to `[0,1]`, reject non-finite samples, preserve recoverable malformed history counts, and treat empty/partial traces as low-confidence rather than fatal.

## Consequences

The app can analyze real, partial, huge, or malformed traces without crashing. Bad records are explained instead of silently disappearing.

## Alternatives Considered

Throwing on malformed input was rejected because users need recovery and explanation.
