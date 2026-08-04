import { describe, expect, it, vi } from "vitest";
import { processVideoFrameSafely } from "./safeSample";
import type { PulseEstimator } from "./rppg";
import type { PulseMetrics } from "./types";
import type { VideoFrameSampler } from "./videoSampler";

const FAKE_VIDEO = {} as unknown as HTMLVideoElement;
const ROI = { x: 0, y: 0, width: 1, height: 1 };

const READY_METRICS: PulseMetrics = {
  bpm: 62,
  rmssdMs: 40,
  quality: 0.9,
  sampleCount: 300,
  peakCount: 20,
  intervalsMs: [800, 810, 790],
  status: "ready",
};

function makeEstimator(metrics: PulseMetrics): PulseEstimator {
  return {
    addSample: vi.fn().mockReturnValue(metrics),
    getSamples: vi.fn().mockReturnValue([]),
    reset: vi.fn(),
  } as unknown as PulseEstimator;
}

describe("processVideoFrameSafely", () => {
  it("returns metrics and diagnostics on a normal successful sample", () => {
    const sampler = {
      sample: vi.fn().mockReturnValue({
        timeMs: 1_000,
        red: 120,
        green: 130,
        blue: 110,
        brightness: 120,
      }),
    } as unknown as VideoFrameSampler;
    const estimator = makeEstimator(READY_METRICS);

    const result = processVideoFrameSafely(FAKE_VIDEO, ROI, sampler, estimator);

    expect(result).not.toBeNull();
    expect(result?.metrics).toEqual(READY_METRICS);
    // cameraAvailable path was taken (as opposed to the "breath-only"
    // fallback), confirming the happy path still wires metrics through to
    // diagnostics unchanged.
    expect(result?.diagnostics.mode).not.toBe("breath-only");
  });

  it("returns null without throwing when the sampler has no frame yet", () => {
    const sampler = {
      sample: vi.fn().mockReturnValue(null),
    } as unknown as VideoFrameSampler;
    const estimator = makeEstimator(READY_METRICS);

    const result = processVideoFrameSafely(FAKE_VIDEO, ROI, sampler, estimator);

    expect(result).toBeNull();
    expect(estimator.addSample).not.toHaveBeenCalled();
  });

  // Regression test: previously, an exception thrown anywhere in the
  // webcam/rPPG pipeline (canvas access, pixel math, estimator internals)
  // propagated out of App.tsx's per-tick setInterval callback, which
  // aborted that entire tick's execution *before* it reached the
  // breath-timer/elapsed-time code that follows it. A sampler that keeps
  // throwing (e.g. a persistently tainted/broken canvas) would therefore
  // silently freeze the guided breathing pacer and prevent the session from
  // ever completing or saving — with no visible error to the user.
  // processVideoFrameSafely must isolate that failure instead of leaking it.
  it("catches a throwing sampler and returns null instead of propagating", () => {
    const sampler = {
      sample: vi.fn().mockImplementation(() => {
        throw new Error("canvas getImageData failed");
      }),
    } as unknown as VideoFrameSampler;
    const estimator = makeEstimator(READY_METRICS);

    let result: ReturnType<typeof processVideoFrameSafely> | undefined;
    expect(() => {
      result = processVideoFrameSafely(FAKE_VIDEO, ROI, sampler, estimator);
    }).not.toThrow();
    expect(result).toBeNull();
    expect(estimator.addSample).not.toHaveBeenCalled();
  });

  it("catches a throwing estimator and returns null instead of propagating", () => {
    const sampler = {
      sample: vi.fn().mockReturnValue({
        timeMs: 1_000,
        red: 120,
        green: 130,
        blue: 110,
        brightness: 120,
      }),
    } as unknown as VideoFrameSampler;
    const estimator = {
      addSample: vi.fn().mockImplementation(() => {
        throw new Error("estimator blew up");
      }),
      getSamples: vi.fn().mockReturnValue([]),
      reset: vi.fn(),
    } as unknown as PulseEstimator;

    expect(() =>
      processVideoFrameSafely(FAKE_VIDEO, ROI, sampler, estimator),
    ).not.toThrow();
  });
});
