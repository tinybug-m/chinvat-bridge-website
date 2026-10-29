// Renders the Bridge truss span's two rest poses to public/bridge/:
// bridge-drawn-<v>.png (all maquette) and bridge-built-<v>.png (all built truss). The page
// splits them at the seam with a clip-path when WebGL is not live.
//
//   node scripts/poster/bridge.mjs [--base http://localhost:3000]
//
// Needs the dev server (poster capture mode is development only).
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const argv = process.argv.slice(2);
const VERSION = "v7"; // keep in step with BRIDGE_POSTERS in scenes/bridge/config.ts
const base = argv.includes("--base") ? argv[argv.indexOf("--base") + 1] : "http://localhost:3000";

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

for (const pose of ["drawn", "built"]) {
  // 1440 x 900 is where the stage is largest (21:9, capped at 560px); DPR 2 gives the 2x poster.
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));

  await page.goto(`${base}/?poster=1&bridge=${pose}`, { waitUntil: "load", timeout: 120_000 });
  await page.locator('[data-stage="bridge"]').scrollIntoViewIfNeeded();
  const canvas = page.locator('[data-stage="bridge"] canvas[data-ready="true"]');
  await canvas.waitFor({ state: "attached", timeout: 120_000 });
  const { dataUrl, width, height } = await canvas.evaluate((element) => ({
    dataUrl: element.toDataURL("image/png"),
    width: element.width,
    height: element.height,
  }));
  await page.close();
  // The page asks for the posters this script is writing; only other errors count.
  errors.splice(0, errors.length, ...errors.filter((e) => !e.includes("Failed to load resource")));
  if (errors.length) {
    console.error(`page errors (${pose}):\n  ` + errors.join("\n  "));
    process.exitCode = 1;
  }

  let png = Buffer.from(dataUrl.split(",")[1], "base64");
  try {
    const { default: sharp } = await import("sharp");
    png = await sharp(png).png({ compressionLevel: 9, effort: 10, palette: false }).toBuffer();
  } catch {
    // Keep the browser's PNG.
  }
  const out = fileURLToPath(new URL(`../../public/bridge/bridge-${pose}-${VERSION}.png`, import.meta.url));
  writeFileSync(out, png);
  console.log(`saved ${out} (${width} x ${height}, ${png.length} bytes)`);
}
await browser.close();
