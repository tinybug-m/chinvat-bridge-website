import { expect, test } from "@playwright/test";

const TITLES = ["LLMs & Models", "Workflows & APIs", "Custom Apps", "Pipelines & BI", "Digital Platforms", "Technical SEO"];

test.describe("capabilities section", () => {
  test("heading, anchors and the list", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#capabilities");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("What we build with.");
    await expect(section.locator("h2")).toHaveAttribute("id", "capabilities-title");
    await expect(section.locator("#machines")).toHaveCount(1);
    await expect(section.locator("ul > li h3")).toHaveText(TITLES);
    await expect(section).toContainText("Also: Digital Strategy · Data Integration · Analytics & BI · Technical Architecture");
  });

  test("descriptions share one column on wide screens", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "the offsets only apply from lg up");
    await page.goto("/");
    const lefts = await page.locator("#capabilities ul > li p.text-ink-soft").evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().left)),
    );
    expect(lefts).toHaveLength(6);
    expect(new Set(lefts).size).toBe(1);
  });

  test("#machines still scrolls to the section", async ({ page }) => {
    await page.goto("/#machines");
    await expect(page.locator("#capabilities-title")).toBeInViewport();
  });

  test("no horizontal overflow without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("#capabilities h3").first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await context.close();
  });
});
