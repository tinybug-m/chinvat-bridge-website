// Screenshot tool for local visual QA (dev only).
//
// node scripts/qa/shoot.mjs --out <dir> [--base http://localhost:3000]
//   [--sizes 1440x900,768x1024,390x844] [--reduced] [--no-webgl] [--wait 1200] <target>...
//
// target forms:
//   /                 viewport at the top of the page
//   /#full            full-page capture
//   /@#services       element capture (any CSS selector after "@")
//   /~1800            viewport after scrolling to y = 1800
//
// Prints console errors and any horizontal overflow, which should always be zero.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const argv = process.argv.slice(2);
const opts = { base: "http://localhost:3000", sizes: "1440x900", wait: 1200, reduced: false, webgl: true, out: "" };
const targets = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--out") opts.out = argv[++i];
  else if (a === "--base") opts.base = argv[++i];
  else if (a === "--sizes") opts.sizes = argv[++i];
  else if (a === "--wait") opts.wait = Number(argv[++i]);
  else if (a === "--reduced") opts.reduced = true;
  else if (a === "--no-webgl") opts.webgl = false;
  else targets.push(a);
}
if (!opts.out || !targets.length) {
  console.error("usage: node scripts/qa/shoot.mjs --out <dir> [options] <target>...");
  process.exit(1);
}
mkdirSync(opts.out, { recursive: true });

const args = opts.webgl
  ? ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
  : ["--disable-webgl", "--disable-3d-apis"];
const browser = await chromium.launch({ args });
const slug = (s) => s.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "home";

for (const size of opts.sizes.split(",")) {
  const [width, height] = size.split("x").map(Number);
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: width < 600 ? 2 : 1,
    reducedMotion: opts.reduced ? "reduce" : "no-preference",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  for (const raw of targets) {
    const m = raw.match(/^([^#@~]*)(?:#(full))?(?:@(.+))?(?:~(\d+))?$/);
    const [, path = "/", full, selector, scrollY] = m ?? [];
    await page.goto(opts.base + (path || "/"), { waitUntil: "networkidle", timeout: 120000 });
    await page.waitForTimeout(opts.wait);
    const suffix = [full && "full", selector && slug(selector), scrollY && `y${scrollY}`].filter(Boolean).join("-");
    const name = `${width}-${slug(path)}${suffix ? "-" + suffix : ""}${opts.reduced ? "-reduced" : ""}${opts.webgl ? "" : "-nowebgl"}.png`;
    const file = `${opts.out}/${name}`;
    if (selector) {
      const el = page.locator(selector).first();
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(opts.wait);
      await el.screenshot({ path: file });
    } else {
      if (full) {
        // Walk the page once so scroll reveals and lazy 3D have run, as for a reader.
        const total = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < total; y += Math.round(height * 0.6)) {
          await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
          await page.waitForTimeout(250);
        }
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
        await page.waitForTimeout(opts.wait);
      }
      if (scrollY) {
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Number(scrollY));
        await page.waitForTimeout(opts.wait);
      }
      await page.screenshot({ path: file, fullPage: Boolean(full) });
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    console.log(`saved ${file}${overflow > 0 ? `  OVERFLOW ${overflow}px` : ""}`);
  }
  if (errors.length) console.log(`console errors at ${size}:\n  ` + [...new Set(errors)].join("\n  "));
  await context.close();
}
await browser.close();
