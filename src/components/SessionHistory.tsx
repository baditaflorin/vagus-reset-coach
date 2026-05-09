import { Copy, Download, Printer, Trash2, Upload } from "lucide-react";
import { useId, useState, type ChangeEvent, type DragEvent } from "react";
import type {
  AnalyticsSummary,
  SessionRecord,
} from "../features/sessions/types";
import { formatDateTime } from "../lib/format";

type SessionHistoryProps = {
  sessions: SessionRecord[];
  analytics: AnalyticsSummary;
  importStatus: string | null;
  onClear: () => void;
  onCopySummary: () => void;
  onExport: () => void;
  onImportFile: (file: File) => void;
  onImportText: (text: string) => void;
  onPrintSummary: () => void;
};

export function SessionHistory({
  sessions,
  analytics,
  importStatus,
  onClear,
  onCopySummary,
  onExport,
  onImportFile,
  onImportText,
  onPrintSummary,
}: SessionHistoryProps) {
  const inputId = useId();
  const [importText, setImportText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const points = sessions
    .slice()
    .reverse()
    .slice(-14)
    .map((session) => session.coherenceScore);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      onImportFile(file);
    }
    event.currentTarget.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onImportFile(file);
      return;
    }

    const text = event.dataTransfer.getData("text/plain").trim();
    if (text) {
      setImportText(text);
      onImportText(text);
    }
  };

  return (
    <section className="panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Progression</p>
          <h2 className="section-title">Local session log</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="control-button"
            type="button"
            onClick={onCopySummary}
          >
            <Copy size={18} />
            Copy
          </button>
          <button
            className="control-button"
            type="button"
            onClick={onPrintSummary}
          >
            <Printer size={18} />
            Print
          </button>
          <button className="control-button" type="button" onClick={onExport}>
            <Download size={18} />
            Export
          </button>
          <label className="control-button cursor-pointer">
            <Upload size={18} />
            Import
            <input
              accept="application/json"
              className="sr-only"
              id={inputId}
              type="file"
              onChange={handleFileChange}
            />
          </label>
          <button className="control-button" type="button" onClick={onClear}>
            <Trash2 size={18} />
            Clear
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MiniStat label="Sessions" value={analytics.sessionCount.toString()} />
        <MiniStat
          label="Average"
          value={analytics.averageCoherence.toString()}
        />
        <MiniStat label="Best" value={analytics.bestCoherence.toString()} />
        <MiniStat
          label="Low conf"
          value={analytics.lowConfidenceCount.toString()}
        />
      </div>

      <Sparkline points={points} />

      <div
        className={`mt-4 rounded-lg border border-dashed p-4 ${
          dragActive
            ? "border-teal-700 bg-teal-50"
            : "border-stone-300 bg-white/70"
        }`}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <p className="text-sm font-semibold text-stone-950">
          Restore exported state
        </p>
        <p className="mt-1 text-sm leading-6 text-stone-600">
          Drop a `vagus-reset-state.json` file here or paste exported JSON.
        </p>
        <textarea
          className="mt-3 min-h-28 w-full rounded-lg border border-stone-200 bg-white p-3 text-sm text-stone-700"
          placeholder="Paste exported JSON here"
          value={importText}
          onChange={(event) => setImportText(event.currentTarget.value)}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className="control-button"
            type="button"
            onClick={() => {
              if (importText.trim()) {
                onImportText(importText.trim());
              }
            }}
          >
            <Upload size={18} />
            Import pasted JSON
          </button>
          <button
            className="control-button"
            type="button"
            onClick={async () => {
              try {
                const text = await navigator.clipboard.readText();
                setImportText(text);
                if (text.trim()) {
                  onImportText(text.trim());
                }
              } catch {
                setImportText(
                  "Clipboard access was blocked. Paste the exported JSON into the box above instead.",
                );
              }
            }}
          >
            <Copy size={18} />
            Read clipboard
          </button>
        </div>
        {importStatus && (
          <p className="mt-3 text-sm leading-6 text-stone-600">
            {importStatus}
          </p>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {sessions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-stone-300 p-4 text-sm text-stone-600">
            Finish a reset to create the first local record.
          </p>
        ) : (
          sessions.slice(0, 5).map((session) => (
            <article className="history-row" key={session.id}>
              <div>
                <p className="font-medium text-stone-950">
                  {formatDateTime(session.startedAt)}
                </p>
                <p className="text-sm text-stone-600">
                  {session.durationSec}s · RMSSD {session.rmssdMs ?? "n/a"} ms ·
                  quality {Math.round(session.quality * 100)}% ·{" "}
                  {session.confidenceLabel} confidence
                </p>
              </div>
              <strong>{session.coherenceScore}</strong>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-3">
      <p className="text-xs uppercase tracking-[0.12em] text-stone-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-stone-950">{value}</p>
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) {
    return <div className="sparkline-empty" aria-hidden="true" />;
  }

  const width = 320;
  const height = 92;
  const path = points
    .map((point, index) => {
      const x = (index / Math.max(1, points.length - 1)) * width;
      const y = height - (point / 100) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      className="mt-4 h-24 w-full"
      viewBox={`0 0 ${width} ${height}`}
      aria-label="Coherence trend"
    >
      <path
        d={path}
        fill="none"
        stroke="#0f766e"
        strokeLinecap="round"
        strokeWidth="5"
      />
    </svg>
  );
}
