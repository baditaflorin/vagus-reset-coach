import type {
  DiagnosticReasonCode,
  PulseMetrics,
  SignalDiagnosticReason,
  SignalDiagnostics,
  SignalSample,
} from "./types";

type DiagnosticsInput = {
  cameraAvailable: boolean;
  metrics: PulseMetrics;
  samples: SignalSample[];
};

type SignalStats = {
  brightness: number;
  brightnessStdDev: number;
  glareRatio: number;
  darkRatio: number;
  skinRatio: number;
  motionScore: number;
};

const REASON_COPY: Record<
  DiagnosticReasonCode,
  Omit<SignalDiagnosticReason, "code">
> = {
  "usable-face-signal": {
    severity: "info",
    message: "Face signal is usable.",
    nextStep: "Keep your face still inside the oval and continue breathing.",
  },
  "warming-up": {
    severity: "warning",
    message: "Face pulse is still warming up.",
    nextStep: "Hold still for a few more breaths before trusting HRV.",
  },
  "too-dark": {
    severity: "blocker",
    message: "Your face is too dark for a reliable pulse read.",
    nextStep: "Turn toward a brighter, neutral light source.",
  },
  "glare-or-backlight": {
    severity: "blocker",
    message: "Glare or backlight is washing out the face signal.",
    nextStep: "Face the light, dim the screen, or reduce reflections.",
  },
  "face-not-centered": {
    severity: "blocker",
    message: "The oval is not seeing enough face-like skin signal.",
    nextStep:
      "Move your face back into the oval and keep forehead/cheeks visible.",
  },
  "subject-not-locked": {
    severity: "warning",
    message: "The subject is not locked clearly enough.",
    nextStep:
      "Keep one face in frame and remove other moving faces from the oval.",
  },
  "too-much-motion": {
    severity: "blocker",
    message: "Camera or face motion is corrupting the pulse signal.",
    nextStep: "Prop the device up and keep your head still.",
  },
  "pulse-irregular": {
    severity: "warning",
    message: "Detected pulse peaks are inconsistent.",
    nextStep: "Improve lighting and stillness before trusting HRV.",
  },
  "breath-only": {
    severity: "warning",
    message: "Camera measurement is unavailable, so this is breath-only.",
    nextStep: "Retry camera access if you want HRV estimates.",
  },
};

export function evaluateSignalDiagnostics({
  cameraAvailable,
  metrics,
  samples,
}: DiagnosticsInput): SignalDiagnostics {
  if (!cameraAvailable) {
    return buildDiagnostics({
      metrics,
      samples,
      confidence: 0,
      mode: "breath-only",
      ready: false,
      reasonCodes: ["breath-only"],
    });
  }

  const stats = summarizeSignalStats(samples);
  const reasonCodes: DiagnosticReasonCode[] = [];
  let confidence = clamp(metrics.quality, 0, 1);

  if (metrics.sampleCount < 240 || metrics.status === "warming") {
    reasonCodes.push("warming-up");
    confidence = Math.min(confidence, 0.48);
  }
  if (stats.brightness < 55 || stats.darkRatio > 0.22) {
    reasonCodes.push("too-dark");
    confidence = Math.min(confidence, 0.42);
  }
  if (
    stats.glareRatio > 0.1 ||
    (stats.brightness < 65 && stats.brightnessStdDev > 35)
  ) {
    reasonCodes.push("glare-or-backlight");
    confidence = Math.min(confidence, 0.42);
  }
  if (
    samples.length > 0 &&
    (stats.skinRatio < 0.18 || stats.brightnessStdDev < 9)
  ) {
    reasonCodes.push("face-not-centered");
    confidence = Math.min(confidence, 0.42);
  }
  if (stats.skinRatio > 0.82 && stats.motionScore > 0.16) {
    reasonCodes.push("subject-not-locked");
    confidence = Math.min(confidence, 0.55);
  }
  if (stats.motionScore > 0.16) {
    reasonCodes.push("too-much-motion");
    confidence = Math.min(confidence, 0.45);
  }
  if (isPulseIrregular(metrics)) {
    reasonCodes.push("pulse-irregular");
    confidence = Math.min(confidence, 0.55);
  }

  const uniqueReasonCodes = [...new Set(reasonCodes)];
  const hasBlocker = uniqueReasonCodes.some(
    (code) => REASON_COPY[code].severity === "blocker",
  );
  const ready =
    metrics.status === "ready" &&
    metrics.bpm !== null &&
    confidence >= 0.62 &&
    !hasBlocker;

  return buildDiagnostics({
    metrics,
    samples,
    confidence: ready ? Math.max(confidence, 0.72) : confidence,
    mode: ready
      ? "measured"
      : uniqueReasonCodes.includes("warming-up")
        ? "warming"
        : "low-confidence",
    ready,
    reasonCodes: ready ? ["usable-face-signal"] : uniqueReasonCodes,
  });
}

export function summarizeSignalStats(samples: SignalSample[]): SignalStats {
  if (samples.length === 0) {
    return {
      brightness: 0,
      brightnessStdDev: 0,
      glareRatio: 0,
      darkRatio: 0,
      skinRatio: 0,
      motionScore: 0,
    };
  }

  return {
    brightness: average(
      samples.map((sample) => finiteOr(sample.brightness, 0)),
    ),
    brightnessStdDev: average(
      samples.map((sample) => finiteOr(sample.brightnessStdDev, 0)),
    ),
    glareRatio: average(
      samples.map((sample) => finiteOr(sample.glareRatio, 0)),
    ),
    darkRatio: average(samples.map((sample) => finiteOr(sample.darkRatio, 0))),
    skinRatio: average(
      samples.map((sample) => finiteOr(sample.skinRatio, 0.5)),
    ),
    motionScore: average(
      samples.map((sample) => finiteOr(sample.motionScore, 0)),
    ),
  };
}

export function confidenceLabel(
  confidence: number,
): SignalDiagnostics["confidenceLabel"] {
  if (confidence >= 0.72) {
    return "high";
  }
  if (confidence >= 0.48) {
    return "medium";
  }
  return "low";
}

function buildDiagnostics(input: {
  metrics: PulseMetrics;
  samples: SignalSample[];
  confidence: number;
  mode: SignalDiagnostics["mode"];
  ready: boolean;
  reasonCodes: DiagnosticReasonCode[];
}): SignalDiagnostics {
  const reasons = input.reasonCodes.map(toReason);
  const primary = reasons[0] ?? toReason("warming-up");
  const confidence = roundTo(clamp(input.confidence, 0, 1), 2);

  return {
    ready: input.ready,
    mode: input.mode,
    confidence,
    confidenceLabel: confidenceLabel(confidence),
    primaryMessage: primary.message,
    nextStep: primary.nextStep,
    reasons,
    reasonCodes: input.reasonCodes,
    inspectedSampleCount: input.samples.length,
    fieldConfidence: {
      bpm: input.metrics.bpm === null ? 0 : confidence,
      rmssdMs: input.metrics.rmssdMs === null ? 0 : confidence,
      coherenceScore: input.ready ? confidence : Math.min(confidence, 0.4),
    },
  };
}

function toReason(code: DiagnosticReasonCode): SignalDiagnosticReason {
  return { code, ...REASON_COPY[code] };
}

function isPulseIrregular(metrics: PulseMetrics) {
  if (metrics.bpm !== null && metrics.quality < 0.45) {
    return true;
  }
  if (metrics.intervalsMs.length < 3) {
    return false;
  }
  const mean = average(metrics.intervalsMs);
  return mean > 0 && stddev(metrics.intervalsMs, mean) / mean > 0.18;
}

function average(values: number[]) {
  return values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function stddev(values: number[], mean = average(values)) {
  if (values.length < 2) {
    return 0;
  }
  return Math.sqrt(average(values.map((value) => (value - mean) ** 2)));
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}

function roundTo(value: number, digits: number) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function finiteOr(value: number | undefined, fallback: number) {
  return value !== undefined && Number.isFinite(value) ? value : fallback;
}
