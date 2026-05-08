# Postmortem

## What Was Built

Vagus Reset Coach v0.1.0 is a pure GitHub Pages app for a private two-minute stress reset. It includes webcam rPPG sampling, live pulse/HRV estimates, adaptive breath pacing, Web Audio cues, IndexedDB session history, DuckDB-WASM analytics, PWA support, version/commit display, and visible project/support links.

Live site: https://baditaflorin.github.io/vagus-reset-coach/

Repository: https://github.com/baditaflorin/vagus-reset-coach

## Was Mode A Correct?

Yes. Mode A was the right deployment mode. The browser can access the webcam, run the signal processing, play audio cues, and store/query local history without a backend. A runtime server would have increased privacy risk and operating cost without improving v1.

## What Worked

- GitHub Pages served the app from `main /docs` without a backend.
- Initial JS stayed below the 200KB gzipped budget; DuckDB-WASM is loaded lazily.
- Local smoke tests verify the Pages build, public links, version, and commit metadata.
- No analytics or telemetry were needed.

## What Did Not Work

- DuckDB-WASM assets are large, so they must stay outside the service worker precache.
- Automated real-camera validation is not reliable enough for CI-style tests, so v1 uses deterministic synthetic rPPG tests plus manual camera verification.

## Surprises

Vite PWA initially tried to precache the large DuckDB-WASM files. The fix was to precache the shell and keep analytics WASM lazy.

## Accepted Tech Debt

- rPPG uses a guided face ROI instead of a full face-landmark model.
- Session scoring is a transparent heuristic, not a clinically validated vagal tone measure.
- History is single-device only.

## Next Improvements

1. Add optional browser FaceDetector/MediaPipe ROI tracking when it can be lazy-loaded within the budget.
2. Add CSV/Parquet export from DuckDB-WASM.
3. Add a calibration step that explains lighting, stillness, and face placement before the two-minute timer starts.

## Time Spent Versus Estimate

Estimated: 3-4 hours for a complete static v1 scaffold and implementation.

Actual: about 3 hours of focused implementation and verification.
