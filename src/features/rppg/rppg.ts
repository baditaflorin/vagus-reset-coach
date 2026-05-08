import type { PulseMetrics, SignalSample } from './types'

const MAX_WINDOW_MS = 45_000
const ANALYSIS_WINDOW_MS = 30_000
const MIN_INTERVAL_MS = 430
const MAX_INTERVAL_MS = 1_500

type ProcessedPoint = {
  timeMs: number
  value: number
}

export class PulseEstimator {
  private samples: SignalSample[] = []

  addSample(sample: SignalSample): PulseMetrics {
    this.samples.push(sample)
    const cutoff = sample.timeMs - MAX_WINDOW_MS
    this.samples = this.samples.filter((entry) => entry.timeMs >= cutoff)
    return estimatePulseMetrics(this.samples)
  }

  reset() {
    this.samples = []
  }

  getSamples() {
    return [...this.samples]
  }
}

export function estimatePulseMetrics(samples: SignalSample[]): PulseMetrics {
  if (samples.length < 90) {
    return emptyMetrics(samples.length, 'warming')
  }

  const latest = samples[samples.length - 1]?.timeMs ?? 0
  const analysisSamples = samples.filter((sample) => sample.timeMs >= latest - ANALYSIS_WINDOW_MS)
  const processed = preprocess(analysisSamples)
  if (processed.length < 90) {
    return emptyMetrics(samples.length, 'warming')
  }

  const forward = detectPeaks(processed)
  const inverted = detectPeaks(processed.map((point) => ({ ...point, value: -point.value })))
  const selected = scorePeaks(forward) >= scorePeaks(inverted) ? forward : inverted
  const intervalsMs = intervalsFromPeaks(selected)
  const bpm = intervalsMs.length > 0 ? 60_000 / average(intervalsMs) : null
  const rmssdMs = calculateRmssd(intervalsMs)
  const quality = calculateQuality(analysisSamples, processed, intervalsMs, selected.length)
  const status: PulseMetrics['status'] =
    samples.length < 240 ? 'warming' : quality < 0.38 || bpm === null ? 'low-quality' : 'ready'

  return {
    bpm: bpm === null ? null : Math.round(bpm),
    rmssdMs: rmssdMs === null ? null : Math.round(rmssdMs),
    quality,
    sampleCount: samples.length,
    peakCount: selected.length,
    intervalsMs,
    status: status === 'warming' && bpm !== null ? 'measuring' : status,
  }
}

export function calculateRmssd(intervalsMs: number[]): number | null {
  if (intervalsMs.length < 3) {
    return null
  }

  const diffs = intervalsMs.slice(1).map((interval, index) => interval - intervalsMs[index])
  const squareMean = average(diffs.map((diff) => diff * diff))
  return Math.sqrt(squareMean)
}

function preprocess(samples: SignalSample[]): ProcessedPoint[] {
  const chroma = samples.map((sample) => {
    const total = sample.red + sample.green + sample.blue || 1
    return {
      timeMs: sample.timeMs,
      value: sample.green / total,
    }
  })

  const trend = movingAverage(chroma, 1_500)
  const detrended = chroma.map((point, index) => ({
    timeMs: point.timeMs,
    value: point.value - trend[index],
  }))
  const smoothed = movingAverage(detrended, 280)
  const mean = average(smoothed)
  const deviation = stddev(smoothed, mean) || 1

  return detrended.map((point, index) => ({
    timeMs: point.timeMs,
    value: (smoothed[index] - mean + (point.value - smoothed[index]) * 0.25) / deviation,
  }))
}

function movingAverage(points: ProcessedPoint[], windowMs: number): number[]
function movingAverage(values: number[], windowMs: number): number[]
function movingAverage(input: ProcessedPoint[] | number[], windowMs: number): number[] {
  if (input.length === 0) {
    return []
  }

  if (typeof input[0] === 'number') {
    const values = input as number[]
    const radius = Math.max(1, Math.round(windowMs / 80))
    return values.map((_, index) => {
      const start = Math.max(0, index - radius)
      const end = Math.min(values.length, index + radius + 1)
      return average(values.slice(start, end))
    })
  }

  const points = input as ProcessedPoint[]
  return points.map((point, index) => {
    let sum = 0
    let count = 0
    for (let cursor = index; cursor >= 0; cursor -= 1) {
      if (point.timeMs - points[cursor].timeMs > windowMs) {
        break
      }
      sum += points[cursor].value
      count += 1
    }
    return count === 0 ? point.value : sum / count
  })
}

function detectPeaks(points: ProcessedPoint[]) {
  const values = points.map((point) => point.value)
  const mean = average(values)
  const deviation = stddev(values, mean)
  const threshold = mean + deviation * 0.35
  const peaks: ProcessedPoint[] = []

  for (let index = 2; index < points.length - 2; index += 1) {
    const prev = points[index - 1]
    const current = points[index]
    const next = points[index + 1]
    const isLocalMax = current.value > prev.value && current.value >= next.value
    if (!isLocalMax || current.value < threshold) {
      continue
    }

    const last = peaks[peaks.length - 1]
    if (!last || current.timeMs - last.timeMs >= MIN_INTERVAL_MS) {
      peaks.push(current)
      continue
    }

    if (current.value > last.value) {
      peaks[peaks.length - 1] = current
    }
  }

  return peaks
}

function intervalsFromPeaks(peaks: ProcessedPoint[]) {
  const intervals: number[] = []
  for (let index = 1; index < peaks.length; index += 1) {
    const interval = peaks[index].timeMs - peaks[index - 1].timeMs
    if (interval >= MIN_INTERVAL_MS && interval <= MAX_INTERVAL_MS) {
      intervals.push(interval)
    }
  }
  return intervals
}

function calculateQuality(
  samples: SignalSample[],
  processed: ProcessedPoint[],
  intervalsMs: number[],
  peakCount: number,
) {
  if (samples.length < 90 || intervalsMs.length < 2) {
    return 0.18
  }

  const brightnessValues = samples.map((sample) => sample.brightness)
  const brightness = clamp((average(brightnessValues) - 32) / 120, 0, 1)
  const fps = samples.length / Math.max(1, (samples[samples.length - 1].timeMs - samples[0].timeMs) / 1_000)
  const cadence = clamp((fps - 8) / 14, 0, 1)
  const intervalMean = average(intervalsMs)
  const intervalRegularity = clamp(1 - stddev(intervalsMs, intervalMean) / intervalMean, 0, 1)
  const amplitude = clamp(stddev(processed.map((point) => point.value), 0) / 0.8, 0, 1)
  const peakDensity = clamp(peakCount / 18, 0, 1)

  return roundTo((brightness * 0.2 + cadence * 0.2 + intervalRegularity * 0.3 + amplitude * 0.15 + peakDensity * 0.15), 2)
}

function scorePeaks(peaks: ProcessedPoint[]) {
  const intervals = intervalsFromPeaks(peaks)
  if (intervals.length < 2) {
    return 0
  }
  const mean = average(intervals)
  const regularity = 1 - stddev(intervals, mean) / mean
  return intervals.length * Math.max(0, regularity)
}

function emptyMetrics(sampleCount: number, status: PulseMetrics['status']): PulseMetrics {
  return {
    bpm: null,
    rmssdMs: null,
    quality: 0,
    sampleCount,
    peakCount: 0,
    intervalsMs: [],
    status,
  }
}

function average(values: number[]) {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length
}

function stddev(values: number[], mean = average(values)) {
  if (values.length < 2) {
    return 0
  }
  const variance = average(values.map((value) => (value - mean) ** 2))
  return Math.sqrt(variance)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function roundTo(value: number, digits: number) {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}
