/*
 * PROTOTYPE (visual review): the plates' artwork as the eye sees it, not as one box. Every visible
 * stroke and fill of each plate's SVG is sampled into points in the wire layer's pixels, each with
 * the half-width it covers. The router keeps the wire clear of these points.
 */
export interface Ink {
  x: number;
  y: number;
  /** Half the stroke width, or the radius a filled sample covers (px). */
  r: number;
  /** Which stop (index into the stops) the ink belongs to. */
  stop: number;
  /** Decoration the wire may cross (a dot grid), as opposed to the drawing. */
  faint: boolean;
}

const STEP = 6;

export function artwork(nodes: (HTMLElement | SVGSVGElement)[], toLayer: (x: number, y: number) => { x: number; y: number }): Ink[] {
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
