import { expect, test, type Page } from "@playwright/test";

const ROWS = [
  { slug: "where-the-name-chinvat-bridge-comes-from", title: "Where the Name Chinvat Bridge Comes From", category: "Our Name" },
  { slug: "where-ai-can-save-your-business-time", title: "Where AI Can Actually Save Your Business Time", category: "AI & Workflows" },
  { slug: "what-should-you-automate-first", title: "What Should You Automate First?", category: "Process Automation" },
];

/** The href of every link matching `selector`, in page order. */
const articleLinks = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll((links) => links.map((a) => a.getAttribute("href")!));

test.describe("insights section", () => {
  test("the three newest published articles link to their pages", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#insights");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("Ideas and observations.");
    await expect(section).toHaveAttribute("aria-labelledby", "insights-title");
    const rows = section.locator("ol > li");
    await expect(rows).toHaveCount(ROWS.length);
    for (const [index, { slug, title, category }] of ROWS.entries()) {
      const row = rows.nth(index);
      await expect(row.getByRole("heading", { level: 3 })).toHaveText(title);
      await expect(row.locator("a")).toHaveAttribute("href", `/insights/${slug}`);
      await expect(row).toContainText(category);
      await expect(row.locator("time")).toHaveCount(0);
      await expect(row).not.toContainText("min read");
    }
    await expect(section.getByRole("link", { name: /All insights/ })).toHaveAttribute("href", "/insights");
    // No summary line under the heading: the row categories already say what the writing covers.
    await expect(section).not.toContainText("Practical thinking about");
  });

  test("drafts stay off the homepage, even under next dev, while the archive keeps every article", async ({ page, request }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "once is enough");
    await page.goto("/insights");
    const archive = await articleLinks(page, 'main a[href^="/insights/"]');
    // Under `next dev` the archive also lists drafts for review, each marked on its own page;
    // a production build serves none, so there the list is empty and the rows above are the check.
    const drafts: string[] = [];
    for (const href of archive) {
      const response = await request.get(href);
      expect(response.status(), href).toBe(200);
      if ((await response.text()).includes("Draft, not published")) drafts.push(href);
    }

    await page.goto("/");
    const home = await articleLinks(page, "#insights ol a");
    expect(home).toHaveLength(ROWS.length);
    for (const href of home) {
      expect(drafts, `${href} is a draft`).not.toContain(href);
      expect(archive, `${href} is in the archive`).toContain(href);
    }
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
    await expect(page.locator("#insights ol > li")).toHaveCount(ROWS.length);
    await expect(page.locator("#insights ol a").first()).toBeVisible();
    await context.close();
  });
});
