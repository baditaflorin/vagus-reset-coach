import type { BreathPhase } from './breath'

export class BreathAudio {
  private context: AudioContext | null = null
  private enabled = true

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  async cue(phase: BreathPhase) {
    if (!this.enabled) {
      return
    }

    const context = this.ensureContext()
    await context.resume()

    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const now = context.currentTime
    oscillator.type = 'sine'
    oscillator.frequency.value = phase === 'inhale' ? 392 : phase === 'exhale' ? 294 : 330
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.42)
  }

  async close() {
    if (this.context) {
      await this.context.close()
      this.context = null
    }
  }

  private ensureContext() {
    if (!this.context) {
      this.context = new AudioContext()
    }
    return this.context
  }
}
