# Phase 3 Feature Claims Audit

Date: 2026-05-09

Scope: README, architecture docs, ADRs, and visible in-app copy after the main Phase 3 completeness implementation batch.

## Status Grid

| Claim                                                       | Status            | Notes                                                                                     |
| ----------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------- |
| Private browser-based two-minute breath coach               | Shipped fully     | Matches the current app.                                                                  |
| Webcam rPPG with local HRV/session logging                  | Shipped fully     | Works as documented.                                                                      |
| DuckDB-WASM analytics                                       | Shipped fully     | Used lazily for summaries with in-memory fallback.                                        |
| Version and commit shown in the GitHub Pages app            | Shipped fully     | Static fallback plus runtime refresh exist.                                               |
| PWA / offline-friendly shell                                | Shipped partially | The shell works offline, but live camera measurement still depends on browser permission. |
| IndexedDB local data                                        | Shipped fully     | README and architecture now match the implementation.                                     |
| Clear app data in the app or browser removes saved sessions | Shipped fully     | History clear, settings reset, and full local-data reset now exist.                       |
| Exported state can be restored locally                      | Shipped fully     | JSON import now supports current and legacy Phase 2 exports.                              |

## Remaining Mismatches

1. "Offline-friendly" should still be read as shell and history portability, not guaranteed offline camera support in every browser.
2. DuckDB is used for summaries rather than broad export formats such as CSV or Parquet.
