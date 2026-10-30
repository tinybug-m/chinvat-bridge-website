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

  test("names only: the per-item descriptions are not rendered", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#capabilities");
    await expect(section.locator("ul > li")).toHaveCount(6);
    // Each cell is a category label and a title, nothing more.
    for (const li of await section.locator("ul > li").all()) {
      await expect(li.locator("p")).toHaveCount(1);
      await expect(li.locator("h3")).toHaveCount(1);
    }
    await expect(section.locator("ul > li").first()).toContainText("AI");
    for (const description of [
      "Large language models, AI integrations",
      "Workflow automation, API integrations",
      "Modern web applications, internal tools",
      "Data integration, structured information",
      "Websites and digital experiences",
      "Technical SEO, site architecture",
    ]) {
      await expect(section).not.toContainText(description);
    }
  });

  test("the six sit in a three-column grid on wide screens", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "three columns only apply from lg up");
    await page.goto("/");
    const boxes = await page.locator("#capabilities ul > li").evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { left: Math.round(r.left), top: Math.round(r.top) };
      }),
    );
    expect(new Set(boxes.map((b) => b.left)).size).toBe(3);
    expect(new Set(boxes.map((b) => b.top)).size).toBe(2);
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
    // Nothing inside the section runs past its own edge either (the supporting line wraps between names).
    const sectionOverflow = await page
      .locator("#capabilities")
      .evaluate((section) => [...section.querySelectorAll("li, p")].some((el) => el.scrollWidth > el.clientWidth + 1));
    expect(sectionOverflow).toBe(false);
    await context.close();
  });
});
