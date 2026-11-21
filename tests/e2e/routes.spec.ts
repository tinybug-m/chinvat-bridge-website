import { expect, test } from "@playwright/test";

// Routes still in the old design must keep working while the homepage changes.
const PAGES = [
  "/pricing",
  "/services/seo",
  "/services/ai-integration",
  "/services/workflow-automation",
  "/services/custom-software",
  "/insights",
  "/insights/what-should-you-automate-first",
  "/insights/when-should-a-business-build-custom-software",
  "/insights/where-ai-can-save-your-business-time",
  "/insights/why-your-website-isnt-bringing-you-customers",
  "/insights/where-the-name-chinvat-bridge-comes-from",
  "/insights/replace-spreadsheets-with-custom-software",
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
  ["/services", "/#services"],
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

  // Design-review pages run under `next dev` only (owner, 21 Nov 2026).
  for (const path of ["/bridge-studies", "/hero-studies/crossing", "/hero-studies/monument", "/hero-studies/portal"]) {
    test(`${path} is not served in production`, async ({ request }) => {
      expect((await request.get(path)).status()).toBe(404);
    });
  }

  test("unknown paths return 404", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
  });

  // Each inner page describes itself in social cards, not the homepage it would otherwise inherit.
  for (const [path, title] of [
    ["/insights", "Insights: AI, Automation, Software & SEO for SMEs"],
    ["/pricing", "SEO Packages & Pricing"],
    ["/services/seo", "SEO Services for Small Businesses"],
    ["/services/ai-integration", "AI Consultancy & Integration for Small Businesses"],
    ["/services/workflow-automation", "Business Process Automation & Integration"],
    ["/services/custom-software", "Custom Software Development for Small Businesses"],
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
      expect.arrayContaining(["/", "/pricing", "/services/seo", "/services/ai-integration", "/services/workflow-automation", "/services/custom-software", "/insights", "/privacy", "/terms", "/insights/what-should-you-automate-first"]),
    );
    expect(lastmodOf("/pricing")).toBeUndefined();
    expect(lastmodOf("/services/seo")).toBe("2026-11-19");
    // Revised 21 Nov 2026: unverifiable delivery claims replaced (owner decision).
    expect(lastmodOf("/services/custom-software")).toBe("2026-11-21");
    expect(lastmodOf("/privacy")).toBe("2026-11-21");
    expect(lastmodOf("/insights/what-should-you-automate-first")).toBe("2026-09-15");
    // A revised article carries its own updated date, and the index changes when its newest article does.
    expect(lastmodOf("/insights/why-your-website-isnt-bringing-you-customers")).toBe("2026-11-19");
    // Published 20 Nov 2026: the index takes the newest article's date.
    expect(lastmodOf("/insights/replace-spreadsheets-with-custom-software")).toBe("2026-11-20");
    expect(lastmodOf("/insights")).toBe("2026-11-20");
  });

  // Drafts live in the post registry with `draft: true`; a production build must never expose them.
  test("draft articles are not served, listed or in the sitemap", async ({ page, request }) => {
    // Remove a slug from this list when its article is published.
    const drafts = [
      // Published 20 Nov, back to draft 21 Nov until /pricing defines its content unit.
      "how-much-does-seo-cost-uk",
      "how-to-connect-business-systems",
      "how-to-choose-an-ai-consultant",
      "what-a-technical-seo-audit-should-include",
      "ai-subscriptions-vs-ai-integration",
      "uk-small-business-ai-adoption-2026",
      "how-to-choose-a-technology-partner",
      "does-your-business-need-a-client-portal",
      "how-we-built-this-site",
    ];
    const sitemap = await (await request.get("/sitemap.xml")).text();
    await page.goto("/insights");
    const listed = await page.locator("main a[href^='/insights/']").evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    for (const slug of drafts) {
      expect((await request.get(`/insights/${slug}`)).status(), slug).toBe(404);
      expect(sitemap).not.toContain(slug);
      expect(listed).not.toContain(`/insights/${slug}`);
    }
  });

  // Drafts may link to each other (WhenPublished), and service pages list drafts in advance; none of
  // it may surface as a link to a page that doesn't exist.
  test("no page in the sitemap links to a missing page on the site", async ({ page, request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, loc]) => new URL(loc).pathname);
    const targets = new Map<string, string>();
    for (const path of paths) {
      await page.goto(path);
      const hrefs = await page.locator("a[href^='/']").evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
      for (const href of hrefs) {
        const target = href.split("#")[0].split("?")[0] || "/";
        if (!targets.has(target)) targets.set(target, path);
      }
    }
    for (const [target, from] of targets) {
      expect((await request.get(target, { maxRedirects: 0 })).status(), `${target} (linked from ${from})`).toBeLessThan(400);
    }
  });

  // Google also reads quoted strings in the page's serialised data as links. A footer key of
  // href + label ("/pricingPricing") was crawled that way and 404'd, so every path-like string in
  // the raw HTML must be a page or file that exists.
  test("no path-like string in a sitemap page's HTML is a missing page", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, loc]) => new URL(loc).pathname);
    const strings = new Map<string, string>();
    for (const path of paths) {
      const html = await (await request.get(path)).text();
      for (const [, found] of html.matchAll(/(?:"|\\")(\/[A-Za-z0-9_][A-Za-z0-9_\-./%~]*)(?=\\?")/g)) {
        if (!found.startsWith("/_next/static/") && !strings.has(found)) strings.set(found, path);
      }
    }
    for (const [found, from] of strings) {
      expect((await request.get(found)).status(), `"${found}" (in the HTML of ${from})`).toBeLessThan(400);
    }
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
