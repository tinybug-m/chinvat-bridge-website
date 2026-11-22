// Route the same inputs twice: with the browser's ink and with the build-time ink. Identical paths = no routing effect.
import fs from "node:fs";
const { inkForPlate } = await import("./inkdata.ts");
const { routeWire } = await import("../prototype/route-final.ts");
const data = JSON.parse(fs.readFileSync(process.argv[2]));
const bySig = new Map(data.plates.map((p) => [p.sig, p]));
const FX = process.env.FX ?? "./fx"; // router inputs captured with cap.mjs (see CHECKPOINT.md)
const rows = [];
for (const w of [1440, 1280, 1024, 768, 430, 390, 360]) {
  const d = JSON.parse(fs.readFileSync(`${FX}/next-${w}.json`));
  const cap = JSON.parse(fs.readFileSync(`cap/art-${w}.json`));
  const mine = [];
  for (const p of cap.plates) inkForPlate(bySig.get(p.sig), { a: p.m[0], b: p.m[1], c: p.m[2], d: p.m[3], e: p.m[4], f: p.m[5] }, p.stop, (x, y) => ({ x, y }), data.step, mine);
  const ox = cap.art[0].x - mine[0].x, oy = cap.art[0].y - mine[0].y;
  mine.forEach((q) => { q.x += ox; q.y += oy; });
  const opts = w >= 768 ? { cell: 6 } : { phonePorts: false };
  const run = (art) => routeWire(d.origin, structuredClone(d.stops), d.text, d.width, d.lane, (0.94 - 0.76) * d.vh, (1 - 0.76) * d.vh, d.margin, art, d.edges, d.groups, opts);
  const a = run(cap.art), b = run(mine);
  const same = a.segments.length === b.segments.length && a.segments.every((s, i) => s.d === b.segments[i].d);
  let maxDev = 0;
  a.segments.forEach((s, i) => s.points.forEach((p, k) => { const q = b.segments[i]?.points[k]; maxDev = q ? Math.max(maxDev, Math.hypot(p.x - q.x, p.y - q.y)) : 999; }));
  rows.push({ w, identicalPaths: same, maxPointDevPx: +maxDev.toFixed(3), portsSame: JSON.stringify(a.arrivals.map((x) => x.port)) === JSON.stringify(b.arrivals.map((x) => x.port)) });
}
console.table(rows);
