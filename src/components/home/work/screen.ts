/*
 * Screen: a screenshot that switches on like a display panel. The image is
 * sampled into a grid of square cells; each cell has a moment at which it
 * lights, mostly left to right (the side the line arrives from) with a ragged,
 * random front, and lights in one step with a brief over-bright blink. Once
 * every cell is lit the crisp image fades in over them, so the resting state
 * is the real screenshot, never a mosaic. Switching off runs the same order
 * backwards, faster, and without the blink.
 *
 * Plain 2D canvas, no dependencies. One Screen per project, each drawing into
 * its own canvas inside its row.
 */

/** Cell size in CSS pixels; coarser on low-power devices, where each cell is a draw call. */
const CELL = typeof navigator !== "undefined" && navigator.hardwareConcurrency <= 4 ? 11 : 8;
/** Progress by which every cell is lit; from here the crisp image fades in. */
const LIT = 0.8;
/** How long (in progress) a newly lit cell blinks brighter than its colour. */
const BLINK = 0.07;
/** Switching off is this much quicker than switching on. */
const OFF_SPEED = 1.8;

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

/** Deterministic hash noise in 0..1, so a project always lights the same way. */
function noise(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

interface Cells {
  cols: number;
  colour: string[];
  /** Progress at which each cell lights, 0..LIT. */
  at: Float32Array;
}

function sample(img: HTMLImageElement, width: number, height: number): Cells {
  const cols = Math.ceil(width / CELL);
  const rows = Math.ceil(height / CELL);
  const probe = document.createElement("canvas");
  probe.width = cols;
  probe.height = rows;
  const ctx = probe.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, cols, rows);
  const pixels = ctx.getImageData(0, 0, cols, rows).data;

  const n = cols * rows;
  const colour: string[] = new Array(n);
  const at = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    colour[i] = `rgb(${pixels[i * 4]},${pixels[i * 4 + 1]},${pixels[i * 4 + 2]})`;
    at[i] = LIT * (0.55 * ((i % cols) / cols) + 0.45 * noise(i, 1));
  }
  return { cols, colour, at };
}

const smooth = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

export class Screen {
  readonly key: string;
  /** 0 is dark, 1 is the crisp image. */
  private progress = 0;
  private target = 0;
  /** Time (ms) still to wait before lighting, while the line draws across to the frame. */
  private wait = 0;
  private img: HTMLImageElement | null = null;
  private cells: Cells | null = null;
  private failed = false;
  private width = 0;
  private height = 0;
  private readonly ctx: CanvasRenderingContext2D | null;
  private readonly dpr = Math.min(2, typeof window === "undefined" ? 1 : window.devicePixelRatio || 1);

  constructor(
    key: string,
    private readonly canvas: HTMLCanvasElement,
    src: string,
  ) {
    this.key = key;
    this.ctx = canvas.getContext("2d");
    loadImage(src)
      .then((img) => {
        this.img = img;
        this.fit();
      })
      .catch(() => {
        this.failed = true;
      });
  }

  /** Sizes the backing store to the canvas's CSS box and (re)samples the cells when that changed. */
  private fit() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    if (!width || !height) return;
    if (width !== this.width || height !== this.height) {
      this.width = width;
      this.height = height;
      this.canvas.width = Math.round(width * this.dpr);
      this.canvas.height = Math.round(height * this.dpr);
      this.cells = null;
    }
    if (this.img && !this.cells) this.cells = sample(this.img, width, height);
  }

  /** Starts lighting after `delay` ms (the line's draw), or at once if it is already partly lit. */
  enter(delay: number) {
    this.fit();
    this.wait = this.progress > 0 ? 0 : delay;
    this.target = 1;
  }

  leave() {
    this.target = 0;
    this.wait = 0;
  }

  /** Moves progress toward the target; returns true while there is still somewhere to go. */
  step(dt: number, duration: number) {
    // Nothing to animate until the image has decoded; keep the loop alive so it starts when it has.
    if (!this.cells) {
      if (this.img) this.fit();
      return !this.failed && this.target === 1;
    }
    if (this.target === 1 && this.wait > 0) {
      this.wait -= dt;
      return true;
    }
    const delta = dt / duration;
    if (this.progress < this.target) this.progress = Math.min(this.target, this.progress + delta);
    else if (this.progress > this.target) this.progress = Math.max(this.target, this.progress - delta * OFF_SPEED);
    return this.progress !== this.target;
  }

  /** Redraws the frame; returns whether anything is showing. */
  draw(reduced: boolean) {
    const { ctx, img, cells, width, height } = this;
    if (!ctx) return false;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const p = this.progress;
    if (!img || !cells || p <= 0) return false;

    if (reduced) {
      ctx.globalAlpha = p;
      ctx.drawImage(img, 0, 0, width, height);
      ctx.globalAlpha = 1;
      return true;
    }

    const crisp = smooth(LIT, 1, p);
    if (crisp < 1) {
      const { cols, colour, at } = cells;
      const switchingOn = this.target === 1;
      for (let i = 0, n = at.length; i < n; i++) {
        const age = p - at[i];
        if (age < 0) continue;
        const x = (i % cols) * CELL;
        const y = ((i / cols) | 0) * CELL;
        ctx.fillStyle = colour[i];
        ctx.fillRect(x, y, CELL, CELL);
        if (switchingOn && age < BLINK) {
          ctx.globalAlpha = 0.45 * (1 - age / BLINK);
          ctx.fillStyle = "#fff";
          ctx.fillRect(x, y, CELL, CELL);
          ctx.globalAlpha = 1;
        }
      }
    }
    if (crisp > 0) {
      ctx.globalAlpha = crisp;
      ctx.drawImage(img, 0, 0, width, height);
      ctx.globalAlpha = 1;
    }
    return true;
  }
}
