# 0067 State-Management Convention

## Status

Accepted

## Context

History is persisted, settings are not, and transient UI notices live ad hoc in `App.tsx`.

## Decision

Split state into three categories:

- durable local state: history and settings
- recoverable runtime state: pending save, interrupted run marker
- ephemeral view state: banners, import text draft, open/closed affordances

Only durable and recoverable runtime state need schema/version handling.

## Consequences

Reload behavior becomes intentional rather than incidental.

## Alternatives Considered

Persisting every UI bit was rejected because it adds noise without improving the user’s real work.
