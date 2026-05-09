import { describe, expect, it } from "vitest";
import {
  buildClipboardSummary,
  buildPrintableSummaryHtml,
  parseAppStateJson,
  serializeAppState,
} from "./files";
import { DEFAULT_APP_SETTINGS } from "./types";
import type { SessionRecord } from "../sessions/types";

describe("app-state files", () => {
  it("round-trips the exported app state format", () => {
    const serialized = serializeAppState({
      appVersion: "0.3.0",
      settings: { ...DEFAULT_APP_SETTINGS, adaptiveBreath: false },
      sessions: [session("a")],
    });
    const parsed = parseAppStateJson(serialized);

    expect(parsed.appVersion).toBe("0.3.0");
    expect(parsed.settings.adaptiveBreath).toBe(false);
    expect(parsed.sessions).toHaveLength(1);
  });

  it("migrates the legacy phase 2 export shape", () => {
    const parsed = parseAppStateJson(
      JSON.stringify({
        schemaVersion: 1,
        appVersion: "0.2.1",
        exportedAt: "2026-05-09T10:00:00.000Z",
        source: "vagus-reset-coach",
        records: [session("legacy")],
      }),
    );

    expect(parsed.sessions).toHaveLength(1);
    expect(parsed.settings).toEqual(DEFAULT_APP_SETTINGS);
  });

  it("builds a readable clipboard summary", () => {
    const summary = buildClipboardSummary({
      sessions: [session("latest")],
      lowConfidenceCount: 1,
    });

    expect(summary).toContain("Sessions saved: 1");
    expect(summary).toContain("Low-confidence sessions: 1");
  });

  it("escapes values in the printable summary html", () => {
    const html = buildPrintableSummaryHtml({
      sessions: [
        {
          ...session("print"),
          startedAt: "<script>alert(1)</script>",
        },
      ],
      appVersion: "0.3.0",
    });

    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });
});

function session(id: string): SessionRecord {
  return {
    id,
    schemaVersion: 1,
    startedAt: "2026-05-09T10:00:00.000Z",
    durationSec: 120,
    baselineBpm: 82,
    endingBpm: 75,
    rmssdMs: 39,
    breathsPerMinute: 6,
    coherenceScore: 84,
    quality: 0.82,
    measurementConfidence: 0.8,
    confidenceLabel: "high",
    qualityReasons: ["usable-face-signal"],
    fieldConfidence: {
      baselineBpm: 0.8,
      endingBpm: 0.8,
      rmssdMs: 0.8,
      coherenceScore: 0.8,
    },
    provenance: {
      appVersion: "0.3.0",
      schemaVersion: 1,
      algorithmVersion: "rppg-v2",
      generatedAt: "2026-05-09T10:00:00.000Z",
      source: "webcam-rppg",
      reasonCodes: ["usable-face-signal"],
    },
  };
}
