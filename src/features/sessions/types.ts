import { z } from "zod";

const fieldConfidenceSchema = z.object({
  baselineBpm: z.number().min(0).max(1),
  endingBpm: z.number().min(0).max(1),
  rmssdMs: z.number().min(0).max(1),
  coherenceScore: z.number().min(0).max(1),
});

const provenanceSchema = z.object({
  appVersion: z.string(),
  schemaVersion: z.literal(1),
  algorithmVersion: z.string(),
  generatedAt: z.string(),
  source: z.enum(["webcam-rppg", "breath-only"]),
  reasonCodes: z.array(z.string()),
});

export const sessionRecordSchema = z.object({
  id: z.string(),
  schemaVersion: z.literal(1),
  startedAt: z.string(),
  durationSec: z.number().nonnegative(),
  baselineBpm: z.number().nullable(),
  endingBpm: z.number().nullable(),
  rmssdMs: z.number().nullable(),
  breathsPerMinute: z.number().positive(),
  coherenceScore: z.number().min(0).max(100),
  quality: z.number().min(0).max(1),
  measurementConfidence: z.number().min(0).max(1).default(0),
  confidenceLabel: z.enum(["high", "medium", "low"]).default("low"),
  qualityReasons: z.array(z.string()).default([]),
  fieldConfidence: fieldConfidenceSchema.default({
    baselineBpm: 0,
    endingBpm: 0,
    rmssdMs: 0,
    coherenceScore: 0,
  }),
  provenance: provenanceSchema.default({
    appVersion: "unknown",
    schemaVersion: 1,
    algorithmVersion: "rppg-v2",
    generatedAt: "unknown",
    source: "webcam-rppg",
    reasonCodes: [],
  }),
  notes: z.string().optional(),
});

export type SessionRecord = z.infer<typeof sessionRecordSchema>;

export type AnalyticsSummary = {
  sessionCount: number;
  averageCoherence: number;
  averageRmssdMs: number | null;
  bestCoherence: number;
  lastSevenAverage: number;
  lowConfidenceCount: number;
};

export type SessionLoadReport = {
  records: SessionRecord[];
  skippedRecords: number;
};
