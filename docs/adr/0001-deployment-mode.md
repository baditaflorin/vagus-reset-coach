# 0001 Deployment Mode

## Status

Accepted

## Context

V1 must guide a two-minute stress reset without a wearable, avoid secrets, protect biometric data, and publish on GitHub Pages from day one.

## Decision

Use Mode A: Pure GitHub Pages. The app runs entirely in the browser with `getUserMedia`, Canvas, Web Audio, DuckDB-WASM, IndexedDB, and OPFS/local browser storage.

## Consequences

- No runtime backend, Docker image, nginx, server metrics, server auth, or server secrets are part of v1.
- Webcam frames, pulse estimates, HRV estimates, and session logs stay on the user's device.
- DuckDB-WASM and other heavier modules are lazy-loaded after user action.
- Cross-device sync and clinician dashboards are deferred.

## Alternatives Considered

- Mode B: unnecessary because no shared static dataset is needed.
- Mode C: rejected because v1 does not need runtime writes, secrets, auth, or server-side computation.
