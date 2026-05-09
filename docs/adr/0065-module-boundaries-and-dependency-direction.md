# 0065 Module Boundaries And Dependency Direction

## Status

Accepted

## Context

`App.tsx` currently coordinates UI, persistence, import/export, and browser metadata directly.

## Decision

Keep dependency direction as:

- components -> feature modules for props and callbacks only
- `App.tsx` -> feature modules for orchestration
- feature modules -> no component imports

Introduce a dedicated `features/app-state` boundary for:

- settings persistence
- export/import contracts
- summary serialization helpers

## Consequences

State ownership moves out of the top-level view and becomes reusable from tests and future flows.

## Alternatives Considered

Creating a general-purpose hooks architecture was rejected because the immediate gain comes from pulling boundary logic out of `App`, not inventing another abstraction layer.
