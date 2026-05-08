import type { BreathSettings, BreathState } from "../features/breath/breath";

type BreathVisualizerProps = {
  state: BreathState;
  settings: BreathSettings;
  remainingLabel: string;
  running: boolean;
};

export function BreathVisualizer({
  state,
  settings,
  remainingLabel,
  running,
}: BreathVisualizerProps) {
  const radius = 46 + state.radiusScale * 72;
  const circumference = 2 * Math.PI * 118;
  const offset = circumference * (1 - state.cycleProgress);

  return (
    <div className="breath-stage" aria-live="polite">
      <svg
        className="breath-ring"
        viewBox="0 0 320 320"
        role="img"
        aria-label="Breath pacer"
      >
        <circle className="breath-track" cx="160" cy="160" r="118" />
        <circle
          className="breath-progress"
          cx="160"
          cy="160"
          r="118"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <circle
          className={`breath-core breath-core-${state.phase}`}
          cx="160"
          cy="160"
          r={radius}
        />
      </svg>
      <div className="breath-copy">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-800">
          {running ? remainingLabel : "Ready"}
        </p>
        <h2>{state.phaseLabel}</h2>
        <p>
          {running
            ? state.instruction
            : "Start a reset and follow the expanding guide."}
        </p>
        <span>{settings.breathsPerMinute.toFixed(1)} breaths/min</span>
      </div>
    </div>
  );
}
