# 0061 Input Pathway Coverage Policy

## Status

Accepted

## Context

The product does not parse arbitrary documents. Its meaningful inputs are camera access, camera-denied breath-only fallback, and user-owned local state files.

## Decision

Treat these as in-scope input pathways:

- live webcam capture
- camera denied / unavailable breath-only fallback
- imported local state JSON by file picker
- imported local state JSON by drag-drop or paste
- restored local history and settings on reload

Treat these as out of scope for v0.3:

- URL ingestion
- multi-file and folder ingestion
- remote share links
- generic clipboard/media parsing unrelated to exported state

## Consequences

The app can honestly claim complete ownership of its relevant inputs without pretending to be a general-purpose importer.

## Alternatives Considered

Supporting arbitrary links or files was rejected because it does not match the webcam-first product domain and would add confusing surface area.
