import "./current.css";

/** Where a loop holds its END pose (PlateLoop.tsx). */
const END = 0.8;
/** Extra start per step outward from the seam, and the cap, in seconds. */
const STEP_S = 0.05;
const MAX_S = 0.35;
/**
 * The activation wave of a plate the energy wire reached (aimPlate): seconds
 * of the plate's clock per board unit from the port, so it crosses a 400
 * unit board in 1.6s (1s at the once rate, PlateLoop).
 */
const WAVE_S = 0.004;
/** A plate the energy wire reveals plays its one story this much faster (PlateLoop), so it builds while the energy is there. */
export const ONCE_RATE = 2;
/** Where that story starts: just before the nodes leave START (every plate's START holds 0 - 14%). */
export const ONCE_FROM = 0.12;
/** Where the plate reads as built behind the activation front: its faces have turned solid (34 - 46%). */
const FRONT = 0.4;
/** Length of the travelling pulse: a share of its line, capped (board units). */
const PULSE_SHARE = 0.4;
const PULSE_MAX = 46;

/**
 * Lays a pulse over every solid line a plate shows once built, so a current
 * runs through the diagram's own lines as it switches on (current.css). The
 * pulses are clones placed right after their line, so they move with the
 * same groups, and they carry .loop so PlateLoop pauses, settles and
 * replays them with the rest of the plate.
 *
 * Which lines: the figure is sampled in its END pose (every loop seeked to
 * its END hold and back), keeping lines and outlines (paths, boxes) that are visible
 * there, solid (not dashed) and inked (not a paper knockout). Returns a
 * cleanup that removes the clones.
 */
export function wireCurrent(fig: HTMLElement): () => void {
  const svg = fig.querySelector("svg");
  if (!svg) return () => {};

  const lines = inEndPose(fig, () =>
    [...svg.querySelectorAll<SVGGeometryElement>("line, path, polyline, rect")].filter((el) => {
      const s = getComputedStyle(el);
      // A shape filled in its own stroke colour is a solid block: it has no line to run along.
      if (s.stroke === "none" || s.strokeDasharray !== "none" || s.fill === s.stroke) return false;
      if (el.getAttribute("stroke")?.includes("paper")) return false;
      let shown = 1;
      for (let n: Element | null = el; n && n !== svg; n = n.parentElement)
        shown *= Number(getComputedStyle(n).opacity);
      return shown > 0.3 && el.getTotalLength() > 8;
    }),
  );

  const pulses = lines.map((line) => {
    const len = line.getTotalLength();
    const seg = Math.min(PULSE_MAX, len * PULSE_SHARE);
    const start = line.getPointAtLength(0);
    const end = line.getPointAtLength(len);
    const fromSeam = Math.min(Math.abs(start.x - 200), Math.abs(end.x - 200));

    const pulse = line.cloneNode() as SVGGeometryElement;
    pulse.removeAttribute("style");
    pulse.removeAttribute("opacity");
    pulse.removeAttribute("fill");
    pulse.setAttribute("class", "svc-current loop");
    pulse.setAttribute("aria-hidden", "true");
    pulse.style.setProperty("--len", `${len}px`);
    pulse.style.setProperty("--seg", `${seg}px`);
    pulse.style.setProperty("--loop-d", `${Math.min(MAX_S, Math.round(fromSeam / 40) * STEP_S)}s`);
    line.after(pulse);
    return pulse;
  });

  return () => pulses.forEach((p) => p.remove());
}

/** Runs `read` with every loop of the figure seeked to its END hold, then puts them back. */
function inEndPose<T>(fig: HTMLElement, read: () => T): T {
  const loops = fig
    .getAnimations({ subtree: true })
    .filter((a) => !!(a.effect as KeyframeEffect | null)?.target?.classList.contains("loop"));
  const was = loops.map((a) => a.currentTime);
  for (const a of loops) {
    const { delay = 0, duration } = a.effect!.getTiming();
    a.currentTime = delay + END * Number(duration);
  }
  const result = read();
  loops.forEach((a, i) => (a.currentTime = was[i]));
  return result;
}

/**
 * The energy wire powers a plate from the port it came in by (EnergyFlow):
 * every node of the plate starts its own story when an activation wave from
 * that port reaches it, so the artwork assembles outward from the point the
 * energy touched. The current is the energy itself: on a powered plate it
 * runs ahead of the build (current.css), out from the port along the lines
 * the nodes are settling onto, each pulse from its line's nearer end. A
 * node keeps its authored stagger on top of the wave. Distances are taken in
 * the END pose, where each node lands. Call it before the plate is revealed,
 * so the delays are in place when its story starts.
 *
 * Returns how long (ms) after the reveal the plate reads as built at `exit`,
 * where the energy leaves it, or null for a plate with no story to time.
 */
export function aimPlate(fig: HTMLElement, port: { x: number; y: number }, exit?: { x: number; y: number }) {
  const svg = fig.querySelector("svg");
  const toBoard = svg?.getScreenCTM()?.inverse();
  if (!svg || !toBoard) return null;
  const far = (x: number, y: number) => Math.hypot(x - port.x, y - port.y);
  const wave = (d: number) => `${Math.round(d * WAVE_S * 100) / 100}s`;

  const nodes = inEndPose(fig, () =>
    [...svg.querySelectorAll<SVGGraphicsElement>(".loop:not(.svc-current)")].map((el) => {
      const r = el.getBoundingClientRect();
      const c = new DOMPoint(r.left + r.width / 2, r.top + r.height / 2).matrixTransform(toBoard);
      return { el, d: far(c.x, c.y) };
    }),
  );
  for (const { el, d } of nodes) {
    el.dataset.loopD ??= el.style.getPropertyValue("--loop-d") || "0s";
    el.style.setProperty("--loop-d", `calc(${el.dataset.loopD} + ${wave(d)})`);
  }

  for (const pulse of svg.querySelectorAll<SVGGeometryElement>(".svc-current")) {
    const len = pulse.getTotalLength();
    const a = pulse.getPointAtLength(0);
    const b = pulse.getPointAtLength(len);
    const fromA = far(a.x, a.y);
    const fromB = far(b.x, b.y);
    pulse.style.setProperty("--loop-d", wave(Math.min(fromA, fromB)));
    if (fromB < fromA) {
      pulse.style.setProperty("--from", "calc(-1 * var(--len))");
      pulse.style.setProperty("--to", "var(--seg)");
    }
  }

  const clock = fig
    .getAnimations({ subtree: true })
    .find((a) => !!(a.effect as KeyframeEffect | null)?.target?.classList.contains("loop"));
  if (!clock || !exit) return null;
  const duration = Number(clock.effect!.getTiming().duration);
  return (far(exit.x, exit.y) * WAVE_S * 1000 + (FRONT - ONCE_FROM) * duration) / ONCE_RATE;
}
