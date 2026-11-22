// Visual analysis of a captured wire against what is actually on the page.
// usage: node analyze.mjs <capdir> <variant> <width> [--debug]
// Ink = every pixel that differs from its row's background (text, artwork, rules), taken from the page
// rendered with the wire hidden. Distances are measured from the wire's centreline to the nearest ink.
import { createRequire } from "node:module";
// sharp ships with Next.js (not a direct dependency), so resolve it from Next's own location.
const sharp = createRequire(createRequire(import.meta.url).resolve("next/package.json"))("sharp");
import fs from "node:fs";
import path from "node:path";

export async function analyze(dir, v, w, debug = false) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, `${v}-${w}.json`)));
  const img = sharp(path.join(dir, `${v}-${w}-ink.png`));
  const { data: px, info } = await img.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  // Per-row background: the most common colour of the row (quantised).
  const strong = new Uint8Array(W * H);
  const faint = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    const counts = new Map();
    for (let x = 0; x < W; x += 2) {
      const i = (y * W + x) * 3;
      const k = ((px[i] >> 2) << 12) | ((px[i + 1] >> 2) << 6) | (px[i + 2] >> 2);
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    let best = 0;
    let bk = 0;
    for (const [k, c] of counts) if (c > best) [best, bk] = [c, k];
    const br = ((bk >> 12) & 63) * 4 + 2;
    const bg = ((bk >> 6) & 63) * 4 + 2;
    const bb = (bk & 63) * 4 + 2;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      const d = Math.max(Math.abs(px[i] - br), Math.abs(px[i + 1] - bg), Math.abs(px[i + 2] - bb));
      if (d > 56) strong[y * W + x] = 1;
      else if (d > 14) faint[y * W + x] = 1;
    }
  }
  const dStrong = edt(strong, W, H);
  const dAny = edt(strong.map((s, i) => s | faint[i]), W, H);

  const ox = data.layerX - data.clip.x;
  const oy = data.layerY - data.clip.y;
  const desktop = w >= 640;
  const NEAR = desktop ? 12 : 8; // conflict: closer than this to strong ink
  const HUG = desktop ? 24 : 14; // crowding: running this close for a while
  const ENDS = 14; // the wire may touch its own port's node
  const hops = [];
  const conflicts = [];
  data.wire.segments.forEach((s, k) => {
    // Resample the hop at 1px.
    const pts = [];
    for (let i = 1; i < s.points.length; i++) {
      const a = s.points[i - 1];
      const b = s.points[i];
      const n = Math.max(1, Math.ceil(b.at - a.at));
      for (let j = i === 1 ? 0 : 1; j <= n; j++) {
        const t = j / n;
        pts.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, at: a.at + (b.at - a.at) * t });
      }
    }
    const L = s.length;
    let min = Infinity;
    let minAt = null;
    let hug = 0;
    let run = null;
    const dist = (p, f) => {
      const x = Math.round(p.x + ox);
      const y = Math.round(p.y + oy);
      if (x < 0 || y < 0 || x >= W || y >= H) return 99;
      return Math.sqrt(f[y * W + x]);
    };
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (p.at < ENDS || p.at > L - ENDS) continue;
      const d = dist(p, dStrong);
      if (d < min) [min, minAt] = [d, p];
      if (d < HUG && p.at > 30 && p.at < L - 30) hug += i ? p.at - pts[i - 1].at : 0;
      if (d < NEAR) {
        if (!run) run = { hop: k, from: p.at, to: p.at, min: d, at: p };
        run.to = p.at;
        if (d < run.min) [run.min, run.at] = [d, p];
      } else if (run) {
        conflicts.push(run);
        run = null;
      }
    }
    if (run) conflicts.push(run);
    // Turns: stretches where the heading changes (over 10px windows), merged across short gaps.
    let turns = 0;
    let reversals = 0;
    let lastSide = 0;
    let lateral = 0;
    let deco = 0;
    let lastCurve = -1e9;
    const W10 = 10;
    for (let i = W10; i < pts.length - W10; i += 2) {
      const a = pts[i - W10];
      const b = pts[i];
      const c = pts[i + W10];
      let dh = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(b.y - a.y, b.x - a.x);
      while (dh > Math.PI) dh -= 2 * Math.PI;
      while (dh < -Math.PI) dh += 2 * Math.PI;
      if (Math.abs(dh) > 0.012) {
        if (pts[i].at - lastCurve > 14) turns++;
        lastCurve = pts[i].at;
      }
      const dx = c.x - b.x;
      if (Math.abs(dx) > 2) {
        const side = Math.sign(dx);
        if (lastSide && side !== lastSide) reversals++;
        lastSide = side;
      }
    }
    for (let i = 1; i < pts.length; i++) {
      lateral += Math.abs(pts[i].x - pts[i - 1].x);
      const p = pts[i];
      if (p.at > ENDS && p.at < L - ENDS && dist(p, dAny) <= 7 && dist(p, dStrong) >= NEAR) deco += p.at - pts[i - 1].at;
    }
    hops.push({ hop: k, length: Math.round(L), min: +min.toFixed(1), minAt, hug: Math.round(hug), turns, reversals, lateral: Math.round(lateral), deco: Math.round(deco) });
  });
  const result = { variant: v, width: w, hops, conflicts: conflicts.map((c) => ({ ...c, len: Math.round(c.to - c.from), min: +c.min.toFixed(1) })) };
  if (debug) await overlay(dir, v, w, data, conflicts, ox, oy);
  return result;
}

/** Squared Euclidean distance transform (Felzenszwalb) of a binary mask: distance to the nearest 1. */
function edt(mask, W, H) {
  const INF = 1e12;
  const f = new Float64Array(W * H);
  for (let i = 0; i < W * H; i++) f[i] = mask[i] ? 0 : INF;
  const one = (get, set, n) => {
    const d = new Float64Array(n);
    const v = new Int32Array(n);
    const z = new Float64Array(n + 1);
    const g = new Float64Array(n);
    for (let q = 0; q < n; q++) g[q] = get(q);
    let k = 0;
    v[0] = 0;
    z[0] = -INF;
    z[1] = INF;
    for (let q = 1; q < n; q++) {
      let s = (g[q] + q * q - (g[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) {
        k--;
        s = (g[q] + q * q - (g[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      }
      k++;
      v[k] = q;
      z[k] = s;
      z[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < n; q++) {
      while (z[k + 1] < q) k++;
      d[q] = (q - v[k]) * (q - v[k]) + g[v[k]];
    }
    for (let q = 0; q < n; q++) set(q, d[q]);
  };
  for (let x = 0; x < W; x++) one((y) => f[y * W + x], (y, val) => (f[y * W + x] = val), H);
  for (let y = 0; y < H; y++) one((x) => f[y * W + x], (x, val) => (f[y * W + x] = val), W);
  return f;
}

async function overlay(dir, v, w, data, conflicts, ox, oy) {
  const { clip } = data;
  const meta = await sharp(path.join(dir, `${v}-${w}-ink.png`)).metadata();
  const W = meta.width;
  const H = meta.height;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`;
  // Sampled artwork (blue: drawing, grey: decoration)
  for (const a of data.art) {
    if (a.faint) continue;
    svg += `<circle cx="${(a.x + ox).toFixed(1)}" cy="${(a.y + oy).toFixed(1)}" r="${Math.max(1, a.r).toFixed(1)}" fill="#1e6bff" fill-opacity="0.35"/>`;
  }
  for (const b of data.text) svg += `<rect x="${b.x0 + ox}" y="${b.y0 + oy}" width="${b.x1 - b.x0}" height="${b.y1 - b.y0}" fill="none" stroke="#0a0" stroke-width="1"/>`;
  for (const s of data.stops) for (const b of s.keepout) svg += `<rect x="${b.x0 + ox}" y="${b.y0 + oy}" width="${b.x1 - b.x0}" height="${b.y1 - b.y0}" fill="none" stroke="#f0a" stroke-dasharray="4 3" stroke-width="1"/>`;
  for (const s of data.wire.segments) svg += `<path d="${s.d}" transform="translate(${ox} ${oy})" fill="none" stroke="#e00" stroke-width="1.5"/>`;
  for (const c of conflicts) svg += `<circle cx="${c.at.x + ox}" cy="${c.at.y + oy}" r="16" fill="none" stroke="#f60" stroke-width="3"/>`;
  svg += "</svg>";
  await sharp(path.join(dir, `${v}-${w}-ink.png`))
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toFile(path.join(dir, `${v}-${w}-debug.png`));
}

if (process.argv[1].endsWith("analyze.mjs")) {
  const [dir, v, w, flag] = process.argv.slice(2);
  const r = await analyze(dir, v, Number(w), flag === "--debug");
  console.log(JSON.stringify(r, (k, val) => (k === "minAt" || k === "at" ? (val && typeof val === "object" ? `${Math.round(val.x)},${Math.round(val.y)}` : val) : val), 1));
}
