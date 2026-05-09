import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateSignalDiagnostics } from "./diagnostics";
import type { PulseMetrics, SignalSample } from "./types";
import { normalizeSessionRecords } from "../sessions/storage";

type FixtureInput = {
  id: string;
  cameraAvailable: boolean;
  metrics: PulseMetrics;
  samples: SignalSample[];
  historyRecords?: unknown[];
};

type FixtureExpected = {
  ready: boolean;
  minConfidence: number;
  maxConfidence: number;
  reasonCodes: string[];
  skippedHistoryRecords?: number;
};

const fixtureDir = resolve(process.cwd(), "test/fixtures/realdata");
const fixtureIds = readdirSync(fixtureDir)
  .filter((file) => file.endsWith(".input.json"))
  .map((file) => file.replace(".input.json", ""));

describe("real-data signal diagnostics fixtures", () => {
  for (const fixtureId of fixtureIds) {
    it(`${fixtureId} produces expected confidence and reason codes`, () => {
      const input = readFixture<FixtureInput>(`${fixtureId}.input.json`);
      const expected = readFixture<FixtureExpected>(
        `${fixtureId}.expected.json`,
      );
      const diagnostics = evaluateSignalDiagnostics(input);

      expect(diagnostics.ready).toBe(expected.ready);
      expect(diagnostics.confidence).toBeGreaterThanOrEqual(
        expected.minConfidence,
      );
      expect(diagnostics.confidence).toBeLessThanOrEqual(
        expected.maxConfidence,
      );
      expect(diagnostics.reasonCodes).toEqual(
        expect.arrayContaining(expected.reasonCodes),
      );
      expect(JSON.stringify(evaluateSignalDiagnostics(input))).toBe(
        JSON.stringify(diagnostics),
      );

      if (expected.skippedHistoryRecords !== undefined) {
        expect(
          normalizeSessionRecords(input.historyRecords ?? []).skippedRecords,
        ).toBe(expected.skippedHistoryRecords);
      }
    });
  }
});

describe("signal diagnostics edge cases", () => {
  it("treats empty camera traces as low-confidence warmup instead of crashing", () => {
    const diagnostics = evaluateSignalDiagnostics({
      cameraAvailable: true,
      metrics: {
        bpm: null,
        rmssdMs: null,
        quality: 0,
        sampleCount: 0,
        peakCount: 0,
        intervalsMs: [],
        status: "warming",
      },
      samples: [],
    });

    expect(diagnostics.ready).toBe(false);
    expect(diagnostics.reasonCodes).toContain("warming-up");
  });

  it("normalizes malformed numeric samples without NaN confidence", () => {
    const diagnostics = evaluateSignalDiagnostics({
      cameraAvailable: true,
      metrics: {
        bpm: 75,
        rmssdMs: 20,
        quality: Number.NaN,
        sampleCount: 300,
        peakCount: 12,
        intervalsMs: [800, Number.NaN, 820],
        status: "low-quality",
      },
      samples: [
        {
          timeMs: 0,
          red: 1,
          green: 1,
          blue: 1,
          brightness: Number.NaN,
          motionScore: Number.NaN,
        },
      ],
    });

    expect(Number.isNaN(diagnostics.confidence)).toBe(false);
    expect(diagnostics.ready).toBe(false);
  });

  it("keeps huge traces inside the synchronous diagnostics budget", () => {
    const input = readFixture<FixtureInput>("01-clean-daylight.input.json");
    const hugeTrace = Array.from({ length: 10_000 }, (_, index) => ({
      ...input.samples[index % input.samples.length],
      timeMs: index * 90,
    }));
    const startedAt = performance.now();
    const diagnostics = evaluateSignalDiagnostics({
      ...input,
      samples: hugeTrace,
    });

    expect(diagnostics.ready).toBe(true);
    expect(performance.now() - startedAt).toBeLessThan(300);
  });
});

function readFixture<T>(fileName: string): T {
  return JSON.parse(readFileSync(resolve(fixtureDir, fileName), "utf8")) as T;
}
