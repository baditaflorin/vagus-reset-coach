# 0063 Half-Baked Feature Triage Decisions

## Status

Accepted

## Context

Several surfaces were close to useful but not complete enough for a stranger.

## Decision

- Finish JSON export by adding import and migration support.
- Finish audio preference by persisting it and surfacing it in settings.
- Finish debug mode by documenting it and supporting copy/export of its snapshot.
- Finish app reset flows by adding settings reset and factory reset.
- Delete OPFS claims from docs instead of pretending the implementation exists.

## Consequences

The app surface gets smaller in fiction and larger in truth.

## Alternatives Considered

Leaving these as implicit power-user behaviors was rejected because it hides incomplete ownership flows behind an otherwise polished UI.
