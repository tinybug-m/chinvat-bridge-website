// usage: node browser-bench.mjs <ink.json> <baseUrl>
// Times, in the page, the browser's own sampling (ink.ts, the step-6 build) against inkFromData() on the same nodes.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import { stripTypeScriptTypes } from "node:module";
const [inkPath, base] = process.argv.slice(2);
const data = JSON.parse(fs.readFileSync(inkPath));
const strip = (f) => stripTypeScriptTypes(fs.readFileSync(new URL(f, import.meta.url), "utf8")).replace(/^import .*$/gm, "").replace(/\bexport (?=(const|function|\{))/g, "").replace(/^export \{[^}]*\};?$/gm, "");
const js = strip("./ink-signature.ts") + "\n" + strip("./inkdata.ts") + "\nreturn inkFromData;";
const b = await chromium.launch();
const rows = [];
for (const w of [1440, 1280, 1024, 768, 430, 390, 360]) {
  const c = await b.newContext({ viewport: { width: w, height: w < 640 ? 844 : w < 1024 ? 1024 : 900 }, reducedMotion: "reduce" });
  const p = await c.newPage();
  await p.goto(`${base}/?wire=next`, { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__energy);
  await p.waitForTimeout(1500);
  const r = await p.evaluate(({ js, data }) => {
    const inkFromData = new Function(js)();
    const nodes = [...document.querySelectorAll("[data-energy-ports]")];
    const ident = (x, y) => ({ x, y });
    const med = (a) => a.slice().sort((x, y) => x - y)[a.length >> 1];
    const times = [];
    let res;
    for (let i = 0; i < 25; i++) { const t = performance.now(); res = inkFromData(nodes, ident, data); times.push(performance.now() - t); }
    // First call (cold) is the one a page load pays.
    return { cold: times[0], median: med(times.slice(1)), n: res.ink.length, missing: res.missing, browserMs: window.__energy.artMs, browserN: window.__energy.art.length };
  }, { js, data });
  rows.push({ w, browserSamplingMs: +r.browserMs.toFixed(0), dataColdMs: +r.cold.toFixed(1), dataMedianMs: +r.median.toFixed(1), points: r.n, browserPoints: r.browserN, missingPlates: r.missing.length });
  await c.close();
}
await b.close();
console.table(rows);
