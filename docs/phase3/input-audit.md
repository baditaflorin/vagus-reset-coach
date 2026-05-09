# Phase 3 Input Audit

Date: 2026-05-09

Scope: current Phase 2.1 app before Phase 3 completeness implementation.

## Status Grid

| Input Pathway                        | Status          | Notes                                                                                                                          |
| ------------------------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Live webcam capture                  | Works fully     | Main user input. `Camera` and `Start` controls work in current browsers with `getUserMedia`.                                   |
| Camera denied / unavailable fallback | Works partially | Breath-only flow exists, but the UI does not make the fallback feel like a first-class input path.                             |
| Imported session state file          | Not built       | History can be exported but not re-imported.                                                                                   |
| Restored autosave / last app state   | Works partially | Session history reloads from IndexedDB, but breath settings and app preferences reset on refresh.                              |
| Demo/sample input                    | Not built       | None exists, which is acceptable for a privacy-first tool, but the lack of import means there is no alternate onboarding path. |
| Deep link / URL state                | Not built       | No shareable state URL. Acceptable to keep out of scope for privacy.                                                           |
| Paste / clipboard input              | Not built       | Not relevant for webcam measurement, but useful for importing exported state payloads.                                         |
| Drag-drop state file                 | Not built       | Not relevant for measurement, but missing for import completeness.                                                             |
| Mobile camera picker / share sheet   | Works partially | Mobile browsers can open the page and request camera access, but there is no explicit mobile guidance or import flow.          |
| Multi-file / folder input            | Not built       | Out of scope for a single-session local coach.                                                                                 |

## Notes

- The real user-owned input domain here is `webcam + local state file`, not arbitrary documents.
- The biggest completeness gap is one-way data ownership: users can export history but cannot load it back.
- Persisted history exists, but persisted app settings do not.
