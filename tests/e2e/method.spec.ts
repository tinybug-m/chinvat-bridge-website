import { type Page, expect, test } from "@playwright/test";

/*
 * 03 Method: the sticky stage follows the steps in both directions on
 * desktop; below lg, and under reduced motion, every step carries its own
 * still frame instead.
 */

interface StageProbe {
  state: string;
  calls?: number;
  triangles?: number;
  contexts?: number;
}

const probes = (page: Page) =>
  page.evaluate(() => (window as unknown as { __three?: Record<string, StageProbe> }).__three ?? {});

const active = (page: Page) => page.locator("[data-method-root]").getAttribute("data-active");

async function scrollToStep(page: Page, index: number) {
  await page.evaluate((i) => {
    const step = document.querySelector<HTMLElement>(`[data-method-step="${i}"]`);
    if (!step) throw new Error(`no step ${i}`);
    // Put the step's top a little above the middle of the viewport, where it takes over.
    window.scrollTo({
      top: step.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.35,
      behavior: "instant",
    });
  }, index);
}

test.describe("method", () => {
  test("outline, copy and no overflow", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.goto("/");
    const section = page.locator("#method");
    await expect(section).toHaveAttribute("aria-labelledby", "method-title");
    await expect(section.getByRole("heading", { level: 2, name: "How we work." })).toBeVisible();
    const titles = section.getByRole("heading", { level: 3 });
    await expect(titles).toHaveText(["Discover", "Define", "Build", "Improve"]);
    await expect(section.getByText("We understand your business, your existing systems and the problems worth solving.")).toBeAttached();
    await expect(section.getByRole("link", { name: "Start a conversation" })).toHaveAttribute("href", "/#contact");
    // State names are not painted on the stage; each step keeps one as screen-reader text.
    for (const caption of ["Point cloud", "Wireframe", "Maquette", "Material"]) {
      const text = section.locator(".sr-only", { hasText: new RegExp(`^${caption}$`) });
      await expect(text).toHaveCount(1);
      expect(await text.evaluate((el) => getComputedStyle(el).position)).toBe("absolute");
    }
    await expect(section.locator("[data-method-caption]")).toHaveCount(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    // Errors from other sections are their builders' business; method's own must be clean.
    expect(errors.filter((error) => /method/i.test(error))).toEqual([]);
  });

  test("desktop: the stage follows the steps down and back up, without trapping scroll", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "the sticky stage is desktop only");
    await page.goto("/");
    const stage = page.locator('[data-stage="method"]');
    await expect(stage).toBeVisible();
    // The per-step frames are hidden on the sticky layout.
    await expect(page.locator("[data-method-step] img").first()).toBeHidden();

    for (const index of [0, 1, 2, 3, 2, 1, 0]) {
      // Re-aim on every poll: sections above may still be settling (images, reveals).
      await expect
        .poll(async () => {
          await scrollToStep(page, index);
          await page.waitForTimeout(100);
          return active(page);
        }, { timeout: 20_000 })
        .toBe(String(index));
    }

    // Sticky, not pinned: scrolling on past the section moves the page and the stage with it.
    await page.locator("#capabilities").scrollIntoViewIfNeeded();
    await expect(page.locator("#capabilities")).toBeInViewport();
    await expect(stage).not.toBeInViewport();
  });

  test("desktop: the node goes live within budget, with Bridge nearby", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "the live stage is desktop only");
    await page.goto("/");
    // Pass the hero and Bridge first, so all three stages have wanted a context.
    await page.locator("#approach").scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await scrollToStep(page, 1);
    await expect.poll(async () => (await probes(page)).method?.state, { timeout: 30_000 }).toBe("live");
    const all = await probes(page);
    const live = Object.values(all).filter((probe) => probe.state === "live").length;
    expect(live).toBeLessThanOrEqual(2);
    expect(all.method.calls ?? 0).toBeLessThanOrEqual(4);
    expect(all.method.triangles ?? 0).toBeLessThanOrEqual(20_000);
  });

  test("mobile and tablet: every step shows its own frame, no sticky stage", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "desktop", "below lg only");
    await page.goto("/");
    await expect(page.locator('[data-stage="method"]')).toBeHidden();
    const frames = page.locator("[data-method-step] img");
    await expect(frames).toHaveCount(4);
    for (let index = 0; index < 4; index++) {
      const frame = frames.nth(index);
      await frame.scrollIntoViewIfNeeded();
      await expect(frame).toBeVisible();
      await expect.poll(() => frame.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    }
  });

  test("reduced motion: static frames per step, no stage", async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "one viewport is enough");
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator('[data-stage="method"]')).toBeHidden();
    await expect(page.locator("[data-method-step] img")).toHaveCount(4);
    await page.locator('[data-method-step="2"]').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-method-step="2"] img')).toBeVisible();
    await expect(page.locator("[data-method-root]")).not.toHaveAttribute("data-active", /.*/);
    await context.close();
  });

  test("without JavaScript every step is readable", async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "one viewport is enough");
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto("/");
    for (const title of ["Discover", "Define", "Build", "Improve"]) {
      await expect(page.locator("#method").getByRole("heading", { level: 3, name: title })).toBeVisible();
    }
    await context.close();
  });
});
