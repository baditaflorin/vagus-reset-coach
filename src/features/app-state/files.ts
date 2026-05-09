import type { SessionRecord } from "../sessions/types";
import {
  buildExportedAppState,
  normalizeImportedAppState,
  type AppSettings,
  type ExportedAppState,
} from "./types";

export function serializeAppState(input: {
  appVersion: string;
  settings: AppSettings;
  sessions: SessionRecord[];
}) {
  return JSON.stringify(buildExportedAppState(input), null, 2);
}

export function parseAppStateJson(text: string): ExportedAppState {
  return normalizeImportedAppState(JSON.parse(text));
}

export async function readAppStateFile(file: File) {
  return parseAppStateJson(await file.text());
}

export function downloadTextFile(fileName: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function buildClipboardSummary(input: {
  sessions: SessionRecord[];
  lowConfidenceCount: number;
}) {
  if (input.sessions.length === 0) {
    return "Vagus Reset Coach: no local sessions saved yet.";
  }

  const latest = input.sessions[0];
  const lines = [
    "Vagus Reset Coach",
    `Sessions saved: ${input.sessions.length}`,
    `Low-confidence sessions: ${input.lowConfidenceCount}`,
    `Latest reset: ${latest.startedAt}`,
    `Latest coherence: ${latest.coherenceScore}/100`,
    `Latest HRV RMSSD: ${latest.rmssdMs ?? "n/a"} ms`,
    `Latest ending HR: ${latest.endingBpm ?? "n/a"} bpm`,
    `Latest confidence: ${latest.confidenceLabel}`,
  ];

  return lines.join("\n");
}

export function buildPrintableSummaryHtml(input: {
  sessions: SessionRecord[];
  appVersion: string;
}) {
  const rows = input.sessions
    .slice(0, 20)
    .map(
      (session) => `
        <tr>
          <td>${escapeHtml(session.startedAt)}</td>
          <td>${session.coherenceScore}</td>
          <td>${session.rmssdMs ?? "n/a"}</td>
          <td>${session.endingBpm ?? "n/a"}</td>
          <td>${escapeHtml(session.confidenceLabel)}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Vagus Reset Coach Summary</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, sans-serif; padding: 24px; color: #191714; }
      h1, h2 { margin: 0 0 12px; }
      p { margin: 0 0 8px; line-height: 1.5; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { border: 1px solid #d6cfc3; padding: 8px; text-align: left; }
      th { background: #f7f3ea; }
    </style>
  </head>
  <body>
    <h1>Vagus Reset Coach</h1>
    <p>Version ${escapeHtml(input.appVersion)}</p>
    <p>Saved sessions: ${input.sessions.length}</p>
    <h2>Recent sessions</h2>
    <table>
      <thead>
        <tr>
          <th>Started</th>
          <th>Coherence</th>
          <th>RMSSD</th>
          <th>Ending HR</th>
          <th>Confidence</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
