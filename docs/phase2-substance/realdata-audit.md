# Phase 2 Substance Real-Data Audit

Date: 2026-05-08

Scope: v1 `vagus-reset-coach`, Mode A GitHub Pages app. The product's primary "input" is not a file; it is a live webcam stream plus browser/session environment. This audit treats real-world capture conditions, permission states, and session records as the messy inputs users bring.

## 10 Real-World Inputs

| #   | Input                                                                                 | v1 happy-path result                                                                      | Should have happened                                                                           | Why it fails or strains                                                                     | Failure visibility                                | Manual work forced on user                                           |
| --- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | Clean laptop webcam, daylight, one still face centered                                | Camera starts, ROI guide is usable, pacer runs, metrics warm up and may produce BPM/RMSSD | Same; this is the intended happy path                                                          | Works if the face naturally aligns with the fixed ROI                                       | Mostly clear                                      | User still has to self-align to the ROI without calibration feedback |
| 2   | Mildly dim room, face centered, warm lamp                                             | App samples frames but signal confidence may stay low or "Still reading"                  | Explain that lighting is too dim/warm and suggest moving toward brighter neutral light         | Quality score blends brightness/cadence/regularity but does not diagnose the specific cause | Vague; low signal is visible but not actionable   | User guesses whether to move, add light, sit still, or adjust camera |
| 3   | Bright backlight from window behind user                                              | Camera preview looks fine to user; rPPG likely low quality or unstable                    | Detect backlighting/low facial brightness and say "face is underexposed; turn toward light"    | v1 only samples average ROI color and does not compare face ROI to scene lighting           | Vague or wrong-but-confident if peaks appear      | User has to understand lighting physics                              |
| 4   | User wears glasses with screen reflections                                            | Fixed ROI can catch glare/forehead reflection; BPM may be unstable                        | Flag specular/high-variance ROI and recommend lowering screen brightness or tilting glasses    | No glare/reflection detector or ROI variance model                                          | Could be silent wrongness                         | User has to infer why signal jumps                                   |
| 5   | Face off-center or user slouches during session                                       | Fixed ROI samples background/hair/cheek; signal quality drops, no auto-correction         | Detect face drift, pause confidence, and guide "move face back into oval"                      | No face tracking, no skin/face presence validation                                          | Vague; "signal %" changes but not domain-specific | User has to notice the ROI mismatch themselves                       |
| 6   | Multiple faces in webcam view                                                         | App samples the fixed ROI regardless of which face is intended                            | Detect multiple faces or at least warn that another face may corrupt the signal                | No face count or subject lock                                                               | Silent or wrong-but-confident                     | User has to clear background without being told                      |
| 7   | Camera permission denied or unavailable                                               | App can still start a breath-only session, but the measurement story is ambiguous         | Clearly switch to "breath-only mode" and explain no HRV will be logged from video              | Permission failure is shown, but session state and metrics remain shaped like measured mode | Partly visible                                    | User has to know which metrics are unavailable                       |
| 8   | User starts immediately with no 20-30s warm-up                                        | Session begins; baseline BPM may be null; summary can still score with heuristic defaults | Calibrate first or label baseline as "not established" and reduce confidence/export provenance | v1 starts timer before signal readiness and scoring tolerates missing baseline              | Wrong-but-confident risk in summary score         | User has to wait voluntarily before pressing Start                   |
| 9   | Mobile browser in portrait, hand-held phone with motion                               | UI loads, but motion makes rPPG unreliable; timer continues                               | Detect motion/frame instability and advise propping phone up or switching to breath-only       | No motion/ROI stability detector; sampling assumes stable camera                            | Vague                                             | User has to realize hand motion breaks rPPG                          |
| 10  | Existing local history includes old/malformed records or browser storage quota issues | Invalid records are filtered silently; storage failures can surface as generic errors     | Explain which records were skipped and preserve/export recoverable data                        | Schema parse failures are dropped; storage errors are not domain-specific                   | Silent for malformed records                      | User cannot tell why history counts changed                          |

## Inputs Visibly Mishandled Today

- #5 face drift: the app keeps running while sampling the wrong region.
- #7 denied camera: the app remains usable but does not clearly become breath-only.
- #8 no warm-up: the app can save a confident-looking score with weak or missing baseline data.
- #10 malformed local records: invalid history is silently discarded.

## Top 5 Logic Gaps

1. Fixed ROI is treated as a face signal even when it contains background, glare, hair, or a different face.
2. Signal quality is a single percentage; it does not explain the likely cause or next correction.
3. The session timer can start before measurement confidence is ready, so baseline/HRV may be missing while the summary still looks authoritative.
4. Breath pacing adapts from noisy metrics without a confidence gate strong enough to prevent bad signal from influencing guidance.
5. Local session validation drops malformed records silently instead of reporting recoverable history issues.

## Top 3 Intuition Failures

1. "Start" feels like it means "the app is measuring me," even when camera signal is not ready.
2. A low signal percentage does not tell the user what to change.
3. A saved coherence score looks precise even when key inputs were missing or low confidence.

## Top 3 "Feels Stupid" Moments

1. The user has to align their face to a fixed oval; the app should infer face presence and drift.
2. The user has to decide whether bad readings are caused by light, motion, glare, or positioning.
3. The user has to know that camera-denied mode means HRV is unavailable; the app should say that and adjust the session summary.

## What "Smart" Means For This Product

- The app knows whether it is actually seeing a usable face signal before it claims to measure HRV.
- The app explains low confidence in human terms: too dark, too much motion, off-center face, glare, multiple faces, or warming up.
- The app gates scoring and adaptation on confidence, and labels uncertain outputs instead of presenting them as precise.
- The app recovers cleanly from permission, storage, malformed-history, and interrupted-session states.
- The app creates reproducible session records with per-field confidence and provenance.

## Phase 2 Substance Success Metrics

- At least 7/10 audit inputs complete the primary reset flow without wrong-confident output.
- 10/10 low-confidence or failed measurement states show a domain-specific reason and next step.
- Session scoring is blocked or labeled low-confidence whenever baseline BPM, ending BPM, or RMSSD is missing.
- Face/ROI drift, low brightness, high motion, and warm-up are detected within 3 seconds of occurrence.
- Re-running deterministic fixture traces produces byte-identical session summaries 100% of the time.
- Median analysis update time stays under 100ms; p95 under 250ms on fixture traces.
- Malformed local history never disappears silently; every skipped record is counted and explained.

## Out Of Scope For Phase 2 Substance

- No new product surface area beyond the existing camera coach, pacer, metrics, and local history.
- No visual polish, theme work, landing-page work, or marketing assets.
- No backend, accounts, cloud sync, wearable integrations, or analytics.
- No clinical claims or medical-grade validation.
- No Phase 3 polish items such as command palettes, onboarding tours, or social sharing.
