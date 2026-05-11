import { useEffect, useState } from "react";
import { Camera, Heart, ShieldCheck, Wind, X } from "lucide-react";

export function OnboardingBanner({
  onDismiss,
  onStartCamera,
}: {
  onDismiss: () => void;
  onStartCamera: () => void;
}) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!closing) return;
    const handle = window.setTimeout(onDismiss, 180);
    return () => window.clearTimeout(handle);
  }, [closing, onDismiss]);

  return (
    <section
      className={`onboarding-banner ${closing ? "is-closing" : ""}`}
      role="dialog"
      aria-modal="false"
      aria-labelledby="onboarding-title"
    >
      <button
        type="button"
        className="icon-button onboarding-close"
        onClick={() => setClosing(true)}
        aria-label="Dismiss this introduction"
      >
        <X size={18} aria-hidden="true" />
      </button>

      <p className="eyebrow">First visit?</p>
      <h2 id="onboarding-title" className="section-title">
        Two minutes, one breath at a time
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-700">
        This is a calm, two-minute breathing guide. The pacer expands when you
        inhale and shrinks when you exhale. If you grant camera access, the app
        also estimates your heart rate and HRV from tiny color shifts in your
        face — a technique called <strong>rPPG</strong>. Nothing is uploaded;
        every measurement stays on this device.
      </p>

      <ul className="onboarding-points">
        <li>
          <Wind size={18} aria-hidden="true" />
          <span>
            <strong>Breathe with the pacer.</strong> Match the inhale and exhale
            — it sets a calmer, longer rhythm than your usual breath.
          </span>
        </li>
        <li>
          <Camera size={18} aria-hidden="true" />
          <span>
            <strong>Grant the camera (optional).</strong> The pulse reader uses
            tiny brightness changes in your face. Without it, the pacer still
            works.
          </span>
        </li>
        <li>
          <Heart size={18} aria-hidden="true" />
          <span>
            <strong>HRV (RMSSD)</strong> is a measure of how variable the gap
            between heartbeats is. Higher numbers usually mean your nervous
            system is in a more rested state.
          </span>
        </li>
        <li>
          <ShieldCheck size={18} aria-hidden="true" />
          <span>
            <strong>Local-only.</strong> Sessions save to this browser only. You
            can export them as JSON; nothing leaves the device on its own.
          </span>
        </li>
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="control-button primary"
          onClick={() => {
            onStartCamera();
            setClosing(true);
          }}
        >
          <Camera size={18} aria-hidden="true" />
          Grant camera & continue
        </button>
        <button
          type="button"
          className="control-button"
          onClick={() => setClosing(true)}
        >
          Skip — pacer only
        </button>
      </div>
    </section>
  );
}
