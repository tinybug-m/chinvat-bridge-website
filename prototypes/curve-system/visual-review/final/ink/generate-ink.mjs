// usage: node generate-ink.mjs <baseUrl> <out.json> <repoRoot>
// Needs the site running at <baseUrl> (pnpm dev or next start) and Playwright's Chromium.
// Samples the static plate artwork once, in a browser, into ink data in SVG units (see inkdata.ts).
import { chromium } from "@playwright/test";
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
const [base, out, root = process.cwd()] = process.argv.slice(2);
// The files the plate artwork and its styles come from. The unit test fails when any of them changes after generation.
const SOURCES = [
  "src/components/home/services/crops.ts", "src/components/home/services/diagrams.tsx", "src/components/home/services/diagrams.css",
  "src/components/home/services/PlateDiagram.tsx", "src/components/home/services/PlateLoop.tsx", "src/components/home/services/ServicePlate.tsx",
  "src/components/home/services/services.css", "src/components/home/services/loop.css", "src/components/home/services/loop-ai.css",
  "src/components/home/services/loop-morph.css", "src/components/home/services/explore.css", "src/components/home/services/current.css",
  "src/components/home/services/current.ts", "src/components/home/method/MethodDiagrams.tsx", "src/components/home/method/stonePlates.ts",
  "src/components/home/method/method.css",
];
const sources = {};
for (const f of SOURCES) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) { console.error(`artwork source missing: ${f}. Update SOURCES in generate-ink.mjs`); process.exit(1); }
  sources[f] = crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
}
import { stripTypeScriptTypes } from "node:module";
const sigJs = stripTypeScriptTypes(fs.readFileSync(new URL("./ink-signature.ts", import.meta.url), "utf8")).replace(/export /g, "");
const D = 0.2; // dense step in SVG units
const TOL = 0.06; // simplification tolerance in SVG units
const browser = await chromium.launch();
async function plates(width) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("svg[data-energy-ports]", { state: "attached" });
  await page.waitForTimeout(800);
  const raw = await page.evaluate(({ D, sigJs }) => {
    const signature = new Function(`${sigJs}; return signature;`)();
    const ELEMENTS = "path, line, polyline, polygon, rect, circle, ellipse";
    return [...document.querySelectorAll("svg[data-energy-ports]")].map((svg) => {
      const elements = [];
      for (const el of svg.querySelectorAll(ELEMENTS)) {
        if (el.closest("defs, clipPath, mask, pattern, symbol")) continue;
        let alpha = 1, hidden = false;
        for (let a = el; a && a !== svg; a = a.parentElement) {
          const cs = getComputedStyle(a);
          if (cs.display === "none" || cs.visibility === "hidden") hidden = true;
          alpha *= Number.parseFloat(cs.opacity) || 0;
        }
        const cs = getComputedStyle(el);
        if (hidden) continue;
        if (!el.getScreenCTM()) continue;
        const stroke = cs.stroke !== "none" && Number.parseFloat(cs.strokeOpacity || "1") > 0.05;
        const fill = cs.fill !== "none" && !/rgba\(.*,\s*0\)|transparent/.test(cs.fill) && Number.parseFloat(cs.fillOpacity || "1") > 0.05;
        if (!stroke && !fill) continue;
        const faint = alpha < 0.35 || cs.fill.startsWith("url(") || el.matches(".svc-dots *, [data-faint] *, [data-faint]");
        let len = 0;
        try { len = el.getTotalLength(); } catch { continue; }
        const m = Math.max(1, Math.ceil(len / D));
        const pts = [];
        for (let k = 0; k <= m; k++) { const s = (len * k) / m; const p = el.getPointAtLength(s); pts.push([s, p.x, p.y]); }
        const bb = el.getBBox();
        elements.push({ sw: stroke ? Number.parseFloat(cs.strokeWidth) || 1 : 0, fill, faint, len, bb: [bb.x, bb.y, bb.width, bb.height], pts, eo: cs.fillRule === "evenodd" });
      }
      return { sig: signature(svg), elements };
    });
  }, { D, sigJs });
  await ctx.close();
  return raw;
}
const r4 = (v) => Math.round(v * 1e4) / 1e4;
function simplify(pts) {
  // Split where the outline jumps (a new subpath), then drop vertices that lie on a straight, evenly measured run.
  const subs = [[pts[0]]];
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]);
    if (d > D * 1.5 + 0.01) subs.push([pts[i]]); else subs.at(-1).push(pts[i]);
  }
  return subs.map((sub) => {
    const keep = [0];
    let a = 0;
    for (let c = 1; c < sub.length; c++) {
      let ok = true;
      const [sa, xa, ya] = sub[a], [sc, xc, yc] = sub[c];
      const L = Math.hypot(xc - xa, yc - ya);
      if (Math.abs(sc - sa - L) > TOL) ok = false;
      for (let b = a + 1; ok && b < c; b++) {
        const [sb, xb, yb] = sub[b];
        const u = L ? (sb - sa) / (sc - sa) : 0;
        if (Math.hypot(xa + (xc - xa) * u - xb, ya + (yc - ya) * u - yb) > TOL) ok = false;
      }
      if (!ok) { keep.push(c - 1); a = c - 1; if (a === keep.at(-2)) { keep.push(c); a = c; } }
    }
    if (keep.at(-1) !== sub.length - 1) keep.push(sub.length - 1);
    return [...new Set(keep)].flatMap((i) => [r4(sub[i][0]), r4(sub[i][1]), r4(sub[i][2])]);
  });
}
const a = await plates(1440);
const b = await plates(390);
await browser.close();
const stable = JSON.stringify(a.map((p) => [p.sig, p.elements.map((e) => [e.sw, e.fill, e.faint, r4(e.len), e.bb.map(r4)])])) === JSON.stringify(b.map((p) => [p.sig, p.elements.map((e) => [e.sw, e.fill, e.faint, r4(e.len), e.bb.map(r4)])]));
if (!stable) { console.error("artwork differs between 1440 and 390 px: its style is not width independent; the data cannot be shared"); process.exit(1); }
const data = {
  version: 1, step: 6, sources,
  plates: a.map((p) => ({ sig: p.sig, elements: p.elements.map((e) => ({ sw: r4(e.sw), fill: e.fill, faint: e.faint, len: r4(e.len), bb: e.bb.map(r4), sp: simplify(e.pts), ...(e.eo ? { eo: true } : {}) })) })),
};
fs.writeFileSync(out, JSON.stringify(data));
const n = data.plates.reduce((s, p) => s + p.elements.length, 0);
const v = data.plates.reduce((s, p) => s + p.elements.reduce((t, e) => t + e.sp.reduce((u, q) => u + q.length / 3, 0), 0), 0);
console.log("plates", data.plates.length, "elements", n, "vertices", v, "bytes", fs.statSync(out).size);
