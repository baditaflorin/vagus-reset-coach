import { describe, expect, it } from "vitest";
import {
  DEFAULT_BREATH_SETTINGS,
  getBreathState,
  recommendBreathSettings,
} from "./breath";

describe("getBreathState", () => {
  it("starts with inhale and expands the pacer", () => {
    const start = getBreathState(0, DEFAULT_BREATH_SETTINGS);
    const later = getBreathState(2_000, DEFAULT_BREATH_SETTINGS);

    expect(start.phase).toBe("inhale");
    expect(later.radiusScale).toBeGreaterThan(start.radiusScale);
  });

  it("switches to exhale after the inhale segment", () => {
    const state = getBreathState(4_200, DEFAULT_BREATH_SETTINGS);

    expect(state.phase).toBe("exhale");
  });
});

describe("recommendBreathSettings", () => {
  it("slows cadence when heart rate is elevated", () => {
    const settings = recommendBreathSettings({
      bpm: 94,
      rmssdMs: 24,
      quality: 0.8,
      sampleCount: 500,
      peakCount: 20,
      intervalsMs: [650, 640, 660, 650],
      status: "ready",
    });

    expect(settings.breathsPerMinute).toBeLessThan(6);
    expect(settings.exhaleSec).toBeGreaterThan(
      DEFAULT_BREATH_SETTINGS.exhaleSec,
    );
  });
});
