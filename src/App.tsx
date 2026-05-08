import { HeartHandshake, ShieldCheck, Star } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BreathAudio } from './features/breath/audio'
import {
  DEFAULT_BREATH_SETTINGS,
  getBreathState,
  recommendBreathSettings,
  type BreathSettings,
  type BreathState,
} from './features/breath/breath'
import { PulseEstimator } from './features/rppg/rppg'
import type { PulseMetrics } from './features/rppg/types'
import { defaultFaceRoi, VideoFrameSampler } from './features/rppg/videoSampler'
import { buildSessionRecord, summarizeInMemory, summarizeSessions } from './features/sessions/analytics'
import { clearSessions, getSessions, saveSession } from './features/sessions/storage'
import type { AnalyticsSummary, SessionRecord } from './features/sessions/types'
import { BreathVisualizer } from './components/BreathVisualizer'
import { CameraPanel } from './components/CameraPanel'
import { MetricTile } from './components/MetricTile'
import { SessionHistory } from './components/SessionHistory'
import { formatMetric, formatTime } from './lib/format'

const SESSION_MS = 120_000
const EMPTY_METRICS: PulseMetrics = {
  bpm: null,
  rmssdMs: null,
  quality: 0,
  sampleCount: 0,
  peakCount: 0,
  intervalsMs: [],
  status: 'warming',
}

type ActiveSession = {
  startedAt: Date
  startedAtMs: number
  baselineBpm: number | null
  running: boolean
}

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const samplerRef = useRef<VideoFrameSampler | null>(null)
  const estimatorRef = useRef(new PulseEstimator())
  const audioRef = useRef(new BreathAudio())
  const metricsRef = useRef<PulseMetrics>(EMPTY_METRICS)
  const sessionRef = useRef<ActiveSession | null>(null)
  const lastPhaseRef = useRef<string | null>(null)
  const settingsRef = useRef<BreathSettings>(DEFAULT_BREATH_SETTINGS)

  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<PulseMetrics>(EMPTY_METRICS)
  const [breathSettings, setBreathSettings] = useState<BreathSettings>(DEFAULT_BREATH_SETTINGS)
  const [breathState, setBreathState] = useState<BreathState>(() => getBreathState(0, DEFAULT_BREATH_SETTINGS))
  const [running, setRunning] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(() => summarizeInMemory([]))
  const [lastRecord, setLastRecord] = useState<SessionRecord | null>(null)

  useEffect(() => {
    settingsRef.current = breathSettings
  }, [breathSettings])

  const refreshHistory = useCallback(async () => {
    const records = await getSessions()
    setSessions(records)
    setAnalytics(await summarizeSessions(records))
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => void refreshHistory(), 0)
    return () => window.clearTimeout(timeout)
  }, [refreshHistory])

  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      return true
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('This browser does not expose camera access. You can still use the breath pacer.')
      return false
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 960 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      })
      streamRef.current = stream
      setCameraActive(true)
      setCameraError(null)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      return true
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : 'Camera permission was not granted.')
      return false
    }
  }, [])

  const finishSession = useCallback(async () => {
    const active = sessionRef.current
    if (!active?.running) {
      return
    }

    active.running = false
    sessionRef.current = null
    setRunning(false)
    setElapsedMs(SESSION_MS)
    const currentMetrics = metricsRef.current
    const record = buildSessionRecord({
      startedAt: active.startedAt,
      durationSec: SESSION_MS / 1_000,
      baselineBpm: active.baselineBpm,
      endingBpm: currentMetrics.bpm,
      rmssdMs: currentMetrics.rmssdMs,
      breathsPerMinute: settingsRef.current.breathsPerMinute,
      quality: currentMetrics.quality,
    })
    await saveSession(record)
    setLastRecord(record)
    await refreshHistory()
  }, [refreshHistory])

  useEffect(() => {
    if (!streamRef.current && !running) {
      return
    }

    if (streamRef.current) {
      samplerRef.current ??= new VideoFrameSampler()
    }
    const interval = window.setInterval(() => {
      const video = videoRef.current
      const sampler = samplerRef.current
      if (video && sampler) {
        const sample = sampler.sample(video, defaultFaceRoi())
        if (sample) {
          const nextMetrics = estimatorRef.current.addSample(sample)
          metricsRef.current = nextMetrics
          setMetrics(nextMetrics)

          if (sessionRef.current?.running && sample.timeMs % 4_000 < 120) {
            const recommended = recommendBreathSettings(nextMetrics)
            if (Math.abs(recommended.breathsPerMinute - settingsRef.current.breathsPerMinute) >= 0.2) {
              settingsRef.current = recommended
              setBreathSettings(recommended)
            }
          }
        }
      }

      const active = sessionRef.current
      if (!active?.running) {
        return
      }

      const elapsed = performance.now() - active.startedAtMs
      setElapsedMs(elapsed)
      const nextBreathState = getBreathState(elapsed, settingsRef.current)
      setBreathState(nextBreathState)
      if (nextBreathState.phase !== lastPhaseRef.current) {
        lastPhaseRef.current = nextBreathState.phase
        void audioRef.current.cue(nextBreathState.phase)
      }
      if (elapsed >= SESSION_MS) {
        void finishSession()
      }
    }, 90)

    return () => window.clearInterval(interval)
  }, [finishSession, cameraActive, running])

  useEffect(() => {
    const audio = audioRef.current
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      void audio.close()
    }
  }, [])

  const beginSession = useCallback(async () => {
    await startCamera()
    const now = performance.now()
    sessionRef.current = {
      startedAt: new Date(),
      startedAtMs: now,
      baselineBpm: metricsRef.current.bpm,
      running: true,
    }
    setLastRecord(null)
    setElapsedMs(0)
    setRunning(true)
    lastPhaseRef.current = null
    setBreathState(getBreathState(0, settingsRef.current))
  }, [startCamera])

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.running = false
      sessionRef.current = null
    }
    setRunning(false)
  }, [])

  const toggleAudio = useCallback(() => {
    const next = !audioEnabled
    setAudioEnabled(next)
    audioRef.current.setEnabled(next)
  }, [audioEnabled])

  const clearHistory = useCallback(async () => {
    if (sessions.length === 0 || !window.confirm('Clear all local session records?')) {
      return
    }
    await clearSessions()
    setLastRecord(null)
    await refreshHistory()
  }, [refreshHistory, sessions.length])

  const exportHistory = useCallback(() => {
    const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'vagus-reset-sessions.json'
    link.click()
    URL.revokeObjectURL(url)
  }, [sessions])

  const remainingLabel = formatTime((SESSION_MS - elapsedMs) / 1_000)
  const signalLabel = useMemo(() => {
    if (metrics.status === 'ready') {
      return 'rPPG ready'
    }
    if (metrics.status === 'low-quality') {
      return 'improve light'
    }
    return 'warming signal'
  }, [metrics.status])

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="site-header">
        <div>
          <p className="eyebrow">Local biometric reset</p>
          <h1>Vagus Reset Coach</h1>
        </div>
        <nav className="top-actions" aria-label="Project links">
          <a href="https://github.com/baditaflorin/vagus-reset-coach" target="_blank" rel="noreferrer">
            <Star size={18} />
            GitHub
          </a>
          <a href="https://www.paypal.com/paypalme/florinbadita" target="_blank" rel="noreferrer">
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
                  Keep your face inside the guide, breathe with the pacer, and let the app estimate
                  pulse variability from tiny color shifts in the webcam image.
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
                metrics={metrics}
                cameraActive={cameraActive}
                running={running}
                audioEnabled={audioEnabled}
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
              value={formatMetric(metrics.bpm, ' bpm')}
              detail={signalLabel}
              tone="teal"
            />
            <MetricTile
              label="HRV RMSSD"
              value={formatMetric(metrics.rmssdMs, ' ms')}
              detail={`${metrics.peakCount} detected pulse peaks`}
              tone="coral"
            />
            <MetricTile
              label="Signal"
              value={`${Math.round(metrics.quality * 100)}%`}
              detail="Light, stillness, and cadence confidence"
              tone="amber"
            />
            <MetricTile
              label="Pacer"
              value={`${breathSettings.breathsPerMinute.toFixed(1)}/min`}
              detail="Adapts gently from live signal quality"
              tone="ink"
            />
          </div>
        </section>

        <aside className="space-y-5">
          {lastRecord && (
            <section className="panel border-teal-700/30 bg-teal-50">
              <p className="eyebrow">Last reset</p>
              <h2 className="section-title">{lastRecord.coherenceScore}/100 coherence</h2>
              <p className="mt-2 text-sm leading-6 text-teal-950/75">
                Ending HR {lastRecord.endingBpm ?? 'n/a'} bpm · RMSSD {lastRecord.rmssdMs ?? 'n/a'} ms ·
                local record saved.
              </p>
            </section>
          )}

          <SessionHistory
            sessions={sessions}
            analytics={analytics}
            onClear={clearHistory}
            onExport={exportHistory}
          />

          <section className="panel">
            <p className="eyebrow">Build</p>
            <h2 className="section-title">Version {__APP_VERSION__}</h2>
            <p className="mt-2 text-sm text-stone-600">Commit {__APP_COMMIT__}</p>
            <p className="mt-4 text-sm leading-6 text-stone-600">
              Educational wellness software only. It is not a medical device and does not diagnose,
              treat, or prevent disease.
            </p>
          </section>
        </aside>
      </main>
    </div>
  )
}

export default App
