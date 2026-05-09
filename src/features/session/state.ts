import type { SignalDiagnostics } from "../rppg/types";

export type CoachStateId =
  | "idle"
  | "camera-ready"
  | "camera-denied"
  | "measuring-warmup"
  | "measuring-ready"
  | "measuring-low-confidence"
  | "breath-only"
  | "saving"
  | "saved"
  | "recoverable-error";

export type CoachState = {
  id: CoachStateId;
  label: string;
  message: string;
  exits: string[];
};

export function deriveCoachState(input: {
  cameraActive: boolean;
  running: boolean;
  saving: boolean;
  saved: boolean;
  recoverableError: string | null;
  diagnostics: SignalDiagnostics;
}): CoachState {
  if (input.recoverableError) {
    return state(
      "recoverable-error",
      "Recoverable issue",
      input.recoverableError,
      ["retry", "export history", "start over"],
    );
  }
  if (input.saving) {
    return state("saving", "Saving", "Saving the local session record.", [
      "wait",
    ]);
  }
  if (input.saved) {
    return state("saved", "Saved", "Local session record saved.", [
      "start another",
      "export",
      "clear history",
    ]);
  }
  if (input.running && input.diagnostics.mode === "breath-only") {
    return state(
      "breath-only",
      "Breath-only",
      "Breath pacer is running without webcam HRV.",
      ["retry camera", "stop"],
    );
  }
  if (input.running && input.diagnostics.mode === "warming") {
    return state(
      "measuring-warmup",
      "Warming up",
      "Face pulse needs a little more stable video before HRV is trusted.",
      ["wait", "stop"],
    );
  }
  if (input.running && input.diagnostics.ready) {
    return state(
      "measuring-ready",
      "Measuring",
      "Face signal is usable for this reset.",
      ["continue", "stop"],
    );
  }
  if (input.running) {
    return state(
      "measuring-low-confidence",
      "Low confidence",
      input.diagnostics.primaryMessage,
      ["follow fix", "continue breath-only", "stop"],
    );
  }
  if (
    input.diagnostics.mode === "breath-only" ||
    input.diagnostics.mode === "no-camera"
  ) {
    return state(
      "camera-denied",
      "Camera unavailable",
      "Camera HRV is unavailable; breath-only reset can still run.",
      ["retry camera", "start breath-only"],
    );
  }
  if (input.cameraActive) {
    return state(
      "camera-ready",
      "Camera ready",
      input.diagnostics.primaryMessage,
      ["start reset", "improve signal"],
    );
  }
  return state("idle", "Ready", "Start camera or begin breath-only.", [
    "start camera",
    "start reset",
  ]);
}

function state(
  id: CoachStateId,
  label: string,
  message: string,
  exits: string[],
): CoachState {
  return { id, label, message, exits };
}
