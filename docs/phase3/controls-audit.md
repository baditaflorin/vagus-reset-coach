# Phase 3 Controls Audit

Date: 2026-05-09

Scope: current Phase 2.1 app before Phase 3 completeness implementation.

## Status Grid

| Control                | Status      | Notes                                                                                    |
| ---------------------- | ----------- | ---------------------------------------------------------------------------------------- |
| `Camera`               | Works fully | Starts the local webcam preview. Idempotent after the stream exists.                     |
| `Start`                | Works fully | Starts the reset and makes breath-only fallback explicit when camera HRV is unavailable. |
| `Stop`                 | Works fully | Stops the in-progress reset.                                                             |
| `Audio`                | Works fully | Toggles cues and persists the preference locally.                                        |
| `Export`               | Works fully | Downloads the versioned app-state JSON contract.                                         |
| `Import`               | Works fully | Restores state from exported JSON by file picker, drop, paste, or clipboard read.        |
| `Copy`                 | Works fully | Copies a compact local summary to the clipboard.                                         |
| `Print`                | Works fully | Opens a print-friendly summary window.                                                   |
| `Clear`                | Works fully | Clears IndexedDB session records after confirmation.                                     |
| `Reset settings`       | Works fully | Restores local preferences to defaults.                                                  |
| `Clear all local data` | Works fully | Clears settings, history, and interrupted-session markers after confirmation.            |
| `Retry save`           | Works fully | Retries saving a pending record after a recoverable storage failure.                     |
| `GitHub`               | Works fully | Opens the repository.                                                                    |
| `PayPal`               | Works fully | Opens support link.                                                                      |

## Notes

- The remaining control risk is browser permission variance, not missing handlers.
