# Phase 2 Substance Plan

Ranked by impact on the real-data audit, not implementation novelty.

## Selected §2 Items

1. #16 Confidence scores on every inference.
2. #32 Actionable errors with what / why / now what.
3. #24 Enumerate every reachable state.
4. #25 No stuck states.
5. #35 Deterministic outputs.
6. #38 Output provenance.
7. #18 Surface anomalies.
8. #12 Domain-aware validation.
9. #33 Validate at boundaries.
10. #34 Recoverable vs fatal is explicit.
11. #1 Fuzz the parser/trace evaluator with real fixtures and edge cases.
12. #3 Huge inputs with documented budgets.
13. #4 Partial inputs degrade meaningfully.
14. #5 Adversarial input never crashes.
15. #8 Useful first guess on first input.
16. #9 Format normalization by default.
17. #11 Domain vocabulary in UI.
18. #14 Domain-aware export metadata.
19. #17 Suggest fixes when something is wrong.
20. #19 Explain decisions.
21. #26 Cancellation actually cancels for long-running/session flows.
22. #27 Concurrency safety for repeated Start/Stop actions.
23. #28 Profile real-data inputs.
24. #31 Cache expensive derived summaries.
25. #36 Inspectable history.
26. #37 Debug overlay.

## Implementation Batches

1. Fixture harness and ADRs: real-data traces, expected outcomes, state/error/performance docs.
2. Measurement intelligence: signal diagnostics, confidence labels, reason codes, next steps.
3. Session intelligence: confidence-gated scoring, provenance, deterministic export, malformed-history reporting.
4. UI language: domain vocabulary, visible confidence, debug surface, recoverable state exits.
5. Verification: fixture pass-rate tests, determinism tests, smoke, performance notes, postmortem.

## Pass-Rate Trend

- Before implementation: 4/10 inputs have visible or wrong-confident failures.
- Target after implementation: at least 7/10 pass without wrong-confident output.
