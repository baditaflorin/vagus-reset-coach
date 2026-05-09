import { HeartHandshake, ShieldCheck, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SettingsPanel } from "./components/SettingsPanel";
import { BreathAudio } from "./features/breath/audio";
import {
  DEFAULT_BREATH_SETTINGS,
  getBreathState,
  recommendBreathSettings,
  type BreathSettings,
  type BreathState,
} from "./features/breath/breath";
import {
  buildClipboardSummary,
  buildPrintableSummaryHtml,
  downloadTextFile,
  parseAppStateJson,
  readAppStateFile,
  serializeAppState,
} from "./features/app-state/files";
import {
  buildUnavailableDiagnostics,
  loadVisibleCommit,
} from "./features/app-state/browser";
import {
  clearAppSettings,
  clearInterruptedSession,
  getDefaultAppSettings,
  loadAppSettings,
  markInterruptedSession,
  readInterruptedSession,
  saveAppSettings,
} from "./features/app-state/settings";
import type { AppSettings } from "./features/app-state/types";
import { evaluateSignalDiagnostics } from "./features/rppg/diagnostics";
import { PulseEstimator } from "./features/rppg/rppg";
import type { PulseMetrics, SignalDiagnostics } from "./features/rppg/types";
import {
  defaultFaceRoi,
  VideoFrameSampler,
} from "./features/rppg/videoSampler";
import {
  buildSessionRecord,
  summarizeInMemory,
  summarizeSessions,
} from "./features/sessions/analytics";
import { deriveCoachState } from "./features/session/state";
import {
  clearSessions,
  getSessionLoadReport,
  replaceSessions,
  saveSession,
} from "./features/sessions/storage";
import type {
  AnalyticsSummary,
  SessionRecord,
} from "./features/sessions/types";
import { BreathVisualizer } from "./components/BreathVisualizer";
import { CameraPanel } from "./components/CameraPanel";
import { MetricTile } from "./components/MetricTile";
import { SessionHistory } from "./components/SessionHistory";
import { formatMetric, formatTime } from "./lib/format";

const SESSION_MS = 120_000;
const EMPTY_METRICS: PulseMetrics = {
  bpm: null,
  rmssdMs: null,
  quality: 0,
  sampleCount: 0,
  peakCount: 0,
  intervalsMs: [],
  status: "warming",
};
const EMPTY_DIAGNOSTICS: SignalDiagnostics =
  buildUnavailableDiagnostics(EMPTY_METRICS);

type ActiveSession = {
  startedAt: Date;
  startedAtMs: number;
  baselineBpm: number | null;
  running: boolean;
};

function manualBreathSettings(rate: number): BreathSettings {
  const cycleSec = 60 / rate;
  const exhaleSec = Math.min(6.8, Math.max(5.2, cycleSec * 0.58));
  const inhaleSec = Math.max(3.6, cycleSec - exhaleSec);

  return {
    breathsPerMinute: rate,
    inhaleSec: Math.round(inhaleSec * 10) / 10,
    holdTopSec: 0,
    exhaleSec: Math.round(exhaleSec * 10) / 10,
    holdBottomSec: 0,
  };
}

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const samplerRef = useRef<VideoFrameSampler | null>(null);
  const estimatorRef = useRef(new PulseEstimator());
  const audioRef = useRef(new BreathAudio());
  const metricsRef = useRef<PulseMetrics>(EMPTY_METRICS);
  const diagnosticsRef = useRef<SignalDiagnostics>(EMPTY_DIAGNOSTICS);
  const sessionRef = useRef<ActiveSession | null>(null);
  const lastPhaseRef = useRef<string | null>(null);
  const settingsRef = useRef<BreathSettings>(DEFAULT_BREATH_SETTINGS);
  const appSettingsRef = useRef<AppSettings>(getDefaultAppSettings());

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<PulseMetrics>(EMPTY_METRICS);
  const [diagnostics, setDiagnostics] =
    useState<SignalDiagnostics>(EMPTY_DIAGNOSTICS);
  const [appSettings, setAppSettings] = useState<AppSettings>(() =>
    loadAppSettings(),
  );
  const [breathSettings, setBreathSettings] = useState<BreathSettings>(() => {
    const settings = loadAppSettings();
    return settings.adaptiveBreath
      ? DEFAULT_BREATH_SETTINGS
      : manualBreathSettings(settings.manualBreathsPerMinute);
  });
  const [breathState, setBreathState] = useState<BreathState>(() =>
    getBreathState(0, DEFAULT_BREATH_SETTINGS),
  );
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(() =>
    summarizeInMemory([]),
  );
  const [lastRecord, setLastRecord] = useState<SessionRecord | null>(null);
  const [displayCommit, setDisplayCommit] = useState(__APP_COMMIT__);
  const [skippedHistoryRecords, setSkippedHistoryRecords] = useState(0);
  const [saving, setSaving] = useState(false);
  const [recoverableError, setRecoverableError] = useState<string | null>(null);
  const [pendingRecord, setPendingRecord] = useState<SessionRecord | null>(
    null,
  );
  const [ownershipNotice, setOwnershipNotice] = useState<string | null>(null);
  const [interruptedNotice, setInterruptedNotice] = useState<string | null>(
    () => {
      const interruptedAt = readInterruptedSession();
      if (interruptedAt) {
        clearInterruptedSession();
        return `A previous reset ended before it could finish on ${interruptedAt}. Your saved history is still available below.`;
      }
      return null;
    },
  );
  const debugEnabled = window.location.search.includes("debug=1");

  useEffect(() => {
    settingsRef.current = breathSettings;
  }, [breathSettings]);

  useEffect(() => {
    appSettingsRef.current = appSettings;
    saveAppSettings(appSettings);
    audioRef.current.setEnabled(appSettings.audioEnabled);
  }, [appSettings]);

  const refreshHistory = useCallback(async () => {
    const { records, skippedRecords } = await getSessionLoadReport();
    setSessions(records);
    setSkippedHistoryRecords(skippedRecords);
    setAnalytics(await summarizeSessions(records));
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void refreshHistory(), 0);
    return () => window.clearTimeout(timeout);
  }, [refreshHistory]);

  useEffect(() => {
    let cancelled = false;
    const loadCommit = async () => {
      const nextCommit = await loadVisibleCommit(__APP_COMMIT__);
      if (!cancelled) {
        setDisplayCommit(nextCommit);
      }
    };
    void loadCommit();
    return () => {
      cancelled = true;
    };
  }, []);

  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      return true;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Camera access is not available in this browser. You can continue breath-only, but HRV will not be measured.",
      );
      const nextDiagnostics = buildUnavailableDiagnostics(EMPTY_METRICS);
      diagnosticsRef.current = nextDiagnostics;
      setDiagnostics(nextDiagnostics);
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 960 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      });
      streamRef.current = stream;
      setCameraActive(true);
      setCameraError(null);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      return true;
    } catch (error) {
      setCameraError(
        error instanceof Error
          ? error.message
          : "Camera permission was not granted.",
      );
      const nextDiagnostics = buildUnavailableDiagnostics(EMPTY_METRICS);
      diagnosticsRef.current = nextDiagnostics;
      setDiagnostics(nextDiagnostics);
      return false;
    }
  }, []);

  const finishSession = useCallback(async () => {
    const active = sessionRef.current;
    if (!active?.running) {
      return;
    }

    active.running = false;
    sessionRef.current = null;
    setRunning(false);
    setElapsedMs(SESSION_MS);
    const currentMetrics = metricsRef.current;
    const record = buildSessionRecord({
      startedAt: active.startedAt,
      durationSec: SESSION_MS / 1_000,
      baselineBpm: active.baselineBpm,
      endingBpm: currentMetrics.bpm,
      rmssdMs: currentMetrics.rmssdMs,
      breathsPerMinute: settingsRef.current.breathsPerMinute,
      quality: currentMetrics.quality,
      diagnostics: diagnosticsRef.current,
      appVersion: __APP_VERSION__,
    });
    setSaving(true);
    setRecoverableError(null);
    clearInterruptedSession();
    try {
      await saveSession(record);
      setPendingRecord(null);
      setLastRecord(record);
      await refreshHistory();
    } catch {
      setPendingRecord(record);
      setRecoverableError(
        "Local storage could not save this reset. Your summary is still in memory; retry or export existing history before clearing browser data.",
      );
    } finally {
      setSaving(false);
    }
  }, [refreshHistory]);

  useEffect(() => {
    if (!streamRef.current && !running) {
      return;
    }

    if (streamRef.current) {
      samplerRef.current ??= new VideoFrameSampler();
    }
    const interval = window.setInterval(() => {
      const video = videoRef.current;
      const sampler = samplerRef.current;
      if (video && sampler) {
        const sample = sampler.sample(video, defaultFaceRoi());
        if (sample) {
          const nextMetrics = estimatorRef.current.addSample(sample);
          const nextDiagnostics = evaluateSignalDiagnostics({
            cameraAvailable: true,
            metrics: nextMetrics,
            samples: estimatorRef.current.getSamples(),
          });
          metricsRef.current = nextMetrics;
          diagnosticsRef.current = nextDiagnostics;
          setMetrics(nextMetrics);
          setDiagnostics(nextDiagnostics);

          if (
            appSettingsRef.current.adaptiveBreath &&
            sessionRef.current?.running &&
            nextDiagnostics.ready &&
            sample.timeMs % 4_000 < 120
          ) {
            const recommended = recommendBreathSettings(nextMetrics);
            if (
              Math.abs(
                recommended.breathsPerMinute -
                  settingsRef.current.breathsPerMinute,
              ) >= 0.2
            ) {
              settingsRef.current = recommended;
              setBreathSettings(recommended);
            }
          }
        }
      }

      const active = sessionRef.current;
      if (!active?.running) {
        return;
      }

      const elapsed = performance.now() - active.startedAtMs;
      setElapsedMs(elapsed);
      const nextBreathState = getBreathState(elapsed, settingsRef.current);
      setBreathState(nextBreathState);
      if (nextBreathState.phase !== lastPhaseRef.current) {
        lastPhaseRef.current = nextBreathState.phase;
        void audioRef.current.cue(nextBreathState.phase);
      }
      if (elapsed >= SESSION_MS) {
        void finishSession();
      }
    }, 90);

    return () => window.clearInterval(interval);
  }, [finishSession, cameraActive, running]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      void audio.close();
    };
  }, []);

  const beginSession = useCallback(async () => {
    if (sessionRef.current?.running) {
      return;
    }
    await startCamera();
    if (!appSettingsRef.current.adaptiveBreath) {
      const manualSettings = manualBreathSettings(
        appSettingsRef.current.manualBreathsPerMinute,
      );
      settingsRef.current = manualSettings;
      setBreathSettings(manualSettings);
    }
    const now = performance.now();
    const startedAt = new Date();
    sessionRef.current = {
      startedAt,
      startedAtMs: now,
      baselineBpm: diagnosticsRef.current.ready ? metricsRef.current.bpm : null,
      running: true,
    };
    markInterruptedSession(startedAt.toISOString());
    setOwnershipNotice(null);
    setInterruptedNotice(null);
    setLastRecord(null);
    setRecoverableError(null);
    setElapsedMs(0);
    setRunning(true);
    lastPhaseRef.current = null;
    setBreathState(getBreathState(0, settingsRef.current));
  }, [startCamera]);

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.running = false;
      sessionRef.current = null;
    }
    clearInterruptedSession();
    setRunning(false);
  }, []);

  const toggleAudio = useCallback(() => {
    setAppSettings((current) => ({
      ...current,
      audioEnabled: !current.audioEnabled,
    }));
  }, []);

  const clearHistory = useCallback(async () => {
    if (
      sessions.length === 0 ||
      !window.confirm("Clear all local session records?")
    ) {
      return;
    }
    await clearSessions();
    setLastRecord(null);
    setOwnershipNotice("Local session history cleared.");
    await refreshHistory();
  }, [refreshHistory, sessions.length]);

  const resetSettings = useCallback(() => {
    const defaults = getDefaultAppSettings();
    clearAppSettings();
    setAppSettings(defaults);
    settingsRef.current = defaults.adaptiveBreath
      ? DEFAULT_BREATH_SETTINGS
      : manualBreathSettings(defaults.manualBreathsPerMinute);
    setBreathSettings(settingsRef.current);
    setOwnershipNotice("Settings restored to the local defaults.");
  }, []);

  const factoryReset = useCallback(async () => {
    if (
      !window.confirm(
        "Clear all local sessions, reset settings, and remove interrupted-session markers?",
      )
    ) {
      return;
    }

    await clearSessions();
    clearAppSettings();
    clearInterruptedSession();
    const defaults = getDefaultAppSettings();
    setAppSettings(defaults);
    setBreathSettings(DEFAULT_BREATH_SETTINGS);
    settingsRef.current = DEFAULT_BREATH_SETTINGS;
    setLastRecord(null);
    setPendingRecord(null);
    setRecoverableError(null);
    setInterruptedNotice(null);
    setOwnershipNotice("All local app data cleared from this browser.");
    await refreshHistory();
  }, [refreshHistory]);

  const retryPendingSave = useCallback(async () => {
    if (!pendingRecord) {
      return;
    }
    setSaving(true);
    setRecoverableError(null);
    try {
      await saveSession(pendingRecord);
      setLastRecord(pendingRecord);
      setPendingRecord(null);
      clearInterruptedSession();
      await refreshHistory();
    } catch {
      setRecoverableError(
        "Local storage still could not save this reset. Export history, free browser storage, and retry.",
      );
    } finally {
      setSaving(false);
    }
  }, [pendingRecord, refreshHistory]);

  const exportHistory = useCallback(() => {
    downloadTextFile(
      "vagus-reset-state.json",
      serializeAppState({
        appVersion: __APP_VERSION__,
        settings: appSettings,
        sessions,
      }),
    );
    setOwnershipNotice("Local app state exported as vagus-reset-state.json.");
  }, [appSettings, sessions]);

  const importAppState = useCallback(
    async (text: string) => {
      try {
        const imported = parseAppStateJson(text);
        const nextBreathSettings = imported.settings.adaptiveBreath
          ? DEFAULT_BREATH_SETTINGS
          : manualBreathSettings(imported.settings.manualBreathsPerMinute);
        await replaceSessions(imported.sessions);
        saveAppSettings(imported.settings);
        setAppSettings(imported.settings);
        settingsRef.current = nextBreathSettings;
        setBreathSettings(nextBreathSettings);
        setInterruptedNotice(null);
        setOwnershipNotice(
          `Imported ${imported.sessions.length} session record${imported.sessions.length === 1 ? "" : "s"} and restored local settings.`,
        );
        setLastRecord(imported.sessions[0] ?? null);
        await refreshHistory();
      } catch {
        setOwnershipNotice(
          "Import failed. Use a Vagus Reset Coach export JSON file or a legacy Phase 2 history export.",
        );
      }
    },
    [refreshHistory],
  );

  const importAppStateFile = useCallback(
    async (file: File) => {
      try {
        const imported = await readAppStateFile(file);
        const nextBreathSettings = imported.settings.adaptiveBreath
          ? DEFAULT_BREATH_SETTINGS
          : manualBreathSettings(imported.settings.manualBreathsPerMinute);
        await replaceSessions(imported.sessions);
        saveAppSettings(imported.settings);
        setAppSettings(imported.settings);
        settingsRef.current = nextBreathSettings;
        setBreathSettings(nextBreathSettings);
        setInterruptedNotice(null);
        setOwnershipNotice(
          `Imported ${imported.sessions.length} session record${imported.sessions.length === 1 ? "" : "s"} from ${file.name}.`,
        );
        setLastRecord(imported.sessions[0] ?? null);
        await refreshHistory();
      } catch {
        setOwnershipNotice(
          "That file could not be imported. Choose a Vagus Reset Coach JSON export and try again.",
        );
      }
    },
    [refreshHistory],
  );

  const copySummary = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        buildClipboardSummary({
          sessions,
          lowConfidenceCount: analytics.lowConfidenceCount,
        }),
      );
      setOwnershipNotice("Session summary copied to the clipboard.");
    } catch {
      setOwnershipNotice(
        "Clipboard write was blocked. Use the export button if you need a portable copy.",
      );
    }
  }, [analytics.lowConfidenceCount, sessions]);

  const printSummary = useCallback(() => {
    const popup = window.open("", "_blank", "noopener,noreferrer");
    if (!popup) {
      setOwnershipNotice(
        "Print view was blocked by the browser. Allow popups for this page and try again.",
      );
      return;
    }

    popup.document.write(
      buildPrintableSummaryHtml({
        sessions,
        appVersion: __APP_VERSION__,
      }),
    );
    popup.document.close();
    popup.focus();
    popup.print();
  }, [sessions]);

  const toggleAdaptiveBreath = useCallback(() => {
    setAppSettings((current) => {
      const adaptiveBreath = !current.adaptiveBreath;
      const nextSettings = {
        ...current,
        adaptiveBreath,
      };
      const nextBreathSettings = adaptiveBreath
        ? DEFAULT_BREATH_SETTINGS
        : manualBreathSettings(current.manualBreathsPerMinute);
      settingsRef.current = nextBreathSettings;
      setBreathSettings(nextBreathSettings);
      return nextSettings;
    });
  }, []);

  const updateManualBreaths = useCallback((value: number) => {
    setAppSettings((current) => ({
      ...current,
      manualBreathsPerMinute: value,
    }));
    if (!appSettingsRef.current.adaptiveBreath) {
      const nextBreathSettings = manualBreathSettings(value);
      settingsRef.current = nextBreathSettings;
      setBreathSettings(nextBreathSettings);
    }
  }, []);

  const remainingLabel = formatTime((SESSION_MS - elapsedMs) / 1_000);
  const signalLabel = diagnostics.primaryMessage;
  const coachState = useMemo(
    () =>
      deriveCoachState({
        cameraActive,
        running,
        saving,
        saved: lastRecord !== null && !running,
        recoverableError,
        diagnostics,
      }),
    [cameraActive, diagnostics, lastRecord, recoverableError, running, saving],
  );
  const debugSnapshot = useMemo(
    () => ({
      cameraActive,
      running,
      metrics,
      diagnostics,
      coachState,
      skippedHistoryRecords,
    }),
    [
      cameraActive,
      coachState,
      diagnostics,
      metrics,
      running,
      skippedHistoryRecords,
    ],
  );
  const copyDebugSnapshot = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(debugSnapshot, null, 2),
      );
      setOwnershipNotice("Debug snapshot copied to the clipboard.");
    } catch {
      setOwnershipNotice(
        "Clipboard write was blocked. Copy the debug panel text manually instead.",
      );
    }
  }, [debugSnapshot]);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="site-header">
        <div>
          <p className="eyebrow">Local biometric reset</p>
          <h1>Vagus Reset Coach</h1>
        </div>
        <nav className="top-actions" aria-label="Project links">
          <a
            href="https://github.com/baditaflorin/vagus-reset-coach"
            target="_blank"
            rel="noreferrer"
          >
            <Star size={18} />
            GitHub
          </a>
          <a
            href="https://www.paypal.com/paypalme/florinbadita"
            target="_blank"
            rel="noreferrer"
          >
            <HeartHandshake size={18} />
            PayPal
          </a>
        </nav>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-5 px-4 pb-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.7fr)]">
        <section className="space-y-5">
          <div className="coach-panel">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Two-minute protocol</p>
                <h2 className="coach-title">Reset stress without a wearable</h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-stone-700">
                  Keep your face inside the guide, breathe with the pacer, and
                  let the app estimate pulse variability from tiny color shifts
                  in the webcam image.
                </p>
              </div>
              <span className="privacy-badge">
                <ShieldCheck size={18} />
                No uploads
              </span>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
              <CameraPanel
                videoRef={videoRef}
                diagnostics={diagnostics}
                stateLabel={coachState.label}
                cameraActive={cameraActive}
                running={running}
                audioEnabled={appSettings.audioEnabled}
                error={cameraError}
                onStartCamera={() => void startCamera()}
                onStartSession={() => void beginSession()}
                onStopSession={stopSession}
                onToggleAudio={toggleAudio}
              />
              <BreathVisualizer
                state={breathState}
                settings={breathSettings}
                remainingLabel={remainingLabel}
                running={running}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTile
              label="Heart rate"
              value={formatMetric(metrics.bpm, " bpm")}
              detail={signalLabel}
              tone="teal"
            />
            <MetricTile
              label="HRV RMSSD"
              value={formatMetric(metrics.rmssdMs, " ms")}
              detail={`${metrics.peakCount} detected pulse peaks`}
              tone="coral"
            />
            <MetricTile
              label="Signal"
              value={`${Math.round(metrics.quality * 100)}%`}
              detail={`Measurement confidence ${Math.round(diagnostics.confidence * 100)}%`}
              tone="amber"
            />
            <MetricTile
              label="Pacer"
              value={`${breathSettings.breathsPerMinute.toFixed(1)}/min`}
              detail={
                appSettings.adaptiveBreath
                  ? "Adapts gently from live signal quality"
                  : "Locked to your saved manual setting"
              }
              tone="ink"
            />
          </div>
        </section>

        <aside className="space-y-5">
          {ownershipNotice && (
            <section className="panel border-teal-700/30 bg-teal-50">
              <p className="eyebrow">Local ownership</p>
              <p className="text-sm leading-6 text-teal-950/80">
                {ownershipNotice}
              </p>
            </section>
          )}
          {interruptedNotice && (
            <section className="panel border-amber/40 bg-amber-50">
              <p className="eyebrow">Interrupted reset</p>
              <p className="text-sm leading-6 text-amber-950/80">
                {interruptedNotice}
              </p>
            </section>
          )}
          {lastRecord && (
            <section className="panel border-teal-700/30 bg-teal-50">
              <p className="eyebrow">Last reset</p>
              <h2 className="section-title">
                {lastRecord.coherenceScore}/100 coherence
              </h2>
              <p className="mt-2 text-sm leading-6 text-teal-950/75">
                Ending HR {lastRecord.endingBpm ?? "n/a"} bpm · RMSSD{" "}
                {lastRecord.rmssdMs ?? "n/a"} ms · {lastRecord.confidenceLabel}{" "}
                confidence local record saved.
              </p>
            </section>
          )}
          {recoverableError && (
            <section className="panel border-coral/40 bg-orange-50">
              <p className="eyebrow">Recoverable issue</p>
              <h2 className="section-title">Session not saved yet</h2>
              <p className="mt-2 text-sm leading-6 text-orange-950/75">
                {recoverableError}
              </p>
              <button
                className="control-button mt-4"
                type="button"
                onClick={() => void retryPendingSave()}
              >
                Retry save
              </button>
            </section>
          )}

          <SettingsPanel
            settings={appSettings}
            onToggleAudio={toggleAudio}
            onToggleAdaptiveBreath={toggleAdaptiveBreath}
            onManualBreathsChange={updateManualBreaths}
            onResetSettings={resetSettings}
            onFactoryReset={() => void factoryReset()}
          />

          <SessionHistory
            sessions={sessions}
            analytics={analytics}
            importStatus={ownershipNotice}
            onClear={clearHistory}
            onCopySummary={() => void copySummary()}
            onExport={exportHistory}
            onImportFile={(file) => void importAppStateFile(file)}
            onImportText={(text) => void importAppState(text)}
            onPrintSummary={printSummary}
          />
          {skippedHistoryRecords > 0 && (
            <section className="panel border-amber/40 bg-amber-50">
              <p className="eyebrow">History recovery</p>
              <h2 className="section-title">
                {skippedHistoryRecords} invalid local record
                {skippedHistoryRecords === 1 ? "" : "s"} skipped
              </h2>
              <p className="mt-2 text-sm leading-6 text-amber-950/75">
                Your valid sessions were preserved. Export history before
                clearing data if you want to inspect the raw browser records.
              </p>
            </section>
          )}

          {debugEnabled && (
            <section className="panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">Debug</p>
                  <h2 className="section-title">Local snapshot</h2>
                </div>
                <button
                  className="control-button"
                  type="button"
                  onClick={() => void copyDebugSnapshot()}
                >
                  Copy debug
                </button>
              </div>
              <pre className="mt-3 max-h-96 overflow-auto rounded-lg bg-stone-950 p-3 text-xs leading-5 text-stone-50">
                {JSON.stringify(debugSnapshot, null, 2)}
              </pre>
            </section>
          )}

          <section className="panel">
            <p className="eyebrow">Build</p>
            <h2 className="section-title">Version {__APP_VERSION__}</h2>
            <p className="mt-2 text-sm text-stone-600">
              Commit {displayCommit}
            </p>
            <p className="mt-4 text-sm leading-6 text-stone-600">
              Educational wellness software only. It is not a medical device and
              does not diagnose, treat, or prevent disease.
            </p>
          </section>
        </aside>
      </main>
    </div>
  );
}

export default App;
