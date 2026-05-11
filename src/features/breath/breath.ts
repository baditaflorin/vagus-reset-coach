import type { PulseMetrics } from "../rppg/types";

export type BreathPhase = "inhale" | "hold-top" | "exhale" | "hold-bottom";

export type BreathSettings = {
  breathsPerMinute: number;
  inhaleSec: number;
  holdTopSec: number;
  exhaleSec: number;
  holdBottomSec: number;
};

export type BreathState = {
  phase: BreathPhase;
  phaseLabel: string;
  phaseProgress: number;
  cycleProgress: number;
  radiusScale: number;
  instruction: string;
};

export const DEFAULT_BREATH_SETTINGS: BreathSettings = {
  breathsPerMinute: 6,
  inhaleSec: 4,
  holdTopSec: 0,
  exhaleSec: 6,
  holdBottomSec: 0,
};

// Range of cadences we are willing to coach toward. 3.5 bpm (~17s cycles) is
// near the slow end of practical resonant breathing; 6.5 bpm is the relaxed
// upper end. Resonance for most adults sits around 5–6 bpm, so the default
// floats inside that band and the elevated-stress branch slows further.
const MIN_CADENCE_BPM = 3.5;
const MAX_CADENCE_BPM = 6.5;
const MIN_INHALE_SEC = 3.2;
const STRESS_BPM = 90;
const CALM_BPM = 60;
const POOR_HRV_MS = 18;
const GOOD_HRV_MS = 55;

export function recommendBreathSettings(
  metrics: PulseMetrics | null,
): BreathSettings {
  if (!metrics || metrics.quality < 0.4 || metrics.bpm === null) {
    return DEFAULT_BREATH_SETTINGS;
  }

  // Stress proxy in [0, 1]: higher heart rate and lower HRV both push us
  // toward the slower end of the cadence range. We blend the two signals so
  // either one can drive adaptation when the other is missing or marginal.
  const bpmStress = clamp(
    (metrics.bpm - CALM_BPM) / (STRESS_BPM - CALM_BPM),
    0,
    1,
  );
  const hrvStress =
    metrics.rmssdMs === null
      ? bpmStress
      : clamp(
          (GOOD_HRV_MS - metrics.rmssdMs) / (GOOD_HRV_MS - POOR_HRV_MS),
          0,
          1,
        );
  const stress = (bpmStress + hrvStress) / 2;

  const cadence =
    MAX_CADENCE_BPM - stress * (MAX_CADENCE_BPM - MIN_CADENCE_BPM);
  const cycleSec = 60 / cadence;
  // Hold a 1:1.6 inhale:exhale ratio. Longer exhales than inhales dominate
  // vagal afferent traffic via baroreflex loading; 1.6 keeps the inhale long
  // enough to feel natural (vs. the 1:2 box-breathing extreme).
  const exhaleSec = (cycleSec * 1.6) / 2.6;
  const inhaleSec = Math.max(MIN_INHALE_SEC, cycleSec - exhaleSec);
  const adjustedExhale = cycleSec - inhaleSec;

  return {
    breathsPerMinute: roundTo(60 / (inhaleSec + adjustedExhale), 1),
    inhaleSec: roundTo(inhaleSec, 2),
    holdTopSec: 0,
    exhaleSec: roundTo(adjustedExhale, 2),
    holdBottomSec: 0,
  };
}

export function getBreathState(
  elapsedMs: number,
  settings: BreathSettings,
): BreathState {
  const segments = [
    segment(
      "inhale",
      settings.inhaleSec,
      "Inhale",
      "Let the breath widen slowly",
    ),
    segment("hold-top", settings.holdTopSec, "Hold", "Rest at the top"),
    segment(
      "exhale",
      settings.exhaleSec,
      "Exhale",
      "Soften the jaw and lengthen out",
    ),
    segment(
      "hold-bottom",
      settings.holdBottomSec,
      "Pause",
      "Wait for the next breath",
    ),
  ].filter((entry) => entry.durationSec > 0);

  const cycleSec = segments.reduce((sum, entry) => sum + entry.durationSec, 0);
  const cycleElapsedSec = (elapsedMs / 1_000) % cycleSec;
  let cursor = 0;

  for (const entry of segments) {
    const next = cursor + entry.durationSec;
    if (cycleElapsedSec <= next) {
      const phaseProgress = clamp(
        (cycleElapsedSec - cursor) / entry.durationSec,
        0,
        1,
      );
      const cycleProgress = cycleElapsedSec / cycleSec;
      return {
        phase: entry.phase,
        phaseLabel: entry.label,
        phaseProgress,
        cycleProgress,
        radiusScale: radiusForPhase(entry.phase, phaseProgress),
        instruction: entry.instruction,
      };
    }
    cursor = next;
  }

  return {
    phase: "inhale",
    phaseLabel: "Inhale",
    phaseProgress: 0,
    cycleProgress: 0,
    radiusScale: 0.36,
    instruction: "Let the breath widen slowly",
  };
}

function segment(
  phase: BreathPhase,
  durationSec: number,
  label: string,
  instruction: string,
) {
  return { phase, durationSec, label, instruction };
}

function radiusForPhase(phase: BreathPhase, progress: number) {
  const eased = easeInOut(progress);
  if (phase === "inhale") {
    return 0.38 + eased * 0.48;
  }
  if (phase === "exhale") {
    return 0.86 - eased * 0.48;
  }
  return phase === "hold-top" ? 0.86 : 0.38;
}

function easeInOut(value: number) {
  return value < 0.5 ? 2 * value * value : 1 - (-2 * value + 2) ** 2 / 2;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundTo(value: number, digits: number) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}
