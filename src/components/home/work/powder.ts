/*
 * Powder: a screenshot that gathers out of drifting dust, sharpens, and blows
 * away again. The image is sampled into a coarse grid and each cell becomes
 * one grain with its own colour, a scattered start and a delay. Delays run
 * left to right with a ragged front, so the picture is built across the frame
 * the way the mark is built across its seam. Under the grains a soft,
 * low-resolution ghost of the image swims into place, and once the grains
 * have landed the real image fades in over them: the resting state is the
 * crisp screenshot, never a mosaic.
 *
 * Plain 2D canvas, no dependencies. One Powder per project; WorkIndex draws
 * every live one into a single shared canvas each frame.
 */

/** Size of one grain in CSS pixels; coarser on low-power devices, where each grain is a draw call. */
const GRAIN = typeof navigator !== "undefined" && navigator.hardwareConcurrency <= 4 ? 7 : 5;
/** Share of the timeline over which grain start times are spread. */
const SPREAD = 0.5;
/** The ghost is the image drawn at 1/GHOST size and scaled back up, which blurs it in every browser. */
const GHOST = 14;
/** Progress by which every grain has landed; from here the crisp image fades in over them. */
const LANDED = 0.84;

interface Grains {
  cols: number;
  /** Fill style per grain, built once. */
  colour: string[];
  /** Per grain: start delay 0..SPREAD, then arrival and departure offsets in CSS px. */
  delay: Float32Array;
  inX: Float32Array;
  inY: Float32Array;
  outX: Float32Array;
  outY: Float32Array;
}

const images = new Map<string, Promise<HTMLImageElement>>();

/** Loads and decodes a screenshot once; later calls share the same promise. */
export function loadImage(src: string) {
  let pending = images.get(src);
  if (!pending) {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    pending = img.decode().then(() => img);
    images.set(src, pending);
  }
  return pending;
}

/** Deterministic hash noise in 0..1, so a project always crumbles the same way. */
function noise(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function sample(img: HTMLImageElement, width: number, height: number): Grains {
  const cols = Math.ceil(width / GRAIN);
  const rows = Math.ceil(height / GRAIN);
  const probe = document.createElement("canvas");
  probe.width = cols;
  probe.height = rows;
  const ctx = probe.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, cols, rows);
  const pixels = ctx.getImageData(0, 0, cols, rows).data;

  const n = cols * rows;
  const colour: string[] = new Array(n);
  const delay = new Float32Array(n);
  const inX = new Float32Array(n);
  const inY = new Float32Array(n);
  const outX = new Float32Array(n);
  const outY = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    colour[i] = `rgb(${pixels[i * 4]},${pixels[i * 4 + 1]},${pixels[i * 4 + 2]})`;
    delay[i] = Math.min(SPREAD, ((i % cols) / cols) * SPREAD * 0.75 + noise(i, 1) * SPREAD * 0.4);
    // Arrives drifting in from the left; leaves blown to the right and up, like dust off a ledge.
    inX[i] = -30 - noise(i, 2) * 150;
    inY[i] = (noise(i, 3) - 0.5) * 100 - 10;
    outX[i] = 50 + noise(i, 4) * 200;
    outY[i] = -20 - noise(i, 5) * 120;
  }
  return { cols, colour, delay, inX, inY, outX, outY };
}

function blurred(img: HTMLImageElement, width: number, height: number) {
  const small = document.createElement("canvas");
  small.width = Math.max(1, Math.round(width / GHOST));
  small.height = Math.max(1, Math.round(height / GHOST));
  small.getContext("2d")!.drawImage(img, 0, 0, small.width, small.height);
  return small;
}

/**
 * Where the powder front is, as a share of the width: grains left of it have
 * started (arriving) or are still there (leaving). Matches the delay formula in
 * sample(), taking the noise at its mean.
 */
const front = (p: number, leaving: boolean) =>
  leaving ? (SPREAD - 0.2 * SPREAD - p) / (0.75 * SPREAD) : (p - 0.2 * SPREAD) / (0.75 * SPREAD);

const easeOut = (t: number) => 1 - (1 - t) ** 3;
const smooth = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

export class Powder {
  readonly key: string;
  /** 0 is dust (or nothing), 1 is the crisp image. */
  private progress = 0;
  private target = 0;
  /** Picks the departure offsets and runs the front right to left. */
  private leaving = false;
  private img: HTMLImageElement | null = null;
  private ghost: HTMLCanvasElement | null = null;
  private grains: Grains | null = null;
  /** The image failed to load: nothing will ever draw, so nothing should animate. */
  private failed = false;
  /** Scratch canvas for masking the ghost to the front. */
  private layer: HTMLCanvasElement | null = null;

  constructor(
    key: string,
    src: string,
    private readonly width: number,
    private readonly height: number,
  ) {
    this.key = key;
    loadImage(src)
      .then((img) => {
        this.img = img;
        // Sampling builds thousands of grains: do it when the main thread is idle.
        const prepare = () => {
          this.ghost = blurred(img, width, height);
          this.grains = sample(img, width, height);
        };
        if ("requestIdleCallback" in window) requestIdleCallback(prepare, { timeout: 200 });
        else prepare();
      })
      .catch(() => {
        this.failed = true;
      });
  }

  enter() {
    // Caught mid-dissolve, it gathers again from dust rather than running the dissolve backwards
    // (while every grain is still in place, above LANDED, the two directions look the same).
    if (this.leaving && this.progress < LANDED) this.progress = 0;
    this.leaving = false;
    this.target = 1;
  }

  leave() {
    if (this.target === 0) return;
    this.leaving = true;
    this.target = 0;
  }

  /** Moves progress toward the target; returns true while there is still somewhere to go. */
  step(dt: number, duration: number) {
    // Nothing to animate until the image has decoded; keep the loop alive so it starts when it has.
    if (!this.grains) return !this.failed && this.target === 1;
    const delta = dt / duration;
    // Blowing away is quicker than gathering.
    if (this.progress < this.target) this.progress = Math.min(this.target, this.progress + delta);
    else if (this.progress > this.target) this.progress = Math.max(this.target, this.progress - delta * 1.5);
    return this.progress !== this.target;
  }

  /** Draws into a context already scaled to CSS pixels; returns whether anything was drawn. */
  draw(ctx: CanvasRenderingContext2D, reduced: boolean) {
    const { img, ghost, grains, width, height } = this;
    const p = this.progress;
    if (!img || !ghost || !grains || p <= 0) return false;

    if (reduced) {
      ctx.globalAlpha = p;
      ctx.drawImage(img, 0, 0, width, height);
      ctx.globalAlpha = 1;
      return true;
    }

    const crisp = smooth(LANDED, 1, p);

    // The ghost: a soft version of the image that swims in under the grains, only where the powder
    // front has reached (a feathered mask, so the frame's edge never shows), and gives way to the real one.
    const haze = smooth(0.05, 0.6, p) * (1 - crisp) * 0.6;
    if (haze > 0.01) {
      const layer = (this.layer ??= Object.assign(document.createElement("canvas"), { width, height }));
      const lctx = layer.getContext("2d")!;
      lctx.globalCompositeOperation = "source-over";
      lctx.clearRect(0, 0, width, height);
      lctx.imageSmoothingEnabled = true;
      lctx.drawImage(ghost, (1 - p) * (this.leaving ? 24 : -24), 0, width, height);
      const edge = front(p, this.leaving) * width;
      const feather = width * 0.3;
      const mask = lctx.createLinearGradient(edge - feather, 0, edge + feather, 0);
      // Arriving, the ghost is left of the front; leaving, what remains is right of it.
      mask.addColorStop(0, this.leaving ? "rgba(0,0,0,0)" : "#000");
      mask.addColorStop(1, this.leaving ? "#000" : "rgba(0,0,0,0)");
      lctx.globalCompositeOperation = "destination-in";
      lctx.fillStyle = mask;
      lctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = haze;
      ctx.drawImage(layer, 0, 0, width, height);
    }

    if (crisp < 1) {
      const { cols, colour, delay } = grains;
      const offX = this.leaving ? grains.outX : grains.inX;
      const offY = this.leaving ? grains.outY : grains.inY;
      const span = 1 - SPREAD;
      const fade = 1 - crisp;
      for (let i = 0, n = delay.length; i < n; i++) {
        // Leaving runs the same front left to right: the side that formed first is blown off first.
        const t = (p - (this.leaving ? SPREAD - delay[i] : delay[i])) / span;
        if (t <= 0) continue;
        const e = easeOut(t > 1 ? 1 : t);
        // Specks in flight, grown to fill their cell as they land.
        const size = GRAIN * (0.3 + 0.7 * e);
        ctx.globalAlpha = (t > 0.6 ? 1 : t / 0.6) * fade;
        ctx.fillStyle = colour[i];
        ctx.fillRect((i % cols) * GRAIN + offX[i] * (1 - e), ((i / cols) | 0) * GRAIN + offY[i] * (1 - e), size, size);
      }
    }

    if (crisp > 0) {
      ctx.globalAlpha = crisp;
      ctx.drawImage(img, 0, 0, width, height);
    }
    ctx.globalAlpha = 1;
    return true;
  }
}
