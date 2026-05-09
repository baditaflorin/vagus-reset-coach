# Phase 3 Codebase Audit

Date: 2026-05-09

Scope: measurement only before Phase 3 completeness implementation.

## DRY Violations

1. Camera-unavailable diagnostics are constructed in two near-identical branches in [App.tsx](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-real-time-vagus/src/App.tsx:140).
2. Session export/build metadata concepts are defined inline in [App.tsx](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-real-time-vagus/src/App.tsx:376) instead of a shared file contract module.
3. Browser-storage concerns and session validation are split between [storage.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-real-time-vagus/src/features/sessions/storage.ts:1) and [analytics.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-real-time-vagus/src/features/sessions/analytics.ts:1) without a shared export/import schema.

## SOLID Violations

1. [App.tsx](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-real-time-vagus/src/App.tsx:1) is a 602-line god module handling camera IO, pacing, storage, export, build metadata, error recovery, and layout.
2. `SessionHistory` owns only display, but key history actions are still built inline in `App`, so the history feature boundary is incomplete.
3. Persistence policy is implicit. There is no explicit app-settings or export/import boundary module.

## Dead Code / Debt

- `TODO/FIXME/XXX/HACK`: 0 occurrences in source.
- `@ts-ignore`: 0 occurrences.
- `any`: 0 explicit source-level occurrences.
- Dormant feature flags: none, but `?debug=1` is undocumented outside ADRs.

## Type-Safety Holes

1. Runtime shape assertions rely on `as` casts in [duckdb.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-real-time-vagus/src/features/sessions/duckdb.ts:61) and [rppg.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-real-time-vagus/src/features/rppg/rppg.ts:128).
2. GitHub commit API parsing in [App.tsx](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-real-time-vagus/src/App.tsx:131) trusts a narrow cast rather than shared schema validation.
3. Exported session files have no dedicated schema or migration policy.

## Inconsistent Patterns

1. Error handling is mostly inline strings in `App`, while session/storage layers throw raw `Error`s.
2. State persistence exists for history only. Preferences and recoverable app state follow no shared convention.
3. Documentation still uses `IndexedDB / OPFS` while the code uses IndexedDB only.

## Test Coverage Holes

1. No tests cover export/import round-trip because import does not exist yet.
2. No tests cover persisted settings across reload.
3. No e2e test covers recoverable history ownership actions beyond simple page load.
