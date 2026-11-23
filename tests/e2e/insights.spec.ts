import { expect, test, type Page } from "@playwright/test";
import { ONCE } from "./once";

// The rows below are checked against the live /insights archive (Supabase published_articles(),
// newest first), so the spec follows the data instead of hard-coded titles.
const ROWS = [{}, {}, {}] as { slug?: string }[];
const DRAFT_SLUG = "how-much-does-seo-cost-uk";

/** The href of every link matching `selector`, in page order. */
const articleLinks = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll((links) => links.map((a) => a.getAttribute("href")!));

test.describe("insights section", () => {
  test("the three newest published articles link to their pages", ONCE, async ({ page }) => {
    await page.goto("/insights");
    const archiveRows = page.locator('main ol > li');
    const expected = await Promise.all(
      [0, 1, 2].map(async (i) => ({
        slug: (await archiveRows.nth(i).locator("a").getAttribute("href"))!.replace("/insights/", ""),
        title: (await archiveRows.nth(i).locator("h2, h3").first().innerText()).trim(),
        category: "",
      })),
    );
    await page.goto("/");
    const section = page.locator("#insights");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("Ideas and observations.");
    await expect(section).toHaveAttribute("aria-labelledby", "insights-title");
    const rows = section.locator("ol > li");
    await expect(rows).toHaveCount(ROWS.length);
    for (const [index, { slug, title }] of expected.entries()) {
      const row = rows.nth(index);
      await expect(row.getByRole("heading", { level: 3 })).toHaveText(title);
      await expect(row.locator("a")).toHaveAttribute("href", `/insights/${slug}`);
      await expect(row.locator("time")).toHaveCount(0);
      await expect(row).not.toContainText("min read");
    }
    await expect(section.getByRole("link", { name: /All insights/ })).toHaveAttribute("href", "/insights");
    // No summary line under the heading: the row categories already say what the writing covers.
    await expect(section).not.toContainText("Practical thinking about");
  });

  test("drafts stay off the homepage and the archive; every listed article resolves", ONCE, async ({ page, request }) => {
    await page.goto("/insights");
    const archive = await articleLinks(page, 'main a[href^="/insights/"]');
    // Articles come from Supabase's published set only; drafts are previewed in the
    // editorial desk, so no page here should ever be marked as a draft.
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

  test("the archive lists published articles only; a draft slug is a 404", ONCE, async ({ page, request }) => {
    await page.goto("/insights");
    const links = await articleLinks(page, 'main a[href^="/insights/"]');
    expect(links.length).toBeGreaterThan(0);
    expect(new Set(links).size).toBe(links.length);
    expect(links).not.toContain(`/insights/${DRAFT_SLUG}`);
    expect((await request.get(`/insights/${DRAFT_SLUG}`)).status()).toBe(404);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain(DRAFT_SLUG);
    for (const href of links) expect(sitemap, href).toContain(href);
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

});
