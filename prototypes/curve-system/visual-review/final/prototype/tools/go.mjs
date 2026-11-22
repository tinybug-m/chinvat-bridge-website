// usage: node go.mjs <router: next|final> <name> <outdir> <widths> [optionsJSON] [--runs N] [--noimg]
// Routes the captured browser inputs (fx/next-<w>.json) offline. Timing: median of N timed runs after 2 warm-ups.
import sharp from "/home/tinybug/Documents/project/artin/chinvat-bridge-website/node_modules/.pnpm/sharp@0.35.5_@types+node@20.19.43/node_modules/sharp/dist/index.mjs";
import fs from "node:fs";
import os from "node:os";
const [router, name, out, ws, optJson = "{}"] = process.argv.slice(2);
const runs = +(process.argv.includes("--runs") ? process.argv[process.argv.indexOf("--runs") + 1] : 7);
const noimg = process.argv.includes("--noimg");
const mod = await import(router === "final" ? "./route-final.ts" : "./route-next.ts");
const opts = JSON.parse(optJson);
fs.mkdirSync(out, { recursive: true });
const FX = process.env.FX ?? "/tmp/claude-1000/-home-tinybug-Documents-project-artin-chinvat-bridge-website/b1e4bd6e-20ee-4da9-bcc0-d0409bed7b9c/scratchpad/fx";
for (const w of ws.split(",").map(Number)) {
  const d = JSON.parse(fs.readFileSync(`${FX}/next-${w}.json`));
  const call = () => router === "final"
    ? mod.routeWire(d.origin, structuredClone(d.stops), d.text, d.width, d.lane, (0.94 - 0.76) * d.vh, (1 - 0.76) * d.vh, d.margin, d.art, d.edges, d.groups, opts)
    : mod.routeWire(d.origin, structuredClone(d.stops), d.text, d.width, d.lane, (0.94 - 0.76) * d.vh, (1 - 0.76) * d.vh, d.margin, d.art, d.edges, d.groups);
  call(); call();
  const times = [], fields = [], searches = [];
  let wire;
  for (let i = 0; i < runs; i++) {
    const t0 = performance.now();
    wire = call();
    times.push(performance.now() - t0);
    if (router === "final") { fields.push(mod.STATS.fieldMs); searches.push(mod.STATS.searchMs); }
  }
  const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
  const rec = { ...d, variant: name, wire, ms: med(times), msMin: Math.min(...times), msMax: Math.max(...times), fieldMs: med(fields), searchMs: med(searches), judged: router === "final" ? mod.STATS.judged : null, filleted: router === "final" ? mod.STATS.filleted : null, opts };
  fs.writeFileSync(`${out}/${name}-${w}.json`, JSON.stringify(rec));
  if (!noimg) {
    const ox = d.layerX - d.clip.x, oy = d.layerY - d.clip.y;
    const f = `${FX}/next-${w}-ink.png`;
    const m = await sharp(f).metadata();
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${m.width}" height="${m.height}"><g transform="translate(${ox} ${oy})">`;
    for (const s of wire.segments) svg += `<path d="${s.d}" fill="none" stroke="#141a24" stroke-opacity="0.85" stroke-width="1.25" stroke-linecap="round"/>`;
    for (const a of wire.arrivals) svg += `<circle cx="${a.x}" cy="${a.y}" r="2.25" fill="#141a24"/>`;
    svg += "</g></svg>";
    await sharp(f).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).png().toFile(`${out}/${name}-${w}-wire.png`);
    fs.copyFileSync(f, `${out}/${name}-${w}-ink.png`);
  }
  console.log(`${name} ${w}: median ${rec.ms.toFixed(0)} ms (min ${rec.msMin.toFixed(0)}, max ${rec.msMax.toFixed(0)}) field ${rec.fieldMs?.toFixed(0)} search ${rec.searchMs?.toFixed(0)} judged ${rec.judged} filleted ${rec.filleted} retries ${router==="final"?mod.STATS.retries:"-"}; ports ${wire.arrivals.map((a) => a.stop + ":" + a.port).join(" ")}`);
}
