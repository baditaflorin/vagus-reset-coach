export type SignalSample = {
  timeMs: number;
  red: number;
  green: number;
  blue: number;
  brightness: number;
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
