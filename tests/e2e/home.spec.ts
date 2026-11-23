import { expect, test } from "@playwright/test";
import { ONCE } from "./once";

// Whole-page guarantees for the homepage; each section has its own spec too.
const CHAPTERS = ["services", "work", "approach", "method", "capabilities", "about", "insights", "contact"];

test.describe("homepage", () => {
  test("one h1 and a heading outline without skipped levels", ONCE, async ({ page }) => {
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

  test("every in-page anchor has a target", ONCE, async ({ page }) => {
    await page.goto("/");
    const targets = await page.locator('a[href^="/#"], a[href^="#"]').evaluateAll((links) => [
      ...new Set(links.map((a) => a.getAttribute("href")!.split("#")[1]).filter(Boolean)),
    ]);
    expect(targets.length).toBeGreaterThan(0);
    for (const id of targets) await expect(page.locator(`[id="${id}"]`), `#${id}`).toHaveCount(1);
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

  test("no horizontal overflow in any chapter", async ({ page }) => {
    await page.goto("/");
    for (const id of CHAPTERS) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `#${id}`).toBeLessThanOrEqual(0);
    }
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
