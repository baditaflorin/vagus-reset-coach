import { Download, Trash2 } from "lucide-react";
import type {
  AnalyticsSummary,
  SessionRecord,
} from "../features/sessions/types";
import { formatDateTime } from "../lib/format";

type SessionHistoryProps = {
  sessions: SessionRecord[];
  analytics: AnalyticsSummary;
  onClear: () => void;
  onExport: () => void;
};

export function SessionHistory({
  sessions,
  analytics,
  onClear,
  onExport,
}: SessionHistoryProps) {
  const points = sessions
    .slice()
    .reverse()
    .slice(-14)
    .map((session) => session.coherenceScore);

  return (
    <section className="panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Progression</p>
          <h2 className="section-title">Local session log</h2>
        </div>
        <div className="flex gap-2">
          <button
            className="icon-button"
            type="button"
            onClick={onExport}
            aria-label="Export sessions"
          >
            <Download size={18} />
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={onClear}
            aria-label="Clear sessions"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniStat label="Sessions" value={analytics.sessionCount.toString()} />
        <MiniStat
          label="Average"
          value={analytics.averageCoherence.toString()}
        />
        <MiniStat label="Best" value={analytics.bestCoherence.toString()} />
      </div>

      <Sparkline points={points} />

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
                  quality {Math.round(session.quality * 100)}%
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
