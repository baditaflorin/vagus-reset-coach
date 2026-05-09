# 0005 Client-Side Storage Strategy

## Status

Accepted

## Context

Session history is private biometric-derived data and should remain local.

## Decision

Use IndexedDB for durable session records. Use local storage for small app preferences. Lazy-load DuckDB-WASM for query workflows, with an in-memory fallback if analytics initialization fails.

## Consequences

The app works without accounts. Users can clear data from the app or browser settings.

## Alternatives Considered

`localStorage` was rejected for primary storage because it is synchronous and not ideal for structured records.
