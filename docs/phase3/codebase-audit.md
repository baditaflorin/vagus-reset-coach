# Phase 3 Codebase Audit

Date: 2026-05-09

Scope: measurement only before Phase 3 completeness implementation.

## DRY Violations

1. No meaningful user-flow duplication remains in the ownership path. App-state schema, settings persistence, and import/export formatting now live under `features/app-state`.
2. The largest remaining repetition is orchestration inside [App.tsx](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-real-time-vagus/src/App.tsx:1), not duplicated business logic.

## SOLID Violations

1. [App.tsx](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-real-time-vagus/src/App.tsx:1) is still the largest coordination module at 800+ lines and remains the main code-health candidate for Phase 4.
2. Camera runtime and layout orchestration still live together at the top level.
3. The new ownership boundaries exist, but camera-session orchestration has not been pulled into its own hook yet.

## Dead Code / Debt

- `TODO/FIXME/XXX/HACK`: 0 occurrences in source.
- `@ts-ignore`: 0 occurrences.
- `any`: 0 explicit source-level occurrences.
- Dormant feature flags: none, but `?debug=1` is undocumented outside ADRs.

## Type-Safety Holes

1. Runtime shape assertions still rely on small `as` casts in [duckdb.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-real-time-vagus/src/features/sessions/duckdb.ts:61) and [rppg.ts](/Users/live/Documents/Codex/2026-05-08/implemment-the-following-real-time-vagus/src/features/rppg/rppg.ts:128).
2. The remaining casts are boundary helpers rather than app-flow logic.

## Inconsistent Patterns

1. Error handling is still mostly inline strings in `App`, while storage layers throw raw `Error`s.
2. Camera-session state is still managed differently from ownership state.

## Test Coverage Holes

1. Recoverable save retry still lacks browser-level coverage.
2. Live camera permission states remain manual-validation territory.
