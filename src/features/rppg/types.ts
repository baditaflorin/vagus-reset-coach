export type SignalSample = {
  timeMs: number;
  red: number;
  green: number;
  blue: number;
  brightness: number;
  brightnessStdDev?: number;
  glareRatio?: number;
  darkRatio?: number;
  skinRatio?: number;
  motionScore?: number;
};

export type PulseMetrics = {
  bpm: number | null;
  rmssdMs: number | null;
  quality: number;
  sampleCount: number;
  peakCount: number;
  intervalsMs: number[];
  status: "warming" | "measuring" | "low-quality" | "ready";
};

export type RegionOfInterest = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DiagnosticReasonCode =
  | "usable-face-signal"
  | "warming-up"
  | "too-dark"
  | "glare-or-backlight"
  | "face-not-centered"
  | "subject-not-locked"
  | "too-much-motion"
  | "pulse-irregular"
  | "breath-only";

export type DiagnosticSeverity = "info" | "warning" | "blocker";

export type SignalDiagnosticReason = {
  code: DiagnosticReasonCode;
  severity: DiagnosticSeverity;
  message: string;
  nextStep: string;
};

export type SignalDiagnostics = {
  ready: boolean;
  mode: "measured" | "warming" | "low-confidence" | "breath-only" | "no-camera";
  confidence: number;
  confidenceLabel: "high" | "medium" | "low";
  primaryMessage: string;
  nextStep: string;
  reasons: SignalDiagnosticReason[];
  reasonCodes: DiagnosticReasonCode[];
  inspectedSampleCount: number;
  fieldConfidence: {
    bpm: number;
    rmssdMs: number;
    coherenceScore: number;
  };
};
