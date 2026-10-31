// Renders the WebGL Bridge studies other than the original (the SVG ones draw themselves), built, from their rest view, to
// public/bridge-studies/<id>-<v>.webp: the overview cards on /bridge-studies and the stills each stage
// shows before (or instead of) WebGL. The original study reuses the Approach poster.
//
// Shot at the scenes' reference aspect (1.4), so object-cover crops them as the canvas crops. The
// element is captured with its paper ground, as it sits on the page.
//
//   node scripts/poster/bridge-studies.mjs [--base http://localhost:3000]
//
// Needs the dev server (poster capture mode is development only).
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const argv = process.argv.slice(2);
const VERSION = "v1"; // keep in step with the poster paths in components/bridge-studies/studies.ts
const REFERENCE_ASPECT = 1.4;
const STUDIES = ["etching"];
const base = argv.includes("--base") ? argv[argv.indexOf("--base") + 1] : "http://localhost:3000";
const out = fileURLToPath(new URL("../../public/bridge-studies/", import.meta.url));
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 1.6 });
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));

await page.goto(`${base}/bridge-studies?poster=1`, { waitUntil: "load", timeout: 120_000 });
// Reference aspect, no poster under the canvas (it is the file being written), no focus ring.
await page.addStyleTag({
  content: `[data-stage^="study-"] { aspect-ratio: ${REFERENCE_ASPECT} / 1 !important; }
    [data-stage^="study-"] img { display: none !important; }`,
});

for (const id of STUDIES) {
  const stage = page.locator(`[data-stage="study-${id}"]`);
  await stage.scrollIntoViewIfNeeded();
  await page.locator(`[data-stage="study-${id}"] canvas[data-ready="true"]`).waitFor({ state: "attached", timeout: 120_000 });
  await page.waitForTimeout(500);
  const png = await stage.screenshot({ type: "png" });
  // WebP from the browser's own encoder: no image dependency for the script.
  const webp = await page.evaluate(async (data) => {
    const image = new Image();
    image.src = `data:image/png;base64,${data}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext("2d").drawImage(image, 0, 0);
    return canvas.toDataURL("image/webp", 0.86).split(",")[1];
  }, png.toString("base64"));
  const file = `${out}${id}-${VERSION}.webp`;
  writeFileSync(file, Buffer.from(webp, "base64"));
  console.log(`wrote ${file}`);
}

await browser.close();
if (errors.length) {
  console.error("page errors:\n  " + errors.join("\n  "));
  process.exitCode = 1;
}
