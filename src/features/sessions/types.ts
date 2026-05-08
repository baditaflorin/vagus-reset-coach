import { z } from 'zod'

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
  notes: z.string().optional(),
})

export type SessionRecord = z.infer<typeof sessionRecordSchema>

export type AnalyticsSummary = {
  sessionCount: number
  averageCoherence: number
  averageRmssdMs: number | null
  bestCoherence: number
  lastSevenAverage: number
}
