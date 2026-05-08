import { Camera, Play, Square, Volume2, VolumeX } from 'lucide-react'
import type { RefObject } from 'react'
import type { PulseMetrics } from '../features/rppg/types'

type CameraPanelProps = {
  videoRef: RefObject<HTMLVideoElement | null>
  metrics: PulseMetrics
  cameraActive: boolean
  running: boolean
  audioEnabled: boolean
  error: string | null
  onStartCamera: () => void
  onStartSession: () => void
  onStopSession: () => void
  onToggleAudio: () => void
}

export function CameraPanel({
  videoRef,
  metrics,
  cameraActive,
  running,
  audioEnabled,
  error,
  onStartCamera,
  onStartSession,
  onStopSession,
  onToggleAudio,
}: CameraPanelProps) {
  const quality = Math.round(metrics.quality * 100)

  return (
    <section className="panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Webcam rPPG</p>
          <h2 className="section-title">Face pulse reader</h2>
        </div>
        <span className={`status-pill ${cameraActive ? 'status-pill-on' : ''}`}>
          {cameraActive ? `${quality}% signal` : 'camera off'}
        </span>
      </div>

      <div className="video-shell mt-4">
        <video ref={videoRef} playsInline muted aria-label="Webcam preview" />
        <div className="roi-box" aria-hidden="true" />
        {!cameraActive && <div className="video-placeholder">Camera preview appears here</div>}
      </div>

      {error && <p className="mt-3 rounded-lg border border-coral/30 bg-orange-50 p-3 text-sm text-orange-950">{error}</p>}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button className="control-button" type="button" onClick={onStartCamera}>
          <Camera size={18} />
          Camera
        </button>
        <button className="control-button primary" type="button" onClick={onStartSession} disabled={running}>
          <Play size={18} />
          Start
        </button>
        <button className="control-button" type="button" onClick={onStopSession} disabled={!running}>
          <Square size={18} />
          Stop
        </button>
        <button className="control-button" type="button" onClick={onToggleAudio}>
          {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          Audio
        </button>
      </div>
    </section>
  )
}
