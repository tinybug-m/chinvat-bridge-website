// usage: node crop.mjs <capdir> <variant> <width> <kind> <layerY0> <layerY1> <out> [x0 x1]
import { createRequire } from "node:module";
// sharp ships with Next.js (not a direct dependency), so resolve it from Next's own location.
const sharp = createRequire(createRequire(import.meta.url).resolve("next/package.json"))("sharp");
import fs from "node:fs";
const [dir, v, w, kind, y0, y1, out, x0, x1] = process.argv.slice(2);
const d = JSON.parse(fs.readFileSync(`${dir}/${v}-${w}.json`));
const oy = d.layerY - d.clip.y;
const meta = await sharp(`${dir}/${v}-${w}-${kind}.png`).metadata();
const top = Math.max(0, Math.round(+y0 + oy));
const left = x0 ? +x0 : 0;
const width = (x1 ? +x1 : meta.width) - left;
const height = Math.min(meta.height - top, Math.round(+y1 - +y0));
await sharp(`${dir}/${v}-${w}-${kind}.png`).extract({ left, top, width, height }).toFile(out);
