import type { AnalyticsSummary, SessionRecord } from "./types";
import type { SignalDiagnostics } from "../rppg/types";

export async function summarizeSessions(
  sessions: SessionRecord[],
): Promise<AnalyticsSummary> {
  if (sessions.length === 0) {
    return emptySummary();
  }

  try {
    const { summarizeSessionsWithDuckDb } = await import("./duckdb");
    return await summarizeSessionsWithDuckDb(sessions);
  } catch {
    return summarizeInMemory(sessions);
  }
}

export function summarizeInMemory(sessions: SessionRecord[]): AnalyticsSummary {
  if (sessions.length === 0) {
    return emptySummary();
  }

  const coherenceScores = sessions.map((session) => session.coherenceScore);
  const rmssdValues = sessions
    .map((session) => session.rmssdMs)
    .filter((value): value is number => value !== null);
  const lastSeven = sessions
    .slice(0, 7)
    .map((session) => session.coherenceScore);
  const lowConfidenceCount = sessions.filter(
    (session) => session.confidenceLabel === "low",
  ).length;

  return {
    sessionCount: sessions.length,
    averageCoherence: Math.round(average(coherenceScores)),
    averageRmssdMs:
      rmssdValues.length === 0 ? null : Math.round(average(rmssdValues)),
    bestCoherence: Math.max(...coherenceScores),
    lastSevenAverage: Math.round(average(lastSeven)),
    lowConfidenceCount,
  };
}

export function buildSessionRecord(input: {
  startedAt: Date;
  durationSec: number;
  baselineBpm: number | null;
  endingBpm: number | null;
  rmssdMs: number | null;
  breathsPerMinute: number;
  quality: number;
  diagnostics?: SignalDiagnostics;
  appVersion?: string;
}): SessionRecord {
  const measurementConfidence = roundTo(
    input.diagnostics?.confidence ?? input.quality,
    2,
  );
  const confidenceLabel =
    input.diagnostics?.confidenceLabel ??
    (measurementConfidence >= 0.72
      ? "high"
      : measurementConfidence >= 0.48
        ? "medium"
        : "low");
  const bpmDrop =
    input.baselineBpm !== null && input.endingBpm !== null
      ? Math.max(-8, Math.min(14, input.baselineBpm - input.endingBpm))
      : 0;
  const rmssdScore = input.rmssdMs === null ? 12 : Math.min(45, input.rmssdMs);
  const rawCoherenceScore = Math.round(
    clamp(35 + bpmDrop * 2.2 + rmssdScore * 0.75 + input.quality * 18, 0, 100),
  );
  const coherenceScore =
    confidenceLabel === "low"
      ? Math.min(rawCoherenceScore, 55)
      : rawCoherenceScore;
  const reasonCodes = input.diagnostics?.reasonCodes ?? [];
  const fieldConfidence = input.diagnostics?.fieldConfidence ?? {
    bpm: input.endingBpm === null ? 0 : measurementConfidence,
    rmssdMs: input.rmssdMs === null ? 0 : measurementConfidence,
    coherenceScore:
      confidenceLabel === "low"
        ? Math.min(measurementConfidence, 0.4)
        : measurementConfidence,
  };

  return {
    id: crypto.randomUUID(),
    schemaVersion: 1,
    startedAt: input.startedAt.toISOString(),
    durationSec: Math.round(input.durationSec),
    baselineBpm: input.baselineBpm,
    endingBpm: input.endingBpm,
    rmssdMs: input.rmssdMs,
    breathsPerMinute: input.breathsPerMinute,
    coherenceScore,
    quality: roundTo(input.quality, 2),
    measurementConfidence,
    confidenceLabel,
    qualityReasons: reasonCodes,
    fieldConfidence: {
      baselineBpm: input.baselineBpm === null ? 0 : fieldConfidence.bpm,
      endingBpm: input.endingBpm === null ? 0 : fieldConfidence.bpm,
      rmssdMs: fieldConfidence.rmssdMs,
      coherenceScore: fieldConfidence.coherenceScore,
    },
    provenance: {
      appVersion: input.appVersion ?? "unknown",
      schemaVersion: 1,
      algorithmVersion: "rppg-v2",
      generatedAt: new Date().toISOString(),
      source:
        input.diagnostics?.mode === "breath-only"
          ? "breath-only"
          : "webcam-rppg",
      reasonCodes,
    },
  };
}

function emptySummary(): AnalyticsSummary {
  return {
    sessionCount: 0,
    averageCoherence: 0,
    averageRmssdMs: null,
    bestCoherence: 0,
    lastSevenAverage: 0,
    lowConfidenceCount: 0,
  };
}

function average(values: number[]) {
  return values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundTo(value: number, digits: number) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}
