# Phase 3 Postmortem

Date: 2026-05-09

Version: 0.3.0

## Audit Grids

Before vs after:

- Input audit: `1 green / 2 yellow / 7 red` -> `6 green / 1 yellow / 3 out of scope`
- Output audit: `2 green / 2 yellow / 5 red` -> `6 green / 1 yellow / 2 out of scope`
- Controls audit: `6 green / 3 yellow / 0 red` -> `14 green / 0 yellow / 0 red`
- Feature claims audit: major `OPFS` and export/restore drift removed; remaining partial claim is offline shell versus live camera reality

## Half-Baked Feature Triage

- Finished: JSON export by making it a versioned app-state file with import and migration support.
- Finished: audio preference by persisting it and surfacing it in settings.
- Finished: debug mode by adding copy support and documenting its purpose.
- Finished: app reset flows by adding settings reset and full local-data reset.
- Deleted: `OPFS` documentation claims that were not backed by the implementation.

## Codebase Health Metrics

Before vs after:

- DRY ownership-path violations: `3` -> `0 meaningful duplicates`, with shared app-state schema and helpers now under `features/app-state`
- `TODO/FIXME/XXX/HACK`: `0` -> `0`
- explicit `any`: `0` -> `0`
- `@ts-ignore`: `0` -> `0`
- ownership-path browser coverage: `load-only smoke` -> `import + persisted settings + reload smoke`

What did not improve enough:

- `App.tsx` grew from roughly `602` lines to `860` lines while Phase 3 added real ownership UI. The boundary logic moved out, but the camera/session orchestration still needs extraction in Phase 4.

## Stranger Test

Method: fresh Playwright browser context with a real exported state fixture.

Top 3 findings:

1. Import feedback appeared before imported history visibly settled.
2. Import feedback appeared in two places at once.
3. Settings persistence needed proof after reload, not just a success banner.

Response:

- Import feedback now appears after restore completes.
- Import-specific feedback is isolated to the import panel.
- Browser smoke coverage now verifies imported settings and imported history after reload.

## Documentation Drift Fixed

- Removed `OPFS` from README and architecture docs.
- Rewrote README as a verified feature checklist plus limitations.
- Updated privacy docs so "clear app data" matches the actual UI.
- Updated ADRs `0001`, `0004`, and `0005` to match shipped storage and commit-metadata behavior.

## Surprises

- The biggest usability gain was not another feature. It was making local state portable and recoverable.
- A small timing mismatch in import feedback made the app feel less trustworthy than the underlying code actually was.
- Once import existed, settings persistence became much more important because users immediately noticed when imported preferences did not stick.

## Most Valuable Open Gaps

1. Extract camera/session orchestration out of `App.tsx`.
2. Add browser-level coverage for recoverable save retry, not just import and reload.
3. Verify mobile camera behavior and mobile import affordances on real devices.
4. Add optional CSV export if users need downstream spreadsheet workflows.
5. Add a clearer first-run explanation for why breath-only mode can still be useful when camera HRV is unavailable.

## Honest Take

Yes, a stranger can now use this app for their own local workflow end to end without asking for help, as long as that workflow is "open the site, run a reset or use breath-only mode, keep local preferences, export state, restore state later, and clear data when done." The remaining "not yet" is mostly around platform variability, especially mobile camera behavior and the still-large top-level app module, not missing product plumbing.
