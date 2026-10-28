// Renders the favicon set, Apple touch icon, Open Graph card and logo PNG
// from the welded mark geometry, with the real brand fonts.
//
//   node scripts/brand/render-brand-assets.mjs [--preview <dir>]
//
// --preview also writes small-size candidates to <dir> for inspection.
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("../../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root));
const previewDir = process.argv.includes("--preview") ? process.argv[process.argv.indexOf("--preview") + 1] : null;

const geometry = read("src/components/brand/mark-geometry.ts").toString();
const pathOf = (name) => geometry.match(new RegExp(`export const ${name} = "([^"]+)"`))[1];
const LEFT = pathOf("MARK_LEFT_PATH");
const RIGHT = pathOf("MARK_RIGHT_PATH");
const VIEWBOX = "318 325 615 598";

const INK = "#0B1A26";
const COBALT = "#0F557D";
const PAPER = "#F6F4EF";

// Same stops as the glass variant of components/brand/Mark.tsx.
const GLASS = `<linearGradient id="glass" gradientUnits="userSpaceOnUse" x1="640" y1="340" x2="900" y2="900">
  <stop offset="0" stop-color="#0b263c"/><stop offset="0.22" stop-color="#0f557d"/>
  <stop offset="0.36" stop-color="#1c8ec3"/><stop offset="0.46" stop-color="#ebc26b"/>
  <stop offset="0.55" stop-color="#be8c3f"/><stop offset="0.68" stop-color="#0f557d"/>
  <stop offset="0.86" stop-color="#0b263c"/><stop offset="1" stop-color="#1d75a3"/>
</linearGradient>`;

const markSvg = (variant, attrs = "") => {
  const right = variant === "glass" ? "url(#glass)" : COBALT;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" ${attrs}>${variant === "glass" ? GLASS : ""}
<path d="${LEFT}" fill="${INK}" fill-rule="evenodd"/><path d="${RIGHT}" fill="${right}" fill-rule="evenodd"/></svg>`;
};

// Vector favicon: the left half turns paper-coloured in dark browser chrome.
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}">
<style>.l{fill:${INK}}.r{fill:${COBALT}}@media (prefers-color-scheme:dark){.l{fill:${PAPER}}.r{fill:#1C8EC3}}</style>
<path class="l" d="${LEFT}" fill-rule="evenodd"/><path class="r" d="${RIGHT}" fill-rule="evenodd"/></svg>
`;
writeFileSync(new URL("src/app/icon.svg", root), iconSvg);

const font = (file) => read(`src/styles/fonts/${file}`).toString("base64");
const FONTS = `
@font-face{font-family:Brand;src:url(data:font/woff2;base64,${font("Archivo-latin-wdth-wght.woff2")}) format("woff2");font-weight:100 900;font-stretch:62% 125%}
@font-face{font-family:BrandMono;src:url(data:font/woff2;base64,${font("MartianMono-latin-wght.woff2")}) format("woff2");font-weight:100 800}`;

// A small paper tile keeps the ink half legible on any tab colour.
const tile = (size, pad, radius) => `<div style="width:${size}px;height:${size}px;background:${PAPER};border-radius:${radius}px;display:grid;place-items:center">
${markSvg("duo", `width="${size - pad * 2}" height="${size - pad * 2}"`)}</div>`;

const apple = `<div style="width:180px;height:180px;background:${PAPER};display:grid;place-items:center">
${markSvg("glass", 'width="132" height="132"')}</div>`;

const og = `<div class="card">
  <div class="frame"></div>
  ${[[40, 40], [1160, 40], [40, 590], [1160, 590]].map(([x, y]) => `<i class="plus" style="left:${x - 8}px;top:${y - 8}px"></i>`).join("")}
  <div class="seam"></div><div class="node"></div>
  <div class="copy">
    <p class="eyebrow">UK Based // Working Globally</p>
    <p class="word">Chinvat Bridge</p>
    <p class="line">AI, Automation, Software &amp; SEO</p>
  </div>
  <p class="foot">chinvatbridge.uk</p>
  <div class="caption"><span>Current state</span><span>Better systems</span></div>
  ${markSvg("glass", 'class="mark" width="430" height="418"')}
</div>`;

const ogCss = `
.card{width:1200px;height:630px;background:${PAPER};position:relative;overflow:hidden;font-family:Brand;color:${INK}}
.frame{position:absolute;inset:40px;border:1px solid #D6D9DB}
.plus{position:absolute;width:16px;height:16px}
.plus::before,.plus::after{content:"";position:absolute;background:#7D8A92}
.plus::before{left:7.5px;top:0;width:1px;height:16px}.plus::after{top:7.5px;left:0;height:1px;width:16px}
.seam{position:absolute;left:905px;top:40px;bottom:40px;width:1px;background:#B9C0C4}
.node{position:absolute;left:899px;top:584px;width:11px;height:11px;border:2px solid #CF9C48;border-radius:50%;background:${PAPER};box-sizing:border-box}
.copy{position:absolute;left:96px;top:184px;width:620px}
.eyebrow{margin:0;font-family:BrandMono;font-size:15px;letter-spacing:.08em;text-transform:uppercase;color:#5B6872}
.word{margin:28px 0 0;font-size:72px;line-height:.95;font-weight:600;font-stretch:112%;letter-spacing:-.025em}
.line{margin:30px 0 0;font-size:28px;line-height:1.3;color:#33414C;font-stretch:100%}
.foot{position:absolute;left:96px;bottom:72px;margin:0;font-family:BrandMono;font-size:14px;letter-spacing:.06em;color:#5B6872}
.caption{position:absolute;left:705px;width:400px;top:72px;display:flex;justify-content:space-between;font-family:BrandMono;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#5B6872}
.mark{position:absolute;left:690px;top:120px}`;

const browser = await chromium.launch();
const page = await browser.newPage();
const shoot = async (html, width, height, path, { transparent = false, css = "" } = {}) => {
  await page.setViewportSize({ width, height });
  await page.setContent(`<!doctype html><html><head><style>${FONTS}html,body{margin:0;background:transparent}${css}</style></head><body>${html}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  return page.screenshot({ path, clip: { x: 0, y: 0, width, height }, omitBackground: transparent });
};

const out = (path) => new URL(path, root).pathname;
await shoot(og, 1200, 630, out("src/app/opengraph-image.png"), { css: ogCss });
await shoot(apple, 180, 180, out("src/app/apple-icon.png"));
await shoot(markSvg("glass", 'width="512" height="498"'), 512, 498, out("public/brand/chinvat-bridge-mark.png"), { transparent: true });

// favicon.ico: PNG entries at 16, 32 and 48 px.
const sizes = [16, 32, 48];
const pngs = [];
for (const size of sizes) {
  const pad = size <= 16 ? 1 : Math.round(size * 0.08);
  pngs.push(await shoot(tile(size, pad, Math.round(size * 0.18)), size, size, undefined, { transparent: true }));
}
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const entry = 6 + i * 16;
  header.writeUInt8(size, entry);
  header.writeUInt8(size, entry + 1);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(pngs[i].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += pngs[i].length;
});
writeFileSync(out("src/app/favicon.ico"), Buffer.concat([header, ...pngs]));

if (previewDir) {
  // Candidates at tab sizes, magnified for inspection.
  const sheet = `<div style="display:flex;gap:24px;padding:24px;background:#fff;align-items:center">
    ${[16, 32, 48].map((s) => `<div style="display:grid;gap:8px">
      <div style="width:${s}px;height:${s}px;transform:scale(4);transform-origin:top left;margin:0 ${s * 3}px ${s * 3}px 0">${tile(s, s <= 16 ? 1 : Math.round(s * 0.08), Math.round(s * 0.18))}</div>
    </div>`).join("")}
    <div style="background:#202124;padding:12px;display:flex;gap:12px">${[16, 32].map((s) => `<img width="${s}" height="${s}" src="data:image/svg+xml;base64,${Buffer.from(iconSvg.replace("@media (prefers-color-scheme:dark){", "@media all{")).toString("base64")}">`).join("")}</div>
  </div>`;
  await shoot(sheet, 900, 260, `${previewDir}/favicon-sheet.png`);
}
await browser.close();
writeFileSync(
  out("src/app/opengraph-image.alt.txt"),
  "Chinvat Bridge: AI, automation, software and SEO. The mark is split down its axis, flat ink on one side and iridescent glass on the other.\n",
);
console.log("brand assets written");
