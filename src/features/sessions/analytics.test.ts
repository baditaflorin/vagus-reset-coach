import { describe, expect, it, vi } from "vitest";
import {
  buildSessionRecord,
  summarizeInMemory,
  summarizeSessions,
} from "./analytics";
import type { SessionRecord } from "./types";

vi.mock("./duckdb", () => ({
  summarizeSessionsWithDuckDb: vi.fn(async (sessions: SessionRecord[]) =>
    summarizeInMemory(sessions),
  ),
}));

describe("buildSessionRecord", () => {
  it("scores a completed session from HRV, quality, and heart-rate drop", () => {
    const record = buildSessionRecord({
      startedAt: new Date("2026-05-08T08:00:00.000Z"),
      durationSec: 120,
      baselineBpm: 84,
      endingBpm: 76,
      rmssdMs: 42,
      breathsPerMinute: 5.8,
      quality: 0.86,
    });

    expect(record.schemaVersion).toBe(1);
    expect(record.coherenceScore).toBeGreaterThan(80);
    expect(record.startedAt).toBe("2026-05-08T08:00:00.000Z");
  });
});

describe("summarizeSessions", () => {
  it("returns progression aggregates", async () => {
    const sessions = [
      session("a", 82, 30),
      session("b", 64, 22),
      session("c", 91, 48),
    ];
    const summary = await summarizeSessions(sessions);

    expect(summary.sessionCount).toBe(3);
    expect(summary.averageCoherence).toBe(79);
    expect(summary.bestCoherence).toBe(91);
    expect(summary.averageRmssdMs).toBe(33);
  });
});

function session(
  id: string,
  coherenceScore: number,
  rmssdMs: number,
): SessionRecord {
  return {
    id,
    schemaVersion: 1,
    startedAt: `2026-05-08T08:0${id.length}:00.000Z`,
    durationSec: 120,
    baselineBpm: 80,
    endingBpm: 74,
    rmssdMs,
    breathsPerMinute: 6,
    coherenceScore,
    quality: 0.8,
  };
}
