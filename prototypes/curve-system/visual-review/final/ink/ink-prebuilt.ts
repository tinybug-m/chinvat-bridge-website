/*
 * PROTOTYPE: the call site for build-time ink. In the prototype EnergyFlow it replaces `artwork(nodes, toLayer)`.
 * A plate with no matching data (new or edited artwork) is sampled the slow way, so a stale file is never silently
 * wrong at run time; the unit test (ink.test.mjs) is what makes a stale file visible at build time.
 */
import { artwork } from "../prototype/ink-step6.ts";
import { inkFromData, type Ink, type InkData } from "./inkdata.ts";

export function artworkPrebuilt(
  nodes: (HTMLElement | SVGSVGElement)[],
  toLayer: (x: number, y: number) => { x: number; y: number },
  data: InkData,
): Ink[] {
  const { ink, missing } = inkFromData(nodes, toLayer, data);
  if (missing.length) {
    console.warn(`energy wire: no generated ink for plate(s) ${missing.join(", ")}; sampling them now. Run the ink generator.`);
    const only = nodes.map((n, i) => (missing.includes(i) ? n : null));
    ink.push(...artwork(only as (HTMLElement | SVGSVGElement)[], toLayer));
  }
  return ink;
}
