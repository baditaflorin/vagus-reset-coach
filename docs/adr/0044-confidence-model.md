# 0044 Confidence Model

## Status

Accepted

## Context

No silent wrongness is the core Phase 2 bar.

## Decision

Use a 0-1 measurement confidence with labels: high `>=0.72`, medium `>=0.48`, low otherwise. Confidence combines pulse quality, warm-up, light, glare, face-presence, motion, and camera availability. Per-field confidence is stored for baseline BPM, ending BPM, RMSSD, and coherence score.

## Consequences

Exports and history carry confidence. Low-confidence sessions remain useful but are visibly labeled.

## Alternatives Considered

Hiding uncertain metrics was rejected because users still need breath-only progression context.
