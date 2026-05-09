# 0066 Error-Handling Convention

## Status

Accepted

## Context

The app already distinguishes recoverable storage errors, but import and settings flows need the same discipline.

## Decision

User-facing errors in completeness flows must include:

- what failed
- why in browser or state-file terms
- what the user can do next

Recoverable errors stay inline in the relevant panel and never clear valid history/settings as a side effect.

## Consequences

Import failures, storage failures, and reset confirmations become consistent and easier to trust.

## Alternatives Considered

Using raw exception text directly was rejected because it leaks browser implementation details and is not actionable.
