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

export function recommendBreathSettings(
  metrics: PulseMetrics | null,
): BreathSettings {
  if (!metrics || metrics.quality < 0.4 || metrics.bpm === null) {
    return DEFAULT_BREATH_SETTINGS;
  }

  const calmerCadence = metrics.bpm > 86 ? 5.5 : 6;
  const exhaleSec = metrics.bpm > 86 ? 6.8 : 6;
  const inhaleSec = Math.max(3.8, 60 / calmerCadence - exhaleSec);

  return {
    breathsPerMinute: roundTo(60 / (inhaleSec + exhaleSec), 1),
    inhaleSec,
    holdTopSec: 0,
    exhaleSec,
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
