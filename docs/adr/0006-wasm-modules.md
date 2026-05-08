# 0006 WASM Modules

## Status

Accepted

## Context

Local analytics need SQL-style summaries without a server.

## Decision

Use `@duckdb/duckdb-wasm`, loaded only when session history or export features need it. rPPG and breathing logic stay in TypeScript for transparency and bundle size.

## Consequences

The initial app remains lightweight. DuckDB initialization errors degrade to IndexedDB-only history rather than blocking a breathing session.

## Alternatives Considered

`sql.js` was considered, but DuckDB-WASM better supports analytical querying and future Parquet export.
