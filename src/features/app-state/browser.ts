import { z } from "zod";
import { evaluateSignalDiagnostics } from "../rppg/diagnostics";
import type { PulseMetrics, SignalDiagnostics } from "../rppg/types";

const commitResponseSchema = z.object({
  sha: z.string().min(7).optional(),
});

export function buildUnavailableDiagnostics(
  metrics: PulseMetrics,
): SignalDiagnostics {
  return evaluateSignalDiagnostics({
    cameraAvailable: false,
    metrics,
    samples: [],
  });
}

export async function loadVisibleCommit(defaultCommit: string) {
  if (!window.location.hostname.endsWith("github.io")) {
    return defaultCommit;
  }

  try {
    const response = await fetch(
      "https://api.github.com/repos/baditaflorin/vagus-reset-coach/commits/main",
    );
    if (!response.ok) {
      return defaultCommit;
    }

    const parsed = commitResponseSchema.safeParse(await response.json());
    if (!parsed.success || !parsed.data.sha) {
      return defaultCommit;
    }

    return parsed.data.sha.slice(0, 7);
  } catch {
    return defaultCommit;
  }
}
