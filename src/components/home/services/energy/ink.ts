/*
 * The plates' artwork ink for the router. The data is generated at build time (ink.generated.json, by
 * scripts/energy/generate-ink.mjs) and loaded lazily, off the main chunk. Anything not covered by it is
 * sampled in the browser instead, so a missing, unreadable or stale file is slower, never wrong:
 *  - the file fails to load or has the wrong shape: every plate is sampled;
 *  - a plate whose markup matches no entry (changed or new artwork): that plate is sampled;
 *  - the unit test (tests/unit/energy-ink.test.mjs) fails when an artwork source changed since generation.
 */
import { inkForPlate, STEP, type Ink, type InkData } from "./ink-core";
import { signature } from "./ink-signature";
import { sampleArtwork } from "./ink-sampler";

export type { Ink };

type ToLayer = (x: number, y: number) => { x: number; y: number };

const usable = (d: unknown): d is InkData => {
  const data = d as InkData | null;
  return !!data && data.version === 1 && data.step === STEP && Array.isArray(data.plates);
};

let loading: Promise<InkData | null> | null = null;

/** Load the generated ink once; resolves null (and says so) if it cannot be had. */
export function loadInk(): Promise<InkData | null> {
  loading ??= import("./ink.generated.json")
    .then((m) => {
      const data: unknown = m.default;
      if (usable(data)) return data;
      console.warn("energy wire: ink.generated.json has an unexpected shape; sampling the artwork in the browser.");
      return null;
    })
    .catch(() => {
      console.warn("energy wire: ink.generated.json could not be loaded; sampling the artwork in the browser.");
      return null;
    });
  return loading;
}

/** Ink for every plate in `nodes` (the stops; non-SVG stops have none), from `data` where it matches, else sampled. */
export function artworkInk(nodes: (HTMLElement | SVGSVGElement)[], toLayer: ToLayer, data: InkData | null): Ink[] {
  const bySig = new Map((data?.plates ?? []).map((p) => [p.sig, p]));
  const ink: Ink[] = [];
  const missing: number[] = [];
  nodes.forEach((node, stop) => {
    if (!(node instanceof SVGSVGElement)) return;
    const plate = bySig.get(signature(node));
    const m = node.getScreenCTM();
    if (plate && m) {
      const before = ink.length;
      try {
        inkForPlate(plate, m, stop, toLayer, STEP, ink);
        return;
      } catch {
        // A malformed entry: drop what it added and sample this plate instead.
        ink.length = before;
      }
    }
    missing.push(stop);
  });
  if (missing.length) {
    if (data) console.warn(`energy wire: no valid generated ink for plate(s) ${missing.join(", ")}; sampling them now. Run \`pnpm energy:ink\`.`);
    const only = nodes.map((n, i) => (missing.includes(i) ? n : null));
    ink.push(...sampleArtwork(only, toLayer));
  }
  return ink;
}
