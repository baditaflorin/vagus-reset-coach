# Phase 3 Controls Audit

Date: 2026-05-09

Scope: current Phase 2.1 app before Phase 3 completeness implementation.

## Status Grid

| Control           | Status          | Notes                                                                                                            |
| ----------------- | --------------- | ---------------------------------------------------------------------------------------------------------------- |
| `Camera`          | Works fully     | Starts the local webcam preview. Idempotent after the stream exists.                                             |
| `Start`           | Works partially | Starts the timer and breath coach, but also silently creates breath-only runs when camera access is unavailable. |
| `Stop`            | Works fully     | Stops the in-progress reset.                                                                                     |
| `Audio`           | Works partially | Toggles cues in-memory only; the preference is lost on refresh.                                                  |
| `Export sessions` | Works partially | Downloads JSON, but the user cannot load it back into the app.                                                   |
| `Clear sessions`  | Works fully     | Clears IndexedDB session records after confirmation.                                                             |
| `Retry save`      | Works fully     | Retries saving a pending record after a recoverable storage failure.                                             |
| `GitHub`          | Works fully     | Opens the repository.                                                                                            |
| `PayPal`          | Works fully     | Opens support link.                                                                                              |

## Notes

- There is no dedicated settings surface today, so the only mutable preference is the transient audio toggle.
- The export button over-promises a complete ownership story because import does not exist yet.
