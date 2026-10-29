import { expect, test } from "@playwright/test";

// Whole-page guarantees for the homepage; each section has its own spec too.
const CHAPTERS = ["services", "work", "approach", "method", "capabilities", "about", "team", "insights", "contact"];

test.describe("homepage", () => {
  test("one h1 and a heading outline without skipped levels", async ({ page }) => {
    await page.goto("/");
    const levels = await page.locator("main").evaluate((main) =>
      [...main.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) => Number(h.tagName[1])),
    );
    expect(levels.filter((level) => level === 1)).toHaveLength(1);
    expect(levels[0]).toBe(1);
    levels.forEach((level, i) => {
      if (i > 0) expect(level - levels[i - 1], `heading ${i} jumps a level`).toBeLessThanOrEqual(1);
    });
  });

  test("chapters are in order and named by their headings", async ({ page }) => {
    await page.goto("/");
    const ids = await page.locator("main > section[id]").evaluateAll((sections) => sections.map((s) => s.id));
    expect(ids).toEqual(CHAPTERS);
    for (const id of CHAPTERS) {
      const labelledBy = await page.locator(`#${id}`).getAttribute("aria-labelledby");
      expect(labelledBy, `#${id} has aria-labelledby`).toBeTruthy();
      await expect(page.locator(`#${labelledBy}`)).toHaveCount(1);
    }
  });

  test("every in-page anchor has a target", async ({ page }) => {
    await page.goto("/");
    const targets = await page.locator('a[href^="/#"], a[href^="#"]').evaluateAll((links) => [
      ...new Set(links.map((a) => a.getAttribute("href")!.split("#")[1]).filter(Boolean)),
    ]);
    expect(targets.length).toBeGreaterThan(0);
    for (const id of targets) await expect(page.locator(`[id="${id}"]`), `#${id}`).toHaveCount(1);
  });

  test("internal links resolve", async ({ page, request }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "once is enough");
    await page.goto("/");
    const paths = await page.locator('a[href^="/"]').evaluateAll((links) => [
      ...new Set(links.map((a) => a.getAttribute("href")!.split("#")[0]).filter((href) => href && href !== "/")),
    ]);
    for (const path of paths) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status(), path).toBeLessThan(400);
    }
  });

  test("content is complete without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const id of CHAPTERS) {
      const heading = page.locator(`#${id}-title`);
      await heading.scrollIntoViewIfNeeded();
      await expect(heading).toBeVisible();
      expect(await heading.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    }
    await context.close();
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("nothing animates and every chapter is fully visible", async ({ page }) => {
      await page.goto("/");
      for (const id of CHAPTERS) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        await page.waitForTimeout(150);
      }
      const running = await page.evaluate(() =>
        document.getAnimations().filter((a) => a.playState === "running" && (a.effect?.getTiming().duration as number) > 50).length,
      );
      expect(running).toBe(0);
      const hidden = await page.locator("[data-reveal]").evaluateAll((els) =>
        els.filter((el) => getComputedStyle(el).opacity !== "1").length,
      );
      expect(hidden).toBe(0);
    });
  });
});
