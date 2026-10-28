// Renders the four Method states (Discover, Define, Build, Improve) to
// public/method/, under the poster names in scenes/method/config.ts.
//
//   node scripts/poster/method.mjs [--base http://localhost:3000]
//
// Needs the dev server (poster capture mode is development only). Each state
// is opened with ?poster=1&method=<0..3>: the stage mounts at once at the high
// tier and renders that state exactly, keeping its drawing buffer. The square
// stage canvas is cropped to the scene's 4:3 frame (the scene "contain"-fits
// that frame, so the crop loses nothing) and saved as a transparent PNG.
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const argv = process.argv.slice(2);
const base = argv.includes("--base") ? argv[argv.indexOf("--base") + 1] : "http://localhost:3000";
const publicDir = fileURLToPath(new URL("../../public", import.meta.url));
const config = readFileSync(new URL("../../src/components/three/scenes/method/config.ts", import.meta.url), "utf8");
// Poster paths in step order, e.g. "/method/method-survey-v2.png".
const POSTERS = [...config.matchAll(/poster: "([^"]+)"/g)].map((match) => match[1]);
if (POSTERS.length !== 4) throw new Error(`expected 4 poster paths in config.ts, found ${POSTERS.length}`);
const OUT = { width: 1200, height: 900 };

mkdirSync(`${publicDir}/method`, { recursive: true });
// sharp is a Next.js dependency, not a direct one: resolve it through next.
let sharp = null;
try {
  const fromNext = createRequire(createRequire(import.meta.url).resolve("next/package.json"));
  sharp = fromNext("sharp");
} catch {
  // Keep the browser's PNG.
}
const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
let failed = false;

for (const [index, poster] of POSTERS.entries()) {
  // 1440 x 900 is where the stage is largest; DPR 3 leaves room for the crop.
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 3 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));

  await page.goto(`${base}/?poster=1&method=${index}`, { waitUntil: "load", timeout: 120_000 });
  await page.locator('[data-stage="method"]').scrollIntoViewIfNeeded();
  const canvas = page.locator('[data-stage="method"] canvas[data-ready="true"]');
  await canvas.waitFor({ state: "attached", timeout: 120_000 });
  // Crop the 4:3 frame out of the square canvas and scale it in the page.
  const { dataUrl, width, height } = await canvas.evaluate((element, out) => {
    const cropHeight = Math.round((element.width * 3) / 4);
    const target = document.createElement("canvas");
    target.width = out.width;
    target.height = out.height;
    const context = target.getContext("2d");
    context.imageSmoothingQuality = "high";
    const top = Math.round((element.height - cropHeight) / 2);
    context.drawImage(element, 0, top, element.width, cropHeight, 0, 0, out.width, out.height);
    return { dataUrl: target.toDataURL("image/png"), width: element.width, height: element.height };
  }, OUT);
  await page.close();
  // Missing posters 404 on the first run; that is what this script fixes.
  const real = errors.filter((error) => !/404|Failed to load resource/.test(error));
  if (real.length) {
    console.error(`${poster}: page errors:\n  ` + real.join("\n  "));
    failed = true;
    continue;
  }

  let png = Buffer.from(dataUrl.split(",")[1], "base64");
  if (sharp) png = await sharp(png).png({ compressionLevel: 9, effort: 10 }).toBuffer();
  const out = `${publicDir}${poster}`;
  writeFileSync(out, png);
  console.log(`saved ${out} (${OUT.width} x ${OUT.height} from ${width} x ${height}, ${png.length} bytes)`);
}

await browser.close();
if (failed) process.exit(1);
