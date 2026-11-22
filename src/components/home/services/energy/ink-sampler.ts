/*
 * The slow way to get a plate's ink: walk its SVG in the browser and sample every visible stroke and
 * fill (a step of 6 screen px). Used only for a plate with no matching generated data (ink.ts), so a
 * stale or missing ink.generated.json costs time, never correctness. The generated data reproduces
 * this sampler; keep the two in step (scripts/energy/generate-ink.mjs mirrors its element rules).
 */
import type { Ink } from "./ink-core";

const STEP = 6;

export function sampleArtwork(nodes: (HTMLElement | SVGSVGElement | null)[], toLayer: (x: number, y: number) => { x: number; y: number }): Ink[] {
  const out: Ink[] = [];
  nodes.forEach((node, stop) => {
    if (!(node instanceof SVGSVGElement)) return;
    const els = node.querySelectorAll<SVGGeometryElement>("path, line, polyline, polygon, rect, circle, ellipse");
    for (const el of els) {
      if (el.closest("defs, clipPath, mask, pattern, symbol")) continue;
      // The opacity the element settles at (the svg's own reveal is ignored: it is built by the time the wire is seen).
      let alpha = 1;
      let hidden = false;
      for (let a: Element | null = el; a && a !== node; a = a.parentElement) {
        const cs = getComputedStyle(a);
        if (cs.display === "none" || cs.visibility === "hidden") hidden = true;
        alpha *= Number.parseFloat(cs.opacity) || 0;
      }
      const cs = getComputedStyle(el);
      if (hidden) continue;
      const m = el.getScreenCTM();
      if (!m) continue;
      const scale = Math.hypot(m.a, m.b);
      const stroke = cs.stroke !== "none" && Number.parseFloat(cs.strokeOpacity || "1") > 0.05;
      const fill = cs.fill !== "none" && !/rgba\(.*,\s*0\)|transparent/.test(cs.fill) && Number.parseFloat(cs.fillOpacity || "1") > 0.05;
      if (!stroke && !fill) continue;
      const faint = alpha < 0.35 || cs.fill.startsWith("url(") || el.matches(".svc-dots *, [data-faint] *, [data-faint]");
      const half = Math.max(0.75, ((stroke ? Number.parseFloat(cs.strokeWidth) || 1 : 0) * scale) / 2);
      const put = (x: number, y: number, r: number) => {
        const p = new DOMPoint(x, y).matrixTransform(m);
        const q = toLayer(p.x, p.y);
        out.push({ x: q.x, y: q.y, r, stop, faint });
      };
      let length = 0;
      try {
        length = el.getTotalLength();
      } catch {
        continue;
      }
      const n = Math.max(1, Math.ceil((length * scale) / STEP));
      for (let i = 0; i <= n; i++) {
        const p = el.getPointAtLength((length * i) / n);
        put(p.x, p.y, half);
      }
      if (fill) {
        // A filled shape covers its inside: sample its box on a grid, keeping the points inside it.
        const b = el.getBBox();
        const nx = Math.ceil((b.width * scale) / STEP);
        const ny = Math.ceil((b.height * scale) / STEP);
        for (let i = 1; i < nx; i++)
          for (let j = 1; j < ny; j++) {
            const pt = new DOMPoint(b.x + (b.width * i) / nx, b.y + (b.height * j) / ny);
            if (el.isPointInFill(pt)) put(pt.x, pt.y, STEP / 2);
          }
      }
    }
  });
  return out;
}
