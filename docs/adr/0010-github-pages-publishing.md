# 0010 GitHub Pages Publishing Strategy

## Status

Accepted

## Context

The live Pages URL is a first-class deliverable from commit one.

## Decision

Publish from the `main` branch `/docs` folder. Vite builds directly to `docs/` with base path `/vagus-reset-coach/`, hashed assets, `.nojekyll`, and a copied `404.html` fallback.

## Consequences

`docs/` is intentionally committed and is not gitignored. Rollback is a normal git revert of the publishing commit.

## Alternatives Considered

A `gh-pages` branch was rejected because committed `docs/` keeps the static artifact visible and simple for this small app.
