import { expect, test } from "@playwright/test";

test.describe("about section", () => {
  test("heading, quote and name origin", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#about");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("The right technology connects the pieces.");
    await expect(section.locator("h2")).toHaveAttribute("id", "about-title");
    await expect(section.locator("blockquote")).toContainText(
      "Most businesses don’t need more software. They need their people, processes and systems to work better together.",
    );
    await expect(section.getByRole("heading", { level: 3 })).toHaveText("The Name & Origin");
    await expect(section).toContainText("ancient Persian concept of a bridge");
  });

  test("the hero-repeat lede, the pillars and the sourced story are gone", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#about");
    await expect(section).not.toContainText("Chinvat Bridge helps identify where technology can remove friction");
    await expect(section.locator("ul")).toHaveCount(0);
    await expect(section).not.toContainText("Measurable Outcomes");
    await expect(section).not.toContainText("In the Gathas");
    await expect(section).not.toContainText("Rashn");
    await expect(section).not.toContainText("Sources:");
  });

  test("the origin note links to the article that tells the full story", async ({ page }) => {
    await page.goto("/");
    const link = page.locator("#about").getByRole("link", { name: "Where the name comes from" });
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute("href", "/insights/where-the-name-chinvat-bridge-comes-from");
    await expect(link).toBeVisible();
    // Paper on ink, underlined: cobalt would fail contrast on the dark band.
    await expect(link).toHaveCSS("color", "rgb(246, 244, 239)");
    await expect(link).toHaveCSS("text-decoration-line", "underline");
    const box = await link.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    const response = await page.request.get("/insights/where-the-name-chinvat-bridge-comes-from");
    expect(response.status()).toBe(200);
  });

  test("the link's focus ring is paper, visible on ink", async ({ page }) => {
    await page.goto("/");
    const link = page.locator("#about").getByRole("link", { name: "Where the name comes from" });
    await link.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(link).toBeFocused();
    await expect(link).toHaveCSS("outline-color", "rgb(246, 244, 239)");
  });

  test("the mark is decorative and the section is the page's dark band", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#about");
    await expect(section.locator("figure svg")).toHaveAttribute("aria-hidden", "true");
    await expect(section).toHaveCSS("background-color", "rgb(11, 26, 38)");
    await expect(section.locator("figcaption")).toHaveCount(0);
  });

  test("the mark's two halves are tagged for the wipe", async ({ page }) => {
    await page.goto("/");
    const figure = page.locator("#about figure");
    await expect(figure.locator('path[data-part="left"]')).toHaveCount(1);
    // The right half is a group (the clipped chrome inside), not a bare path.
    await expect(figure.locator('[data-part="right"]')).toHaveCount(1);
  });

  test("on small screens the quote comes first, then the origin note, with the mark between", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "stacked layout only");
    await page.goto("/");
    const text = await page.locator("#about blockquote").boundingBox();
    const mark = await page.locator("#about figure").boundingBox();
    const note = await page.locator("#about h3").boundingBox();
    expect(text!.y).toBeLessThan(mark!.y);
    expect(mark!.y).toBeLessThan(note!.y);
  });

  test("no horizontal overflow and content is visible without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("#about blockquote")).toBeVisible();
    await expect(page.locator("#about figure")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await context.close();
  });

  test("reduced motion shows everything immediately", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    expect(await page.locator("#about figure").evaluate((el) => getComputedStyle(el.parentElement!).opacity)).toBe("1");
    await context.close();
  });
});
