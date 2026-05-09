# Phase 3 Feature Claims Audit

Date: 2026-05-09

Scope: README, architecture docs, ADRs, and visible in-app copy before Phase 3 completeness implementation.

## Status Grid

| Claim                                                       | Status            | Notes                                                                                                                |
| ----------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| Private browser-based two-minute breath coach               | Shipped fully     | Matches the current app.                                                                                             |
| Webcam rPPG with local HRV/session logging                  | Shipped fully     | Works as documented.                                                                                                 |
| DuckDB-WASM analytics                                       | Shipped fully     | Used lazily for summaries with in-memory fallback.                                                                   |
| Version and commit shown in the GitHub Pages app            | Shipped fully     | Static fallback plus runtime refresh exist.                                                                          |
| PWA / offline-friendly shell                                | Shipped partially | Service worker is present, but user-owned state import/export is not complete enough to call the app fully portable. |
| `IndexedDB / OPFS` local data                               | Not shipped       | The implementation uses IndexedDB only. OPFS is claimed in README and architecture but not implemented.              |
| Clear app data in the app or browser removes saved sessions | Shipped partially | History clearing exists, but app preferences do not yet persist, so there is no full app-state reset concept.        |
| Export workflows supported by DuckDB-WASM                   | Shipped partially | JSON export exists, but more complete restore and machine-facing export contracts do not.                            |

## Highest-Priority Mismatches

1. `OPFS` is documented but not implemented.
2. Export is described more broadly than the current one-way JSON download.
3. "Offline-friendly" is directionally true, but ownership and restore workflows are not yet complete enough for a stranger doing repeat use.
