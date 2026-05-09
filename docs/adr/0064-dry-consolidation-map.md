# 0064 DRY Consolidation Map

## Status

Accepted

## Context

Phase 2 left export metadata, unavailable-camera fallbacks, and state file concepts embedded in `App.tsx`.

## Decision

Extract shared sources of truth for:

- app settings schema and persistence
- app-state export/import schema and migration
- summary text / print payload formatting
- unavailable camera diagnostics helper

Do not abstract the live rPPG loop further in this phase unless it directly improves completeness.

## Consequences

The ownership workflow becomes easier to test and harder to drift.

## Alternatives Considered

Aggressively refactoring every large module was rejected because Phase 3 should target user-facing completeness first.
