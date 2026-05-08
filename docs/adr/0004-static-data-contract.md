# 0004 Static And Local Data Contract

## Status

Accepted

## Context

Mode A has no remote dataset. The main data contract is local session history plus build metadata shown in the UI.

## Decision

Persist sessions locally with schema version `v1`:

```json
{
  "id": "string",
  "schemaVersion": 1,
  "startedAt": "ISO-8601 string",
  "durationSec": 120,
  "baselineBpm": 72,
  "endingBpm": 66,
  "rmssdMs": 38,
  "breathsPerMinute": 6,
  "coherenceScore": 72,
  "quality": 0.82,
  "notes": "optional string"
}
```

Build metadata is exposed through Vite constants: version and git commit.

## Consequences

Breaking local schema changes must bump `schemaVersion` and include a migration path.

## Alternatives Considered

Static JSON artifacts were rejected because no public data source is needed in v1.
