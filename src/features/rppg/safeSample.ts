import { evaluateSignalDiagnostics } from "./diagnostics";
import type { PulseEstimator } from "./rppg";
import type {
  PulseMetrics,
  RegionOfInterest,
  SignalDiagnostics,
} from "./types";
import type { VideoFrameSampler } from "./videoSampler";

export type FrameProcessingResult = {
  metrics: PulseMetrics;
  diagnostics: SignalDiagnostics;
};

/**
 * Runs one webcam-frame sampling + pulse-estimation + diagnostics pass,
 * isolating any failure inside the rPPG pipeline (canvas access, malformed
 * video state, numerical edge cases, etc.) so it can never propagate out of
 * the caller's per-tick loop.
 *
 * The breathing pacer's elapsed-time and phase logic must keep advancing
 * every tick even if the optional camera/HRV signal-processing path breaks —
 * a guided breathing session should never silently freeze because the
 * bonus biometric feature hit an error. Failures are logged to the console
 * and reported as `null` so the caller can skip the metrics/diagnostics
 * update for that tick without affecting session timing.
 */
export function processVideoFrameSafely(
  video: HTMLVideoElement,
  roi: RegionOfInterest,
  sampler: VideoFrameSampler,
  estimator: PulseEstimator,
): FrameProcessingResult | null {
  try {
    const sample = sampler.sample(video, roi);
    if (!sample) {
      return null;
    }

    const metrics = estimator.addSample(sample);
    const diagnostics = evaluateSignalDiagnostics({
      cameraAvailable: true,
      metrics,
      samples: estimator.getSamples(),
    });

    return { metrics, diagnostics };
  } catch (error) {
    console.error(
      "Webcam pulse-signal processing failed; continuing in breath-only mode for this tick.",
      error,
    );
    return null;
  }
}
