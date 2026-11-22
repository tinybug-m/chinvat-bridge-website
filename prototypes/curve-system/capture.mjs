// Captures the energy wire's routing inputs and its current output from the
// running homepage, at four viewport sizes, for the curve-system prototype.
// It mirrors measure() in src/components/home/services/energy/EnergyFlow.tsx
// (read-only: it changes nothing on the page).
//
//   node prototypes/curve-system/capture.mjs [base-url]
//
// Writes prototypes/curve-system/layouts.js (window.LAYOUTS = {...}).
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = process.argv[2] ?? "http://localhost:3000";
const SIZES = [
  [1440, 900],
  [1024, 1366],
  [768, 1024],
  [390, 844],
];

function measureInPage() {
  const LINE = 0.76;
  const PORT_MAX = 0.94;
  const section = document.querySelector("#services");
  const layer = document.querySelector(".energy");
  const nodes = [...document.querySelectorAll("[data-energy-ports]")];
  const sr = section.getBoundingClientRect();
  const marker = document.querySelector("[data-energy-origin]");
  const mr = marker.getBoundingClientRect();
  const originY = mr.bottom - sr.top;
  const top = Math.min(0, originY - 24);
  const toLayer = (x, y) => ({ x: x - sr.left, y: y - sr.top - top });
  const origin = toLayer(mr.left + mr.width / 2, mr.bottom);
  const vh = window.innerHeight;
  const gutter = document.querySelector("#services .px-gutter");
  const margin = gutter.getBoundingClientRect().left - sr.left + Number.parseFloat(getComputedStyle(gutter).paddingLeft);
  const lane = Math.round(margin / 2);
  const box = (r) => {
    const a = toLayer(r.left, r.top);
    const b = toLayer(r.right, r.bottom);
    return { x0: a.x, y0: a.y, x1: b.x, y1: b.y };
  };
  const textBox = (el) => {
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    let bx = null;
    for (let node = walk.nextNode(); node; node = walk.nextNode()) {
      if (!node.textContent?.trim() || node.parentElement?.closest(".sr-only")) continue;
      range.selectNodeContents(node);
      const r = range.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      bx = bx
        ? { left: Math.min(bx.left, r.left), right: Math.max(bx.right, r.right), top: Math.min(bx.top, r.top), bottom: Math.max(bx.bottom, r.bottom) }
        : { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    }
    return bx;
  };
  const tight = (el) => {
    const b = (el.matches("a, button") ? null : textBox(el)) ?? el.getBoundingClientRect();
    const reveal = el.closest("[data-reveal]");
    const shift = reveal ? Number.parseFloat(getComputedStyle(reveal).translate.split(" ")[1] ?? "0") || 0 : 0;
    return { left: b.left, right: b.right, top: b.top - shift, bottom: b.bottom - shift };
  };
  const TEXT = ":is(h1, h2, h3, p, a, button, [data-energy-text]):not(svg *)";
  const last = nodes[nodes.length - 1].getBoundingClientRect().bottom;
  const text = [...document.querySelectorAll(`[data-hero] ${TEXT}, section ${TEXT}`)]
    .map(tight)
    .filter((r) => r.right > r.left && r.bottom > r.top && r.top < last + vh && r.bottom > mr.top - vh)
    .map(box);
  const stops = nodes.map((node) => {
    const ports = JSON.parse(node.dataset.energyPorts);
    const r = node.getBoundingClientRect();
    let at;
    if (node instanceof SVGSVGElement) {
      const vb = node.viewBox.baseVal;
      at = (x, y) => {
        const p = toLayer(r.left + ((x - vb.x) * r.width) / vb.width, r.top + ((y - vb.y) * r.height) / vb.height);
        return { x: Math.min(sr.width - lane, Math.max(lane, p.x)), y: p.y };
      };
    } else {
      const lo = Math.max(lane, toLayer(r.left + 4, 0).x);
      const hi = Math.min(sr.width - lane, toLayer(r.right - 4, 0).x);
      at = (x, y) => {
        const p = toLayer(r.left + x * r.width, r.top + y * r.height);
        return { x: Math.min(hi, Math.max(lo, p.x)), y: p.y };
      };
    }
    const port = (p) => ({ ...p, ...at(p.x, p.y) });
    const boxes = typeof ports.keepout[0] === "number" ? [ports.keepout] : ports.keepout;
    const fr = box(r);
    return {
      ins: ports.ins.map(port),
      outs: ports.outs.map(port),
      keepout: boxes.map(([x0, y0, x1, y1]) => {
        const a = at(x0, y0);
        const b = at(x1, y1);
        return { x0: a.x, y0: a.y, x1: b.x, y1: b.y };
      }),
      frame: fr,
      kind: node instanceof SVGSVGElement ? (node.closest(".method-plate") ? "method" : "service") : "bridge",
    };
  });
  const content = gutter.getBoundingClientRect();
  const padL = Number.parseFloat(getComputedStyle(gutter).paddingLeft);
  const padR = Number.parseFloat(getComputedStyle(gutter).paddingRight);
  const lr = layer.getBoundingClientRect();
  return {
    width: sr.width,
    viewport: [window.innerWidth, vh],
    top,
    lane,
    reach: (PORT_MAX - LINE) * vh,
    below: (1 - LINE) * vh,
    origin,
    stops,
    text,
    content: { x0: content.left - sr.left + padL, x1: content.right - sr.left - padR },
    current: [...layer.querySelectorAll(".energy-wire")].map((p) => p.getAttribute("d")),
    layerOffset: lr.top - sr.top - top,
  };
}

const browser = await chromium.launch({ args: ["--disable-webgl", "--disable-3d-apis"] });
const out = {};
for (const [w, h] of SIZES) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForSelector(".energy-wire", { timeout: 60000 });
  await page.waitForTimeout(1500);
  out[w] = await page.evaluate(measureInPage);
  await page.close();
}
await browser.close();
const file = fileURLToPath(new URL("./layouts.js", import.meta.url));
writeFileSync(file, `// Captured ${new Date().toISOString().slice(0, 10)} by capture.mjs. Layer pixels.\nwindow.LAYOUTS = ${JSON.stringify(out)};\n`);
console.log(Object.entries(out).map(([w, d]) => `${w}: ${d.stops.length} stops, ${d.text.length} text boxes, ${d.current.length} segments`).join("\n"));
