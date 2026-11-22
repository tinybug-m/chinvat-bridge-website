// Browser ground truth: window.__energy.art (the step-6 browser sampling) and each plate's screen matrix, at 7 widths.
import { chromium } from "/home/tinybug/Documents/project/artin/chinvat-bridge-website/node_modules/@playwright/test/index.mjs";
import fs from "node:fs";
import { stripTypeScriptTypes } from "node:module";
const sigJs = stripTypeScriptTypes(fs.readFileSync(new URL("./ink-signature.ts", import.meta.url), "utf8")).replace(/export /g, "");
const b = await chromium.launch();
for (const w of [1440, 1280, 1024, 768, 430, 390, 360]) {
  const c = await b.newContext({ viewport: { width: w, height: w < 640 ? 844 : w < 1024 ? 1024 : 900 }, reducedMotion: "reduce" });
  const p = await c.newPage();
  await p.goto("http://localhost:3400/?wire=next", { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__energy);
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(50); }
  await p.evaluate(() => scrollTo(0, 0));
  let last = "";
  for (let i = 0; i < 30; i++) { await p.waitForTimeout(250); const n = await p.evaluate(() => JSON.stringify(window.__energy.art.length) + window.__energy.wire.segments.map((s) => s.d).join("|")); if (n === last) break; last = n; }
  const out = await p.evaluate((sigJs) => {
    const signature = new Function(`${sigJs}; return signature;`)();
    const nodes = [...document.querySelectorAll("[data-energy-ports]")];
    return { art: window.__energy.art, artMs: window.__energy.artMs, plates: nodes.map((n, stop) => { if (!(n instanceof SVGSVGElement)) return null; const m = n.getScreenCTM(); return { stop, sig: signature(n), m: [m.a, m.b, m.c, m.d, m.e, m.f] }; }).filter(Boolean) };
  }, sigJs);
  fs.writeFileSync(`cap/art-${w}.json`, JSON.stringify(out));
  console.log(w, out.art.length, out.artMs.toFixed(0));
  await c.close();
}
await b.close();
