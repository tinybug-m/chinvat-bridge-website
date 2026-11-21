import { expect, test } from "@playwright/test";

/*
 * 03 Method: one crossing in four steps, each a plate of the same stone path.
 * No WebGL stage runs here; each plate draws in when the energy wire from the
 * hero reaches it, in order, and the wire ends on the last.
 */

const STEPS = ["Discover", "Define", "Build", "Improve"];

test.describe("method", () => {
  test("outline, copy and no overflow", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.goto("/");
    const section = page.locator("#method");
    await expect(section).toHaveAttribute("aria-labelledby", "method-title");
    await expect(section.getByRole("heading", { level: 2, name: "How we work." })).toBeVisible();
    await expect(section.getByRole("heading", { level: 3 })).toHaveText(STEPS);
    await expect(section.getByText("We understand your business, your existing systems and the problems worth solving.")).toBeAttached();
    await expect(section.getByRole("link", { name: "Start a conversation" })).toHaveAttribute("href", "/#contact");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors.filter((error) => /method/i.test(error))).toEqual([]);
  });

  test("four decorative plates, no 3D stage, nothing tied to scroll", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#method");
    await expect(section.locator("[data-stage]")).toHaveCount(0);
    await expect(section.locator("canvas")).toHaveCount(0);
    await expect(section.locator("[data-method-root]")).toHaveCount(0);
    const plates = section.locator("li svg");
    await expect(plates).toHaveCount(4);
    for (let index = 0; index < 4; index++) {
      await expect(plates.nth(index)).toHaveAttribute("aria-hidden", "true");
      await expect(plates.nth(index).locator("text")).toHaveCount(0);
    }
    // No step numerals above the titles: the plates already show the order.
    await expect(section.locator("li p.font-label")).toHaveCount(0);
  });

  test("the plates fit at every width", async ({ page }) => {
    await page.goto("/");
    for (const step of STEPS) {
      const item = page.locator("#method li", { has: page.getByRole("heading", { level: 3, name: step }) });
      await item.scrollIntoViewIfNeeded();
      const box = await item.locator("svg").boundingBox();
      const viewport = page.viewportSize()!;
      expect(box!.width).toBeGreaterThan(200);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
    }
  });

  test("reduced motion: the finished plates are there at once", async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "one viewport is enough");
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("#method li svg")).toHaveCount(4);
    const clip = await page.locator("#method li .svc-built").last().evaluate((element) => getComputedStyle(element).clipPath);
    expect(clip === "none" || clip.startsWith("inset(-6px -6px")).toBe(true);
    await context.close();
  });

  test("without JavaScript every step is readable", async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "one viewport is enough");
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto("/");
    for (const title of STEPS) {
      await expect(page.locator("#method").getByRole("heading", { level: 3, name: title })).toBeVisible();
    }
    await expect(page.locator("#method li svg").first()).toBeVisible();
    await context.close();
  });
});
