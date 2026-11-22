// usage: node zoom.mjs <capdir> <variant> <width> <kind> <layerX> <layerY> <half> <out> [scale]
import { createRequire } from "node:module";
// sharp ships with Next.js (not a direct dependency), so resolve it from Next's own location.
const sharp = createRequire(createRequire(import.meta.url).resolve("next/package.json"))("sharp");
import fs from "node:fs";
const [dir, v, w, kind, x, y, half, out, scale] = process.argv.slice(2);
const d = JSON.parse(fs.readFileSync(`${dir}/${v}-${w}.json`));
const f = `${dir}/${v}-${w}-${kind}.png`;
const m = await sharp(f).metadata();
const cx = +x + d.layerX - d.clip.x, cy = +y + d.layerY - d.clip.y, h = +half;
const left = Math.max(0, Math.round(cx - h)), top = Math.max(0, Math.round(cy - h * 0.7));
const width = Math.min(m.width - left, Math.round(2 * h)), height = Math.min(m.height - top, Math.round(1.4 * h));
const s = +(scale ?? 2);
await sharp(f).extract({ left, top, width, height }).resize(Math.round(width * s), Math.round(height * s), { kernel: "nearest" }).toFile(out);
