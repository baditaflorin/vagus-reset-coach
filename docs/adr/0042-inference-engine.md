# 0042 Inference Engine

## Status

Accepted

## Context

Users expect the app to infer whether it is seeing a usable face signal.

## Decision

Add a deterministic signal diagnostics engine. It infers warm-up, no camera, low light, overexposure/glare, low face presence, motion/drift, and noisy peaks from frame statistics plus pulse metrics. Each inference carries confidence, reason codes, and a next step.

## Consequences

Breath adaptation and scoring are gated by diagnostics confidence. The engine favors low-confidence honesty over optimistic measurement.

## Alternatives Considered

Full face-landmark tracking was deferred because it adds large WASM/model assets and is not needed for the first substance pass.
