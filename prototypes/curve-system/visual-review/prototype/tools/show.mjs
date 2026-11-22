import { analyze } from "./analyze.mjs";
const [dir, v, w, flag] = process.argv.slice(2);
const r = await analyze(dir, v, Number(w), flag === "--debug");
const f = (p) => (p ? `${Math.round(p.x)},${Math.round(p.y)}` : "");
console.log(`== ${v} ${w}`);
console.table(r.hops.map((h) => ({ ...h, minAt: f(h.minAt) })));
console.table(r.conflicts.map((c) => ({ hop: c.hop, from: Math.round(c.from), len: c.len, min: c.min, at: f(c.at) })));
