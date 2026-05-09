# Phase 3 Input Audit

Date: 2026-05-09

Scope: current app after the main Phase 3 completeness implementation batch.

## Status Grid

| Input Pathway                        | Status          | Notes                                                                                        |
| ------------------------------------ | --------------- | -------------------------------------------------------------------------------------------- |
| Live webcam capture                  | Works fully     | Main user input. `Camera` and `Start` controls work in current browsers with `getUserMedia`. |
| Camera denied / unavailable fallback | Works fully     | Breath-only flow is explicit and preserves the rest of the app.                              |
| Imported session state file          | Works fully     | App-state JSON can now be restored through the import picker.                                |
| Restored autosave / last app state   | Works fully     | Session history, local settings, and interrupted-session notices survive reload.             |
| Demo/sample input                    | Out of scope    | Rejected in ADR 0061 to keep the tool privacy-first and webcam-first.                        |
| Deep link / URL state                | Out of scope    | Rejected in ADR 0061 for privacy and payload-size reasons.                                   |
| Paste / clipboard input              | Works fully     | Exported JSON can be pasted directly or read from the clipboard.                             |
| Drag-drop state file                 | Works fully     | The history panel accepts dropped exported JSON.                                             |
| Mobile camera picker / share sheet   | Works partially | Mobile camera access works, but manual mobile validation still depends on browser quirks.    |
| Multi-file / folder input            | Out of scope    | Rejected in ADR 0061 as unrelated to the single-user local coach.                            |

## Notes

- The real user-owned input domain here is `webcam + local state file`, not arbitrary documents.
- The main remaining yellow input row is mobile-device variability, not missing product plumbing.
