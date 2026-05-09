# 0046 Performance Budgets And Measurement Plan

## Status

Accepted

## Context

Signal updates must not make the coach feel laggy.

## Decision

Frame-stat diagnostics target median `<100ms`, p95 `<250ms`, and no UI-freezing synchronous work over 300ms. DuckDB remains lazy-loaded. Huge trace tests cover 1x, 5x, and 10x fixture sizes.

## Consequences

Diagnostics stay plain TypeScript and linear-time. Worker migration is deferred until the budget is exceeded.

## Alternatives Considered

Moving all rPPG work to a Worker immediately was rejected as premature.
