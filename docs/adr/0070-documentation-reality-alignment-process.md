# 0070 Documentation-Reality Alignment Process

## Status

Accepted

## Context

Phase 3 found drift around OPFS, restore workflows, and what "clear app data" actually means.

## Decision

User-facing docs may claim only behaviors that are either:

- covered by a deterministic test
- exercised by the smoke test
- verified manually in the Phase 3 stranger test

Claims that do not meet that bar must be removed or rewritten as limitations.

## Consequences

The README becomes a verified checklist instead of aspirational copy.

## Alternatives Considered

Keeping descriptive, future-leaning language was rejected because it hides completeness gaps from strangers.
