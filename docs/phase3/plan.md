# Phase 3 Plan

Date: 2026-05-09

Ranked by real-user impact.

## Selected Implementation Items

1. Add canonical app-state export/import schema.
2. Add session-history import from JSON file.
3. Add drag-drop and paste import support for exported JSON.
4. Add copy summary to clipboard.
5. Add print-friendly session summary action.
6. Add persistent app settings storage.
7. Add a settings panel with only working toggles and controls.
8. Add adaptive pacing toggle and manual breathing-rate control.
9. Persist audio preference.
10. Add explicit factory-reset flow for settings plus history.
11. Restore last-used app preferences on reload.
12. Surface import/restore failures with actionable error messages.
13. Document `?debug=1` and add copy-debug action.
14. Extract app-state file contract from `App.tsx`.
15. Extract persistence helpers for settings and session files.
16. Remove `OPFS` claims from docs and diagrams.
17. Replace narrow runtime casts at browser/data boundaries with schema validation.
18. Reduce `App.tsx` responsibilities by moving state persistence and import/export orchestration into feature modules.
19. Expand unit tests for export/import round-trip and settings migration.
20. Expand Playwright smoke coverage for import/export/settings metadata.
21. Run stranger test in a fresh browser context and fix the top 3 issues found.
22. Add honest README limitations and verified feature checklist.

## Planned Commit Sequence

1. `chore: phase 3 completeness audit`
2. `docs: define phase 3 completeness decisions`
3. `feat(settings): persist app preferences`
4. `feat(history): support session import and full state export`
5. `feat(history): add copy and print actions`
6. `refactor(app): extract state ownership modules`
7. `docs: align claims with shipped functionality`
8. `test: cover phase 3 ownership flows`
9. `docs: add phase 3 stranger test and postmortem`
10. `chore: release 0.3.0`
