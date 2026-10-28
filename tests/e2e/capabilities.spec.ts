import { expect, test } from "@playwright/test";

const TITLES = ["LLMs & Models", "Workflows & APIs", "Custom Apps", "Pipelines & BI", "Digital Platforms", "Technical SEO"];

test.describe("capabilities section", () => {
  test("heading, anchors and the accessible list", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#capabilities");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("What we build with.");
    await expect(section.locator("h2")).toHaveAttribute("id", "capabilities-title");
    await expect(section.locator("#machines")).toHaveCount(1);
    await expect(section.locator("ul > li h3")).toHaveText(TITLES);
    await expect(section).toContainText("Also: Digital Strategy · Data Integration · Analytics & BI · Technical Architecture");
  });

  test("#machines still scrolls to the section", async ({ page }) => {
    await page.goto("/#machines");
    await expect(page.locator("#capabilities-title")).toBeInViewport();
  });

  test("both lattice variants are hidden from assistive tech", async ({ page }) => {
    await page.goto("/");
    const svgs = page.locator("#capabilities .cap-fig svg");
    await expect(svgs).toHaveCount(2);
    for (let i = 0; i < 2; i++) await expect(svgs.nth(i)).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("#capabilities .cap-fig > div")).toHaveAttribute("aria-hidden", "true");
  });

  test("keyboard focus on a list item highlights its struts and dims the rest", async ({ page }, testInfo) => {
    await page.goto("/");
    const item = page.locator('#capabilities .cap-item[data-i="3"]');
    await item.scrollIntoViewIfNeeded();
    await item.focus();
    await expect(item).toBeFocused();
    const wide = testInfo.project.name !== "mobile";
    const svg = page.locator("#capabilities .cap-fig svg").nth(wide ? 1 : 0);
    const own = svg.locator('line.cap-strut[data-c="3"]').first();
    const other = svg.locator('line.cap-strut[data-c="0"]').first();
    await expect.poll(() => own.evaluate((el) => getComputedStyle(el).strokeWidth)).toBe("1.5px");
    expect(await own.evaluate((el) => getComputedStyle(el).strokeDasharray)).toBe("none");
    expect(await other.evaluate((el) => getComputedStyle(el).strokeDasharray)).not.toBe("none");
    expect(await other.evaluate((el) => getComputedStyle(el).opacity)).toBe("0.5");
  });

  test("tabbing walks the six items", async ({ page }) => {
    await page.goto("/");
    await page.locator("#capabilities .cap-item").first().focus();
    for (let i = 1; i < 6; i++) await page.keyboard.press("Tab");
    await expect(page.locator('#capabilities .cap-item[data-i="5"]')).toBeFocused();
  });

  test("diagram sits above the list on small screens", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "stacked layout only");
    await page.goto("/");
    const figure = await page.locator("#capabilities .cap-fig").boundingBox();
    const list = await page.locator("#capabilities ul").boundingBox();
    expect(figure!.y).toBeLessThan(list!.y);
  });

  test("no horizontal overflow, finished lattice without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("#capabilities h3").first()).toBeVisible();
    const clip = await page.locator("#capabilities .cap-draw").evaluate((el) => getComputedStyle(el).clipPath);
    expect(clip).toBe("none");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await context.close();
  });

  test("reduced motion shows the finished lattice immediately", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    expect(await page.locator("#capabilities .cap-draw").evaluate((el) => getComputedStyle(el).clipPath)).toBe("none");
    await context.close();
  });

  test("lattice draws in on reveal", async ({ page }) => {
    await page.goto("/");
    await page.locator("#capabilities .cap-fig").scrollIntoViewIfNeeded();
    await expect(page.locator("#capabilities .cap-fig")).toHaveAttribute("data-revealed", "");
  });
});
