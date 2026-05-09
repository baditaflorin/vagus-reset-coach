# Phase 3 Findings

Date: 2026-05-09

## Top 5 Usability Gaps

1. Users can export history but cannot load it back, so the app does not yet support true user-owned state.
2. Settings are transient. Audio and pacing preferences reset after refresh.
3. There is no dedicated settings or reset surface, so the app lacks a complete "start fresh" and "pick my defaults" story.
4. The `Start` control works, but its breath-only fallback is not explicit enough for a first-time user.
5. Documentation claims local storage capabilities more broadly than the current implementation provides.

## Top 5 Half-Baked Features

1. JSON export: finish with validated import and round-trip docs.
2. Audio preference: finish with persistence and clear settings UI.
3. Debug mode: finish with copy/export support and documented entry.
4. Build metadata fallback: keep, but move it out of `App` orchestration.
5. OPFS references: delete from docs unless implemented.

## Top 5 Codebase Pain Points

1. `App.tsx` is too large and owns too many responsibilities.
2. Session file format is implicit rather than a first-class schema.
3. Persistence logic exists only for history, not app settings.
4. Error messaging lacks a central convention for storage/import failures.
5. Boundary parsing still uses a few ad hoc casts.

## Top 5 Documentation / Reality Mismatches

1. README and architecture docs mention `OPFS`, but the code does not use it.
2. Export is presented like a complete workflow, but restore is missing.
3. Privacy docs imply "clearing app data" more broadly than the actual UI offers.
4. Debug mode exists but is not documented in user-facing docs.
5. The README quickstart does not describe the canonical user ownership flow because one does not exist yet.

## Definition Of Fully Usable

1. A stranger can open the app, grant or deny camera access, and still understand the next best action.
2. A returning user can reload the page and keep their history and preferences without reconfiguring the app.
3. A user can export their local state, clear the app, and import that state back successfully.
4. A user can inspect, copy, or print a meaningful summary without browser-devtools workarounds.
5. All public docs describe exactly the features the shipped app actually has.

## Phase 3 Success Metrics

- Input audit: every relevant row green, with irrelevant rows explicitly out of scope by ADR.
- Output audit: JSON round-trip, copy summary, and full reset flow all green.
- Controls audit: every visible control performs its labeled action end-to-end.
- Codebase: `App.tsx` reduced materially, export/import schema centralized, and app settings persistence extracted from view logic.
- Tests: add round-trip coverage for state export/import and persisted settings.
- Docs: remove all OPFS drift and add a verified limitations section.

## Out Of Scope

- No new measurement engine or model changes.
- No social sharing, cloud sync, accounts, or backend.
- No cosmetic polish pass beyond what is needed to make new controls understandable.
- No remote telemetry or server-side state.
