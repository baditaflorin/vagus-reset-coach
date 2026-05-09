# 0068 Persistence Schema And Migration Policy

## Status

Accepted

## Context

Phase 2 defined session-record schema but not a complete app-state file contract or settings migration path.

## Decision

Define three versioned schemas:

- session records in IndexedDB
- app settings in local storage
- exported app-state JSON files

Support migration from the legacy Phase 2 export shape that contained `records` only. Missing settings from legacy files resolve to defaults.

## Consequences

Users can keep older exports and still restore them after the Phase 3 release.

## Alternatives Considered

Rejecting older exports was rejected because it would break the only ownership path already shipped.
