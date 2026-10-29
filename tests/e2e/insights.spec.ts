import { expect, test } from "@playwright/test";

const ROWS = [
  { slug: "where-the-name-chinvat-bridge-comes-from", title: "Where the Name Chinvat Bridge Comes From", category: "Our Name" },
  { slug: "where-ai-can-save-your-business-time", title: "Where AI Can Actually Save Your Business Time", category: "AI & Workflows" },
  { slug: "what-should-you-automate-first", title: "What Should You Automate First?", category: "Process Automation" },
  { slug: "why-your-website-isnt-bringing-you-customers", title: "Why Your Website Isn't Bringing You Enough Customers", category: "SEO & Discovery" },
  { slug: "when-should-a-business-build-custom-software", title: "When Should a Business Build Custom Software?", category: "Software Strategy" },
];

test.describe("insights section", () => {
  test("five index rows link to their articles", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#insights");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("Ideas and observations.");
    await expect(section).toHaveAttribute("aria-labelledby", "insights-title");
    const rows = section.locator("ol > li");
    await expect(rows).toHaveCount(5);
    for (const [index, { slug, title, category }] of ROWS.entries()) {
      const row = rows.nth(index);
      await expect(row.getByRole("heading", { level: 3 })).toHaveText(title);
      await expect(row.locator("a")).toHaveAttribute("href", `/insights/${slug}`);
      await expect(row).toContainText(category);
      await expect(row.locator("time")).toHaveCount(0);
      await expect(row).not.toContainText("min read");
    }
    await expect(section.getByRole("link", { name: /All insights/ })).toHaveAttribute("href", "/insights");
  });

  test("rows and the footer link are large enough to tap, with no overflow", async ({ page }) => {
    await page.goto("/");
    await page.locator("#insights").scrollIntoViewIfNeeded();
    for (const link of await page.locator("#insights ol a").all()) {
      await link.scrollIntoViewIfNeeded();
      expect((await link.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(64);
    }
    const all = page.getByRole("link", { name: /All insights/ });
    await all.scrollIntoViewIfNeeded();
    expect((await all.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("a row is reachable by keyboard and shows the cobalt hover state", async ({ page }, testInfo) => {
    await page.goto("/");
    const first = page.locator("#insights ol a").first();
    await first.focus();
    await expect(first).toBeFocused();
    if (testInfo.project.name === "desktop") {
      await first.scrollIntoViewIfNeeded();
      await first.hover();
      const color = await first.locator("h3").evaluate((el) => getComputedStyle(el).color);
      expect(color).not.toBe("rgb(14, 26, 36)");
    }
  });

  test("content is visible without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("#insights ol > li")).toHaveCount(5);
    await expect(page.locator("#insights ol a").first()).toBeVisible();
    await context.close();
  });
});
