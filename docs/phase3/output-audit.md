# Phase 3 Output Audit

Date: 2026-05-09

Scope: current app after the main Phase 3 completeness implementation batch.

## Status Grid

| Output Pathway          | Status       | Notes                                                                         |
| ----------------------- | ------------ | ----------------------------------------------------------------------------- |
| On-screen live metrics  | Works fully  | Heart rate, RMSSD, signal quality, and pacer state render during use.         |
| Saved local history     | Works fully  | Valid session records persist in IndexedDB and reload on refresh.             |
| JSON export             | Works fully  | Exported app-state JSON is versioned and restoreable.                         |
| Copy to clipboard       | Works fully  | Users can copy a summary and, in debug mode, the debug snapshot.              |
| Downloadable state file | Works fully  | `vagus-reset-state.json` is the canonical restore format.                     |
| Print-friendly summary  | Works fully  | A print window can be opened from the history panel.                          |
| Shareable URL           | Out of scope | Rejected in ADR 0062 for privacy and payload-size reasons.                    |
| API-ready output        | Out of scope | Rejected in ADR 0062; the supported portable contract is the state JSON file. |
| Debug export            | Works fully  | `?debug=1` now supports clipboard copy.                                       |

## Notes

- The remaining output scope questions are intentionally policy decisions, not missing implementations.
