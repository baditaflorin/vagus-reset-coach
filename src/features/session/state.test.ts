import { describe, expect, it } from "vitest";
import { deriveCoachState, type CoachStateId } from "./state";
import type { SignalDiagnostics } from "../rppg/types";

const diagnostics = {
  ready: true,
  mode: "measured",
  confidence: 0.82,
  confidenceLabel: "high",
  primaryMessage: "Face signal is usable.",
  nextStep: "Keep still.",
  reasons: [],
  reasonCodes: ["usable-face-signal"],
  inspectedSampleCount: 10,
  fieldConfidence: { bpm: 0.82, rmssdMs: 0.82, coherenceScore: 0.82 },
} satisfies SignalDiagnostics;

describe("deriveCoachState", () => {
  it.each<CoachStateId>([
    "idle",
    "camera-ready",
    "camera-denied",
    "measuring-warmup",
    "measuring-ready",
    "measuring-low-confidence",
    "breath-only",
    "saving",
    "saved",
    "recoverable-error",
  ])("%s has at least one exit", (stateId) => {
    const state = stateFor(stateId);

    expect(state.exits.length).toBeGreaterThan(0);
  });
});

function stateFor(stateId: CoachStateId) {
  if (stateId === "idle") {
    return deriveCoachState(base());
  }
  if (stateId === "camera-ready") {
    return deriveCoachState(base({ cameraActive: true }));
  }
  if (stateId === "camera-denied") {
    return deriveCoachState(
      base({
        diagnostics: { ...diagnostics, mode: "breath-only", ready: false },
      }),
    );
  }
  if (stateId === "measuring-warmup") {
    return deriveCoachState(
      base({
        running: true,
        diagnostics: { ...diagnostics, mode: "warming", ready: false },
      }),
    );
  }
  if (stateId === "measuring-ready") {
    return deriveCoachState(base({ running: true }));
  }
  if (stateId === "measuring-low-confidence") {
    return deriveCoachState(
      base({
        running: true,
        diagnostics: { ...diagnostics, ready: false, mode: "low-confidence" },
      }),
    );
  }
  if (stateId === "breath-only") {
    return deriveCoachState(
      base({
        running: true,
        diagnostics: { ...diagnostics, ready: false, mode: "breath-only" },
      }),
    );
  }
  if (stateId === "saving") {
    return deriveCoachState(base({ saving: true }));
  }
  if (stateId === "saved") {
    return deriveCoachState(base({ saved: true }));
  }
  return deriveCoachState(base({ recoverableError: "Storage quota is full." }));
}

function base(overrides: Partial<Parameters<typeof deriveCoachState>[0]> = {}) {
  return {
    cameraActive: false,
    running: false,
    saving: false,
    saved: false,
    recoverableError: null,
    diagnostics,
    ...overrides,
  };
}
