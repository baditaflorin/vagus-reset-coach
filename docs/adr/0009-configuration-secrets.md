# 0009 Configuration And Secrets Management

## Status

Accepted

## Context

The frontend must never hold secrets.

## Decision

Only public build metadata is configured: `VITE_APP_VERSION` and optional `VITE_APP_COMMIT`. The live commit display uses GitHub's public commits API, which requires no secret. `.env*` files are ignored except `.env.example`.

## Consequences

No API keys, tokens, or private hostnames are required. Gitleaks runs in the local pre-commit hook.

## Alternatives Considered

Runtime configuration endpoints were rejected because there is no backend.
