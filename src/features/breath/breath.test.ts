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
  it("falls back to defaults when signal quality is too low", () => {
    const settings = recommendBreathSettings({
      bpm: 94,
      rmssdMs: 24,
      quality: 0.2,
      sampleCount: 500,
      peakCount: 20,
      intervalsMs: [650, 640, 660, 650],
      status: "low-quality",
    });
    expect(settings).toEqual(DEFAULT_BREATH_SETTINGS);
  });

  it("falls back to defaults when no BPM has been measured", () => {
    const settings = recommendBreathSettings({
      bpm: null,
      rmssdMs: null,
      quality: 0.8,
      sampleCount: 100,
      peakCount: 0,
      intervalsMs: [],
      status: "warming",
    });
    expect(settings).toEqual(DEFAULT_BREATH_SETTINGS);
  });

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

  it("slows cadence further when HRV is poor even at moderate BPM", () => {
    const moderateBpmGoodHrv = recommendBreathSettings({
      bpm: 72,
      rmssdMs: 60,
      quality: 0.9,
      sampleCount: 500,
      peakCount: 20,
      intervalsMs: [820, 830, 815],
      status: "ready",
    });
    const moderateBpmPoorHrv = recommendBreathSettings({
      bpm: 72,
      rmssdMs: 12,
      quality: 0.9,
      sampleCount: 500,
      peakCount: 20,
      intervalsMs: [820, 830, 815],
      status: "ready",
    });

    expect(moderateBpmPoorHrv.breathsPerMinute).toBeLessThan(
      moderateBpmGoodHrv.breathsPerMinute,
    );
  });

  it("scales smoothly with stress instead of jumping at a single threshold", () => {
    const cadences = [55, 70, 85, 100].map(
      (bpm) =>
        recommendBreathSettings({
          bpm,
          rmssdMs: 35,
          quality: 0.9,
          sampleCount: 500,
          peakCount: 20,
          intervalsMs: [],
          status: "ready",
        }).breathsPerMinute,
    );

    // Each step up in BPM should slow the cadence (or at least never speed it
    // up). The original implementation only had two bands, so 70→85 produced
    // an identical cadence — this guards against regressing to that.
    expect(cadences[1]).toBeLessThanOrEqual(cadences[0]);
    expect(cadences[2]).toBeLessThan(cadences[1]);
    expect(cadences[3]).toBeLessThan(cadences[2]);
  });

  it("keeps the exhale longer than the inhale at every cadence", () => {
    for (const bpm of [55, 65, 75, 85, 95]) {
      const settings = recommendBreathSettings({
        bpm,
        rmssdMs: 30,
        quality: 0.9,
        sampleCount: 500,
        peakCount: 20,
        intervalsMs: [],
        status: "ready",
      });
      expect(settings.exhaleSec).toBeGreaterThan(settings.inhaleSec);
    }
  });
});
