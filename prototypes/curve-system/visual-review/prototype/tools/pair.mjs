// usage: node pair.mjs out.png labelA a.png labelB b.png [labelC c.png] [--scale s]
import { createRequire } from "node:module";
// sharp ships with Next.js (not a direct dependency), so resolve it from Next's own location.
const sharp = createRequire(createRequire(import.meta.url).resolve("next/package.json"))("sharp");
const args = process.argv.slice(2);
const out = args.shift();
let scale = 1;
const si = args.indexOf("--scale");
if (si >= 0) { scale = +args[si + 1]; args.splice(si, 2); }
const items = [];
for (let i = 0; i < args.length; i += 2) items.push({ label: args[i], file: args[i + 1] });
const imgs = await Promise.all(items.map(async (it) => {
  const m = await sharp(it.file).metadata();
  const w = Math.round(m.width * scale), h = Math.round(m.height * scale);
  return { ...it, buf: await sharp(it.file).resize(w, h).png().toBuffer(), w, h };
}));
const gap = 16, head = 34;
const W = imgs.reduce((s, i) => s + i.w, 0) + gap * (imgs.length + 1);
const H = Math.max(...imgs.map((i) => i.h)) + head + gap;
let x = gap;
const comps = [];
for (const i of imgs) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${i.w}" height="${head}"><text x="0" y="22" font-family="sans-serif" font-size="17" font-weight="700" fill="#111">${i.label}</text></svg>`;
  comps.push({ input: Buffer.from(svg), left: x, top: 4 }, { input: i.buf, left: x, top: head });
  x += i.w + gap;
}
await sharp({ create: { width: W, height: H, channels: 3, background: "#ffffff" } }).composite(comps).png().toFile(out);
