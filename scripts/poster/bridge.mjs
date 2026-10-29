// Renders the Bridge path's two rest poses to public/bridge/:
// bridge-drawn-<v>.png (all slabs loose) and bridge-built-<v>.png (all level, one deck). The page
// splits them at the seam with a clip-path when WebGL is not live.
//
// Both are shot at the scene's reference aspect (referenceAspect in scenes/bridge/config.ts), which
// is also what the scene frames for, so object-cover on the page crops them exactly as the canvas crops.
//
//   node scripts/poster/bridge.mjs [--base http://localhost:3000]
//
// Needs the dev server (poster capture mode is development only).
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const argv = process.argv.slice(2);
const VERSION = "v8"; // keep in step with BRIDGE_POSTERS in scenes/bridge/config.ts
const REFERENCE_ASPECT = 1.4; // keep in step with BRIDGE_PATH.referenceAspect
const PAPER_RAISED = "#fbfaf7"; // --color-paper-raised, the Approach band's ground
const base = argv.includes("--base") ? argv[argv.indexOf("--base") + 1] : "http://localhost:3000";

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

for (const pose of ["drawn", "built"]) {
  // The stage is forced to the reference aspect below; DPR 2 gives the 2x poster.
  const page = await browser.newPage({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));

  await page.goto(`${base}/?poster=1&bridge=${pose}`, { waitUntil: "load", timeout: 120_000 });
  await page.addStyleTag({ content: `[data-stage="bridge"] { aspect-ratio: ${REFERENCE_ASPECT} / 1 !important; max-height: none !important; }` });
  await page.locator('[data-stage="bridge"]').scrollIntoViewIfNeeded();
  const canvas = page.locator('[data-stage="bridge"] canvas[data-ready="true"]');
  await canvas.waitFor({ state: "attached", timeout: 120_000 });
  // Composited onto the section's paper-raised ground in the browser: the soft glow and the fading
  // plinths carry very low alpha, which a straight-alpha PNG quantises into speckle. The stage sits on
  // that same colour, so nothing is lost.
  const { dataUrl, width, height } = await canvas.evaluate((element, ground) => {
    const flat = document.createElement("canvas");
    flat.width = element.width;
    flat.height = element.height;
    const ctx = flat.getContext("2d");
    ctx.fillStyle = ground;
    ctx.fillRect(0, 0, flat.width, flat.height);
    ctx.drawImage(element, 0, 0);
    return { dataUrl: flat.toDataURL("image/png"), width: flat.width, height: flat.height };
  }, PAPER_RAISED);
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
