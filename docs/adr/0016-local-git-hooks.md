# 0016 Local Git Hooks

## Status

Accepted

## Context

The project intentionally has no GitHub Actions.

## Decision

Use plain `.githooks/` scripts wired by `make install-hooks`. Hooks run formatting/lint/typecheck, gitleaks, Conventional Commits validation, tests, build, and smoke.

## Consequences

Checks are local and explicit. Missing optional tools fail with clear installation guidance.

## Alternatives Considered

Lefthook was considered, but plain hooks are transparent and avoid another tool dependency.
