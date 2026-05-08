import type { RegionOfInterest, SignalSample } from "./types";

const SAMPLE_WIDTH = 96;
const SAMPLE_HEIGHT = 72;

export class VideoFrameSampler {
  private readonly canvas = document.createElement("canvas");
  private readonly context: CanvasRenderingContext2D;

  constructor() {
    const context = this.canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("Canvas 2D context is unavailable");
    }
    this.context = context;
    this.canvas.width = SAMPLE_WIDTH;
    this.canvas.height = SAMPLE_HEIGHT;
  }

  sample(
    video: HTMLVideoElement,
    roi: RegionOfInterest,
    timeMs = performance.now(),
  ): SignalSample | null {
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }

    this.context.drawImage(
      video,
      roi.x * video.videoWidth,
      roi.y * video.videoHeight,
      roi.width * video.videoWidth,
      roi.height * video.videoHeight,
      0,
      0,
      SAMPLE_WIDTH,
      SAMPLE_HEIGHT,
    );

    const pixels = this.context.getImageData(
      0,
      0,
      SAMPLE_WIDTH,
      SAMPLE_HEIGHT,
    ).data;
    let red = 0;
    let green = 0;
    let blue = 0;
    let count = 0;

    for (let index = 0; index < pixels.length; index += 4) {
      red += pixels[index];
      green += pixels[index + 1];
      blue += pixels[index + 2];
      count += 1;
    }

    red /= count;
    green /= count;
    blue /= count;

    return {
      timeMs,
      red,
      green,
      blue,
      brightness: (red + green + blue) / 3,
    };
  }
}

export function defaultFaceRoi(): RegionOfInterest {
  return {
    x: 0.29,
    y: 0.16,
    width: 0.42,
    height: 0.34,
  };
}
