import { analyze } from "./analyze.mjs";
import fs from "node:fs";
const dir = process.argv[2];
const rows = [];
for (const w of [1440, 1280, 1024, 768, 430, 390, 360])
  for (const v of ["prod", "p1", "next"]) {
    const r = await analyze(dir, v, w, true);
    const d = JSON.parse(fs.readFileSync(`${dir}/${v}-${w}.json`));
    const sum = (k) => r.hops.reduce((s, h) => s + h[k], 0);
    // Length of wire running in the outermost page-margin lanes (within 3px of them).
    let rail = 0;
    for (const s of d.wire.segments) for (let i = 1; i < s.points.length; i++) {
      const a = s.points[i - 1], b = s.points[i];
      if (Math.abs(a.x - b.x) < 0.5 && (Math.abs(a.x - d.lane) < 3 || Math.abs(a.x - (d.width - d.lane)) < 3)) rail += Math.abs(b.y - a.y);
    }
    rows.push({ w, v, length: sum("length"), turns: sum("turns"), reversals: sum("reversals"), conflicts: r.conflicts.length, conflictPx: r.conflicts.reduce((s, c) => s + c.len, 0), minClear: Math.min(...r.hops.map((h) => h.min)), hug: sum("hug"), deco: sum("deco"), rail: Math.round(rail), ms: Math.round(d.ms ?? 0) });
  }
console.table(rows);
fs.writeFileSync(`${dir}/summary.json`, JSON.stringify(rows, null, 1));
