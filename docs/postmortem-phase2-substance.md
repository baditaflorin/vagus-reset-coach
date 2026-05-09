# Phase 2 Substance Postmortem

Date: 2026-05-09

Version: 0.2.1

## Real-Data Pass Rate

Before Phase 2, the app worked on the clean demo path but had 4 visibly mishandled inputs and several wrong-confident risks. After Phase 2, all 10 committed real-data fixtures pass the deterministic "no silent wrongness" bar: the app either marks the measurement ready, explains why it is not ready, or reports recoverable history issues.

| Fixture            | Before                      | After                                        |
| ------------------ | --------------------------- | -------------------------------------------- |
| Clean daylight     | Pass                        | Pass                                         |
| Dim warm room      | Vague low signal            | Pass: too-dark reason and next step          |
| Backlit window     | Vague or wrong-confident    | Pass: glare/backlight and darkness reasons   |
| Glasses reflection | Silent instability risk     | Pass: glare/backlight warning                |
| Face drift         | Visible failure             | Pass: face-not-centered warning              |
| Multiple faces     | Silent subject-lock risk    | Pass: subject-not-locked warning             |
| Camera denied      | Ambiguous breath-only state | Pass: breath-only measurement confidence     |
| No warm-up         | Wrong-confident score risk  | Pass: warming-up, scoring confidence reduced |
| Handheld mobile    | Vague instability           | Pass: too-much-motion warning                |
| Malformed history  | Silent record loss          | Pass: skipped records counted                |

## Top Logic Gaps

1. Fixed ROI treated as a face signal: closed with ROI diagnostics for brightness, glare, skin ratio, motion, and subject-lock conditions.
2. Single quality percentage without a cause: closed with reason codes, field confidence, labels, and user-facing next steps.
3. Starting before measurement readiness: closed by deriving explicit coach states and showing warm-up or low-confidence states.
4. Noisy signal influenced guidance: closed by gating breath adaptation and baseline updates on diagnostic readiness.
5. Malformed local records disappeared silently: closed with recoverable load reports and skipped-record counts.

## Promised Smart Behaviors

- The app knows whether it has a usable face signal before claiming HRV readiness. Evidence: fixtures 1-9 assert `ready`, confidence bounds, and reason codes.
- Low confidence is explained in human terms. Evidence: diagnostics now emit `too-dark`, `glare-or-backlight`, `face-not-centered`, `subject-not-locked`, `too-much-motion`, `warming-up`, and `breath-only`.
- Scoring and adaptation respect confidence. Evidence: session records store measurement confidence and low-confidence scores are capped.
- Permission, storage, malformed-history, and interrupted states are recoverable. Evidence: state tests require exits for every coach state, and malformed-history fixtures assert skipped records.
- Exported records carry provenance. Evidence: exports include schema version, app version, source, generated timestamp, and per-field confidence.

## Determinism

Pass. The fixture suite re-runs diagnostics on identical inputs and asserts byte-identical JSON for every real-data fixture. Session export ordering is stable because records are sorted by `startedAt` before export.

## Performance

Measured locally on 2026-05-09 with `npx tsx` over the committed fixtures:

| Operation                                          |   Median |      p95 |     Worst |
| -------------------------------------------------- | -------: | -------: | --------: |
| 300 fixture diagnostic runs                        | 0.002 ms | 0.020 ms | 55.218 ms |
| 20 huge-trace diagnostic runs, 10,000 samples each | 2.761 ms | 7.900 ms | 14.432 ms |

The Vitest suite also asserts a 10,000-sample diagnostic run stays under 300 ms.

## Surprises

- The biggest product problem was not raw rPPG math; it was confidence honesty. A low-quality signal without a reason feels broken, even when the math is behaving.
- Browser storage recovery matters more than expected because local-only products can still lose trust if history changes without explanation.
- Breath-only mode needed a first-class confidence story, not just a permission error.

## Valuable Improvements Still Open

1. Add real face landmark tracking so the ROI follows the user instead of only diagnosing fixed-ROI failure.
2. Build a longer real-camera corpus with consented frame-derived telemetry across devices and lighting setups.
3. Add a calibration phase that learns a user's neutral brightness and motion baseline.
4. Add cancellable Web Worker analysis if future rPPG stages become heavier than the current synchronous budget.
5. Add a replayable session import path so exported provenance can recreate the exact UI state.

## Honest Take

The app no longer feels like a toy in the most important Phase 2 sense: it does not pretend messy camera input is clean, and it tells the user why it is unsure. It still feels early if the user expects wearable-grade HRV or automatic face tracking. The engine is now honest and recoverable; the next leap is better sensing, not more chrome.
