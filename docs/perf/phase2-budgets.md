# Phase 2 Performance Budgets

Operation budgets:

- Frame-stat diagnostics: median under 100ms, p95 under 250ms.
- Fixture suite: all 10 real-data traces under 1 second in unit tests.
- Huge trace cliff: 10x fixture trace stays under 300ms for diagnostics on the local dev machine.
- DuckDB analytics: lazy-loaded only after session history exists.

Measurements are reported in the Phase 2 postmortem.
