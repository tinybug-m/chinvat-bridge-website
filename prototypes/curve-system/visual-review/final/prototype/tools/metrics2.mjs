// usage: node metrics2.mjs dir:name:width ...   (dir/name-width.json + dir/name-width-ink.png)
// Route quality from the drawn paths and the real page pixels (not the router's own field).
import { analyze } from "./analyze.mjs";
import fs from "node:fs";
const rows = [];
for (const spec of process.argv.slice(2)) {
  const [dir, v, ws] = spec.split(":");
  const w = Number(ws);
  const d = JSON.parse(fs.readFileSync(`${dir}/${v}-${w}.json`));
  const r = await analyze(dir, v, w, false);
  // Turns from the path: every pair of consecutive cubics is one turn; its deflection is the angle between the
  // tangent it enters with and the tangent it leaves with.
  let t90 = 0, t45 = 0, units = 0, tightest = 99;
  for (const s of d.wire.segments) {
    const cs = [...s.d.matchAll(/([MLC])([^MLC]*)/g)].map((m) => ({ k: m[1], n: m[2].trim().split(/[ ,]+/).map(Number) }));
    let cur = null; const cub = [];
    for (const c of cs) { if (c.k === "M" || c.k === "L") cur = c.n.slice(-2); else { cub.push({ p0: cur, p1: c.n.slice(0, 2), p2: c.n.slice(2, 4), p3: c.n.slice(4, 6) }); cur = c.n.slice(4, 6); } }
    for (let i = 0; i + 1 < cub.length; i += 2) {
      const a = cub[i], b = cub[i + 1];
      const h1 = Math.atan2(a.p1[1] - a.p0[1], a.p1[0] - a.p0[0]);
      const h2 = Math.atan2(b.p3[1] - b.p2[1], b.p3[0] - b.p2[0]);
      let dh = Math.abs(h2 - h1); if (dh > Math.PI) dh = 2 * Math.PI - dh;
      const deg = dh * 180 / Math.PI;
      units += deg / 90;
      if (deg > 67) t90++; else if (deg > 20) t45++;
    }
  }
  // Rails and crossings (as before).
  let side = 0, switches = 0, crossings = 0;
  for (const s of d.wire.segments) {
    const pts = s.points;
    for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; if (Math.abs(a.x - b.x) < 0.5 && Math.abs(b.y - a.y) > 0) { const sd = a.x < d.width * 0.15 ? -1 : a.x > d.width * 0.85 ? 1 : 0; if (sd && side && sd !== side) switches++; if (sd) side = sd; } }
    let run = 0, dir_ = 0; const lat = [];
    for (let i = 1; i < pts.length; i++) { const dx = pts[i].x - pts[i - 1].x; if (Math.abs(dx) < 0.3) continue; const sg = Math.sign(dx); if (sg !== dir_) { if (run) lat.push(run); run = 0; dir_ = sg; } run += dx; }
    if (run) lat.push(run);
    crossings += lat.filter((x) => Math.abs(x) > 0.5 * d.width).length;
  }
  const sum = (k) => r.hops.reduce((a, h) => a + h[k], 0);
  rows.push({ w, v, length: Math.round(sum("length")), turns90: t90, turns45: t45, turnUnits: +units.toFixed(1), nearInk: r.conflicts.length + "/" + r.conflicts.reduce((a, c) => a + c.len, 0) + "px", closest: +Math.min(...r.hops.map((h) => h.min)).toFixed(1), hug: sum("hug"), edgeSwitch: switches, crossings, ms: Math.round(d.ms ?? 0) });
}
console.table(rows);
