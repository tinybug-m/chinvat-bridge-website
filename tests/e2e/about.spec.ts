import { expect, test } from "@playwright/test";

test.describe("about section", () => {
  test("heading, philosophy copy, pillars and name origin", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#about");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("The right technology connects the pieces.");
    await expect(section.locator("h2")).toHaveAttribute("id", "about-title");
    await expect(section.locator("blockquote")).toContainText(
      "Most businesses don’t need more software. They need their people, processes and systems to work better together.",
    );
    await expect(section).toContainText("Chinvat Bridge helps identify where technology can remove friction");
    await expect(section.locator("ul > li")).toHaveText(["Strategy", "Engineering", "Automation", "Measurable Outcomes"]);
    await expect(section.getByRole("heading", { level: 3 })).toHaveText("The Name & Origin");
    await expect(section).toContainText("ancient Persian concept of a bridge");
  });

  test("the origin note says what the texts say, and names its sources", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#about");
    await expect(section).toContainText("In the Gathas, the oldest Zoroastrian texts, the bridge is where a person’s own conscience meets them.");
    await expect(section).toContainText("Later Middle Persian writings add Rashn, who weighs deeds on a balance that favours no one.");
    await expect(section).toContainText("Sources: Yasna 46.10–11, 51.13; Mainyo-i Khrad 2");
  });

  test("the mark and its callouts: mark is decorative, captions are text", async ({ page }) => {
    await page.goto("/");
    const figure = page.locator("#about figure");
    await expect(figure.locator("svg")).toHaveAttribute("aria-hidden", "true");
    await expect(figure).toContainText("The way it works today");
    await expect(figure).toContainText("The system it becomes");
  });

  test("on small screens the text comes first, then the mark, then the note", async ({ page }, testInfo) => {
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
