# 0005 Client-Side Storage Strategy

## Status

Accepted

## Context

Session history is private biometric-derived data and should remain local.

## Decision

Use IndexedDB for durable session records. Lazy-load DuckDB-WASM for query and export workflows, with OPFS/IndexedDB-compatible browser storage where available and an in-memory fallback.

## Consequences

The app works without accounts. Users can clear data from the app or browser settings.

## Alternatives Considered

`localStorage` was rejected for primary storage because it is synchronous and not ideal for structured records.
