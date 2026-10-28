// Renders the hero seam scene's rest pose to public/hero/seam-poster.png.
//
//   node scripts/poster/seam.mjs [--base http://localhost:3000]
//
// Needs the dev server (poster capture mode is development only). The page
// is opened with ?poster=1, which makes the stage mount at once at the high
// tier, skip the intro and input, and keep its drawing buffer; the canvas is
// then read back as a transparent PNG at 2x the largest displayed size.
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const argv = process.argv.slice(2);
const base = argv.includes("--base") ? argv[argv.indexOf("--base") + 1] : "http://localhost:3000";
const out = fileURLToPath(new URL("../../public/hero/seam-poster.png", import.meta.url));

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
// 1440 x 900 is where the object is largest (40rem); DPR 2 gives the 2x poster.
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));
page.on("console", (message) => message.type() === "error" && errors.push(message.text()));

await page.goto(`${base}/?poster=1`, { waitUntil: "load", timeout: 120_000 });
const canvas = page.locator('[data-stage="seam"] canvas[data-ready="true"]');
await canvas.waitFor({ state: "attached", timeout: 120_000 });
const { dataUrl, width, height } = await canvas.evaluate((element) => ({
  dataUrl: element.toDataURL("image/png"),
  width: element.width,
  height: element.height,
}));
await browser.close();
if (errors.length) {
  console.error("page errors:\n  " + errors.join("\n  "));
  process.exit(1);
}

let png = Buffer.from(dataUrl.split(",")[1], "base64");
try {
  // Lossless recompression when sharp (a Next.js dependency) is available.
  const { default: sharp } = await import("sharp");
  png = await sharp(png).png({ compressionLevel: 9, effort: 10 }).toBuffer();
} catch {
  // Keep the browser's PNG.
}
writeFileSync(out, png);
console.log(`saved ${out} (${width} x ${height}, ${png.length} bytes)`);
