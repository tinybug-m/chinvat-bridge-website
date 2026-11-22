// Comparison sheets: the same crop of production, Phase 1 and the proposal, rings on trouble spots.
// usage: node sheet.mjs <capdir> <outdir> <config.json>
import sharp from "/home/tinybug/Documents/project/artin/chinvat-bridge-website/node_modules/.pnpm/sharp@0.35.5_@types+node@20.19.43/node_modules/sharp/dist/index.mjs";
import fs from "node:fs";
const [dir, out, cfgPath] = process.argv.slice(2);
const cfg = JSON.parse(fs.readFileSync(cfgPath));
fs.mkdirSync(out, { recursive: true });
const LABEL = { prod: "Production", p1: "Phase 1 (current)", next: "Proposal" };
for (const s of cfg) {
  const panels = [];
  for (const v of s.variants ?? ["prod", "p1", "next"]) {
    const d = JSON.parse(fs.readFileSync(`${dir}/${v}-${s.w}.json`));
    const f = `${dir}/${v}-${s.w}-wire.png`;
    const m = await sharp(f).metadata();
    const ox = d.layerX - d.clip.x, oy = d.layerY - d.clip.y;
    const left = Math.max(0, Math.round(s.x0 + ox)), top = Math.max(0, Math.round(s.y0 + oy));
    const width = Math.min(m.width - left, Math.round(s.x1 - s.x0)), height = Math.min(m.height - top, Math.round(s.y1 - s.y0));
    let buf = await sharp(f).extract({ left, top, width, height }).png().toBuffer();
    const rings = (s.rings ?? {})[v] ?? [];
    if (rings.length) {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;
      for (const [x, y, r] of rings) svg += `<circle cx="${x - s.x0}" cy="${y - s.y0}" r="${r}" fill="none" stroke="#e5484d" stroke-width="3" stroke-opacity="0.9"/>`;
      svg += "</svg>";
      buf = await sharp(buf).composite([{ input: Buffer.from(svg) }]).png().toBuffer();
    }
    const sc = s.scale ?? 1;
    const w2 = Math.round(width * sc), h2 = Math.round(height * sc);
    panels.push({ label: `${LABEL[v]}, ${s.w} px`, buf: await sharp(buf).resize(w2, h2).png().toBuffer(), w: w2, h: h2 });
  }
  const gap = 18, head = 34;
  const W = panels.reduce((a, p) => a + p.w, 0) + gap * (panels.length + 1);
  // Wrap the caption to the sheet's width (about 7.6 px a character at 15 px).
  const lines = [];
  if (s.caption) {
    const max = Math.floor((W - 2 * gap) / 7.6);
    let line = "";
    for (const word of s.caption.split(" ")) {
      if ((line + " " + word).trim().length > max) { lines.push(line.trim()); line = word; } else line += " " + word;
    }
    if (line.trim()) lines.push(line.trim());
  }
  const foot = lines.length ? lines.length * 20 + 12 : 0;
  const H = Math.max(...panels.map((p) => p.h)) + head + gap + foot;
  const comps = [];
  let x = gap;
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  for (const p of panels) {
    comps.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${p.w}" height="${head}"><text x="0" y="22" font-family="sans-serif" font-size="16" font-weight="700" fill="#111">${esc(p.label)}</text></svg>`), left: x, top: 4 });
    comps.push({ input: p.buf, left: x, top: head });
    x += p.w + gap;
  }
  if (lines.length) comps.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W - 2 * gap}" height="${foot}">${lines.map((l, i) => `<text x="0" y="${18 + i * 20}" font-family="sans-serif" font-size="15" fill="#333">${esc(l)}</text>`).join("")}</svg>`), left: gap, top: H - foot });
  await sharp({ create: { width: W, height: H, channels: 3, background: "#ffffff" } }).composite(comps).png().toFile(`${out}/${s.name}.png`);
  console.log(s.name);
}
