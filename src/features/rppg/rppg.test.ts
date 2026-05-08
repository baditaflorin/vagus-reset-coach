import { describe, expect, it } from "vitest";
import { calculateRmssd, estimatePulseMetrics } from "./rppg";
import type { SignalSample } from "./types";

describe("estimatePulseMetrics", () => {
  it("estimates heart rate from a synthetic rPPG waveform", () => {
    const samples = syntheticSamples({ bpm: 72, seconds: 35, fps: 15 });
    const metrics = estimatePulseMetrics(samples);

    expect(metrics.bpm).toBeGreaterThanOrEqual(68);
    expect(metrics.bpm).toBeLessThanOrEqual(76);
    expect(metrics.quality).toBeGreaterThan(0.45);
    expect(metrics.status).toBe("ready");
  });
});

describe("calculateRmssd", () => {
  it("returns null when too few intervals exist", () => {
    expect(calculateRmssd([800, 810])).toBeNull();
  });

  it("calculates root mean square of successive interval differences", () => {
    expect(Math.round(calculateRmssd([800, 820, 790, 830]) ?? 0)).toBe(31);
  });
});

function syntheticSamples(input: {
  bpm: number;
  seconds: number;
  fps: number;
}): SignalSample[] {
  const samples: SignalSample[] = [];
  const total = input.seconds * input.fps;
  const intervalMs = 1_000 / input.fps;
  const hz = input.bpm / 60;

  for (let index = 0; index < total; index += 1) {
    const timeMs = index * intervalMs;
    const phase = (timeMs / 1_000) * hz * Math.PI * 2;
    const pulse = Math.sin(phase) * 3.4 + Math.sin(phase * 2) * 0.7;
    samples.push({
      timeMs,
      red: 112 - pulse * 0.45,
      green: 96 + pulse,
      blue: 86 - pulse * 0.2,
      brightness: 98,
    });
  }

  return samples;
}
