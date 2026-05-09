# 0071 Stranger-Test Findings And Response

## Status

Accepted

## Context

Phase 3 requires a cold-start test in a fresh browser context to verify that a stranger can use their own local state and understand the app without hand-holding.

## Decision

Run the stranger test against the local Vite build with a fresh browser context and a real exported state fixture. Treat the top three confusions as ship blockers for Phase 3.

## Findings Addressed

1. Import feedback appeared before imported history finished hydrating, which made the app feel inconsistent.
2. Import success appeared in two places at once, which felt noisy and slightly broken.
3. Settings persistence needed to be visible after reload, not just claimed in docs.

## Consequences

Import feedback now appears only after restore completes, in the panel where the restore action happened, and the smoke test verifies persisted imported settings across reload.

## Alternatives Considered

Treating the stranger pass as informal manual QA only was rejected because the biggest findings were concrete enough to automate and document.
