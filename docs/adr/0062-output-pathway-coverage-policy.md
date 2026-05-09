# 0062 Output Pathway Coverage Policy

## Status

Accepted

## Context

Phase 2 exported JSON but did not define it as the canonical restore format.

## Decision

Make a versioned JSON app-state file the canonical output artifact. Also support:

- copyable text summary
- print-friendly summary
- local debug snapshot copy in debug mode

Keep these out of scope for v0.3:

- shareable URLs
- remote API submission
- cloud sync
- PDF rendering beyond browser print

## Consequences

The app has a clear ownership story without introducing privacy-hostile distribution channels.

## Alternatives Considered

Adding a shareable URL was rejected because it conflicts with the local-first privacy model and does not scale well to history payloads.
