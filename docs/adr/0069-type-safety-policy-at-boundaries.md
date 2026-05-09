# 0069 Type-Safety Policy At Boundaries

## Status

Accepted

## Context

The codebase already avoids `any`, but a few browser and DuckDB boundaries still rely on narrow casts.

## Decision

External boundaries must validate unknown data with a schema or guard before the app trusts it:

- imported JSON files
- GitHub commit API responses
- DuckDB summary rows
- local-storage settings payloads

Unsafe casts may remain only inside tiny normalization helpers whose sole job is bridging third-party APIs.

## Consequences

Completeness work will not add new silent coercions while expanding ownership flows.

## Alternatives Considered

Relying on TypeScript alone was rejected because imported JSON and browser APIs are runtime data, not compile-time guarantees.
