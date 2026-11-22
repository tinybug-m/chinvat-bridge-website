// usage: node compare2.mjs <ink.json>
// Order-independent comparison: every browser point must have a data point of the same stop, radius and faintness
// within 0.3 px (and the other way round). Reports the unmatched points and the distance of the matched ones.
import fs from "node:fs";
const { inkForPlate } = await import("./inkdata.ts");
const data = JSON.parse(fs.readFileSync(process.argv[2]));
const bySig = new Map(data.plates.map((p) => [p.sig, p]));
const rows = [];
for (const w of [1440, 1280, 1024, 768, 430, 390, 360]) {
  const cap = JSON.parse(fs.readFileSync(`cap/art-${w}.json`));
  const mine = [];
  for (const p of cap.plates) inkForPlate(bySig.get(p.sig), { a: p.m[0], b: p.m[1], c: p.m[2], d: p.m[3], e: p.m[4], f: p.m[5] }, p.stop, (x, y) => ({ x, y }), data.step, mine);
  // Layer offset from the first plate's first point.
  const ox = cap.art[0].x - mine[0].x, oy = cap.art[0].y - mine[0].y;
  mine.forEach((q) => { q.x += ox; q.y += oy; });
  const grid = (pts) => { const g = new Map(); pts.forEach((q) => { const k = Math.floor(q.x / 2) + "," + Math.floor(q.y / 2); (g.get(k) ?? g.set(k, []).get(k)).push(q); }); return g; };
  const near = (g, q) => { let best = 99; for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (const o of g.get((Math.floor(q.x / 2) + i) + "," + (Math.floor(q.y / 2) + j)) ?? []) if (o.stop === q.stop && Math.abs(o.r - q.r) < 1e-3 && o.faint === q.faint) best = Math.min(best, Math.hypot(o.x - q.x, o.y - q.y)); return best; };
  const gm = grid(mine), gb = grid(cap.art);
  let missing = 0, extra = 0, maxD = 0, sumD = 0, n = 0;
  const miss = [];
  for (const q of cap.art) { const d = near(gm, q); if (d > 0.3) { missing++; miss.push(q.stop); } else { maxD = Math.max(maxD, d); sumD += d; n++; } }
  for (const q of mine) if (near(gb, q) > 0.3) extra++;
  rows.push({ w, browser: cap.art.length, data: mine.length, missingInData: missing, extraInData: extra, matchedMaxPx: +maxD.toFixed(3), matchedMeanPx: +(sumD / n).toFixed(4), stops: [...new Set(miss)].join(",") });
}
console.table(rows);
