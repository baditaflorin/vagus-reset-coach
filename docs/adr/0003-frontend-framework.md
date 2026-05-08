# 0003 Frontend Framework And Build Tooling

## Status

Accepted

## Context

The interface is interactive, stateful, and needs TypeScript, a small bundle, and GitHub Pages support.

## Decision

Use React, strict TypeScript, Vite, Tailwind CSS, Vitest, and Playwright.

## Consequences

Vite builds to `docs/` for Pages. React keeps the session UI composable, while signal processing stays in plain TypeScript modules.

## Alternatives Considered

Vanilla TypeScript was viable, but React lowers UI state complexity for the real-time session and history views.
