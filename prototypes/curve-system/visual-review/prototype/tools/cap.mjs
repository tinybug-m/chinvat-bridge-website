// Capture: for each variant and width, the full wire (reduced motion), the page with the wire hidden
// (for ink analysis), the router's data, and mid-scroll frames with motion on.
// usage: node cap.mjs <outdir> <variants,comma> [widths,comma] [--no-live]
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const [out, vs, ws, flag] = process.argv.slice(2);
const variants = vs.split(",");
const widths = (ws ?? "1440,1280,1024,768,430,390,360").split(",").map(Number);
const live = flag !== "--no-live";
const BASE = process.env.BASE ?? "http://localhost:3400";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const heightFor = (w) => (w < 640 ? 844 : w < 1024 ? 1024 : 900);

async function settle(page) {
  await page.waitForFunction(() => window.__energy, null, { timeout: 30000 });
  // Scroll the page through so lazy content lays out, then wait for the wire to stop re-routing.
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  let last = "";
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(250);
    const now = await page.evaluate(() => window.__energy.wire.segments.map((s) => s.d).join("|"));
    if (now === last) break;
    last = now;
  }
}

for (const w of widths) {
  for (const v of variants) {
    const vh = heightFor(w);
    if (!process.env.LIVE_ONLY) {
      const ctx = await browser.newContext({ viewport: { width: w, height: vh }, reducedMotion: "reduce", deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      await page.goto(`${BASE}/?wire=${v}`, { waitUntil: "networkidle" });
      await settle(page);
      const data = await page.evaluate(() => {
        const layer = document.querySelector(".energy");
        const r = layer.getBoundingClientRect();
        const e = window.__energy;
        return { ...e, layerX: r.left + scrollX, layerY: r.top + scrollY, vh: innerHeight, pageH: document.documentElement.scrollHeight };
      });
      // Crop: from the hero origin to the end of the wire.
      const y0 = Math.max(0, data.layerY + data.origin.y - 140);
      const yEnd = data.layerY + Math.max(...data.wire.segments.flatMap((s) => s.points.map((p) => p.y))) + 260;
      const clip = { x: 0, y: y0, width: w, height: Math.min(data.pageH, yEnd) - y0 };
      data.clip = clip;
      fs.writeFileSync(path.join(out, `${v}-${w}.json`), JSON.stringify(data));
      await page.screenshot({ path: path.join(out, `${v}-${w}-wire.png`), fullPage: true, clip });
      await page.addStyleTag({ content: ".energy{visibility:hidden!important}" });
      await page.waitForTimeout(100);
      await page.screenshot({ path: path.join(out, `${v}-${w}-ink.png`), fullPage: true, clip });
      await ctx.close();
    }
    if (!live) continue;
    const only = process.env.HOPS ? process.env.HOPS.split(",").map(Number) : null;
    {
      const ctx = await browser.newContext({ viewport: { width: w, height: vh }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      await page.goto(`${BASE}/?wire=${v}`, { waitUntil: "networkidle" });
      await settle(page);
      const { keys, layerY, n } = await page.evaluate(() => {
        const r = document.querySelector(".energy").getBoundingClientRect();
        return { keys: window.__energy.wire.keys, layerY: r.top + scrollY, n: window.__energy.wire.segments.length };
      });
      for (let i = 0; i < n; i++) {
        if (only && !only.includes(i)) continue;
        // Head two thirds of the way along hop i.
        const a = keys[2 * i];
        const b = keys[2 * i + 1];
        const y = a.y + (b.y - a.y) * 0.66;
        const top = Math.max(0, layerY + y - 0.76 * vh);
        // Approach from above, as a reader would, so every plate before it is powered.
        await page.evaluate((t) => window.scrollTo(0, t - 300), top);
        await page.waitForTimeout(400);
        await page.evaluate((t) => window.scrollTo(0, t), top);
        await page.waitForTimeout(1600);
        await page.screenshot({ path: path.join(out, `${v}-${w}-live-${i}.png`) });
      }
      await ctx.close();
    }
  }
  console.log("done", w);
}
await browser.close();
