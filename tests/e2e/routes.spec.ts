import { expect, test } from "@playwright/test";

// Routes still in the old design must keep working while the homepage changes.
const PAGES = [
  "/pricing",
  "/services/seo",
  "/insights",
  "/insights/what-should-you-automate-first",
  "/insights/when-should-a-business-build-custom-software",
  "/insights/where-ai-can-save-your-business-time",
  "/insights/why-your-website-isnt-bringing-you-customers",
  "/privacy",
  "/terms",
  "/login",
  "/client-portal",
  "/subscribe/success",
  "/subscribe/cancelled",
  "/subscribe/error",
];

const REDIRECTS: [string, string][] = [
  ["/dashboard", "/login"],
  ["/admin", "/login"],
  ["/subscribe/details", "/pricing"],
];

test.describe("routes", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1440, "route checks run once, on desktop");

  for (const path of PAGES) {
    test(`${path} renders`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("main").first()).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  for (const [from, to] of REDIRECTS) {
    test(`${from} redirects to ${to}`, async ({ page }) => {
      await page.goto(from);
      await expect(page).toHaveURL(new RegExp(`${to}$`));
    });
  }

  test("unknown paths return 404", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
  });

  // Each inner page describes itself in social cards, not the homepage it would otherwise inherit.
  for (const [path, title] of [
    ["/insights", "Insights"],
    ["/pricing", "SEO & Content Pricing"],
    ["/services/seo", "SEO Services & Digital Growth"],
    ["/privacy", "Privacy Policy"],
    ["/terms", "Terms of Service"],
  ]) {
    test(`${path} has its own canonical, Open Graph and Twitter metadata`, async ({ page }) => {
      await page.goto(path);
      const content = (selector: string) => page.locator(selector).first().getAttribute("content");
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));
      expect(await content('meta[property="og:url"]')).toMatch(new RegExp(`${path}$`));
      expect(await content('meta[property="og:title"]')).toBe(`${title} — Chinvat Bridge`);
      expect(await content('meta[name="twitter:title"]')).toBe(`${title} — Chinvat Bridge`);
      const description = await content('meta[name="description"]');
      expect(await content('meta[property="og:description"]')).toBe(description);
      expect(await content('meta[name="twitter:description"]')).toBe(description);
      expect(await content('meta[name="twitter:image"]')).toMatch(/opengraph-image\.png$/);
    });
  }

  test("sitemap lastmod comes from content dates, never the build time", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, body]) => ({
      loc: body.match(/<loc>(.*?)<\/loc>/)?.[1] ?? "",
      lastmod: body.match(/<lastmod>(.*?)<\/lastmod>/)?.[1],
    }));
    const lastmodOf = (suffix: string) => entries.find((entry) => entry.loc.endsWith(suffix))?.lastmod;
    expect(entries.map((entry) => new URL(entry.loc).pathname)).toEqual(
      expect.arrayContaining(["/", "/pricing", "/insights", "/privacy", "/terms", "/insights/what-should-you-automate-first"]),
    );
    expect(lastmodOf("/pricing")).toBeUndefined();
    expect(lastmodOf("/privacy")).toBe("2026-09-14");
    expect(lastmodOf("/insights/what-should-you-automate-first")).toBe("2026-09-15");
    // The index changes when its newest article does.
    expect(lastmodOf("/insights")).toBe("2026-10-29");
  });

  test("sitemap and robots respond", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("<urlset");
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("Sitemap:");
  });
});
