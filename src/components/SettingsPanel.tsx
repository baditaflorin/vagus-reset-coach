import { RotateCcw, SlidersHorizontal } from "lucide-react";
import type { AppSettings } from "../features/app-state/types";

type SettingsPanelProps = {
  settings: AppSettings;
  onToggleAudio: () => void;
  onToggleAdaptiveBreath: () => void;
  onManualBreathsChange: (value: number) => void;
  onResetSettings: () => void;
  onFactoryReset: () => void;
};

export function SettingsPanel({
  settings,
  onToggleAudio,
  onToggleAdaptiveBreath,
  onManualBreathsChange,
  onResetSettings,
  onFactoryReset,
}: SettingsPanelProps) {
  return (
    <section className="panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Settings</p>
          <h2 className="section-title">Local preferences</h2>
        </div>
        <span className="privacy-badge">
          <SlidersHorizontal size={18} />
          Persists locally
        </span>
      </div>

      <div className="mt-4 space-y-4">
        <label className="settings-row">
          <span>
            <strong>Audio cues</strong>
            <small>Play inhale and exhale tones during the reset.</small>
          </span>
          <input
            checked={settings.audioEnabled}
            type="checkbox"
            onChange={onToggleAudio}
          />
        </label>

        <label className="settings-row">
          <span>
            <strong>Adaptive pacing</strong>
            <small>
              Let the app nudge breathing rate from live signal quality.
            </small>
          </span>
          <input
            checked={settings.adaptiveBreath}
            type="checkbox"
            onChange={onToggleAdaptiveBreath}
          />
        </label>

        <label className="block text-sm text-stone-700">
          <span className="mb-2 block font-semibold text-stone-950">
            Manual breathing rate
          </span>
          <input
            className="w-full accent-teal-700"
            disabled={settings.adaptiveBreath}
            max={8}
            min={4}
            step={0.1}
            type="range"
            value={settings.manualBreathsPerMinute}
            onChange={(event) =>
              onManualBreathsChange(Number(event.currentTarget.value))
            }
          />
          <span className="mt-2 block text-sm text-stone-600">
            {settings.manualBreathsPerMinute.toFixed(1)} breaths/min
            {settings.adaptiveBreath
              ? " when adaptive pacing is turned off."
              : ""}
          </span>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="control-button"
          type="button"
          onClick={onResetSettings}
        >
          <RotateCcw size={18} />
          Reset settings
        </button>
        <button
          className="control-button"
          type="button"
          onClick={onFactoryReset}
        >
          <RotateCcw size={18} />
          Clear all local data
        </button>
      </div>
    </section>
  );
}
