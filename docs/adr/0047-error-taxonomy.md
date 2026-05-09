# 0047 Error Taxonomy And Messaging Guidelines

## Status

Accepted

## Context

Browser APIs fail in user-facing ways: permission denied, unsupported camera, storage quota, malformed history, and low-quality signals.

## Decision

Every error has: what failed, why in domain terms, and now what. Errors are classified as recoverable or fatal. Recoverable errors keep the session/history intact.

## Consequences

Generic exceptions should not reach users. Domain-level guidance is required at boundaries.

## Alternatives Considered

Stack-trace style errors were rejected.
