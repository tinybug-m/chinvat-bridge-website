import { expect, test, type Page } from "@playwright/test";

const SERVICE_PAGES = [
  { path: "/services/ai-integration", name: "AI Integration", h1: "AI integration that earns its place in your business", cta: "Discuss an AI project" },
  { path: "/services/workflow-automation", name: "Workflow Automation", h1: "Workflow automation for the work between your systems", cta: "Describe a process" },
  { path: "/services/custom-software", name: "Custom Software", h1: "Custom software built around the way your business works", cta: "Describe what you need" },
];

/** Every JSON-LD block on the page, parsed. */
async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.map((text) => JSON.parse(text));
}

test.describe("service pages", () => {
  for (const service of SERVICE_PAGES) {
    test(`${service.path} names its service, links to the conversation and describes itself in structured data`, async ({ page }) => {
      const response = await page.goto(service.path);
      expect(response?.status()).toBe(200);

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(service.h1);
      await expect(page.locator("main h1")).toHaveCount(1);
      // The first call to action opens the homepage conversation; these services are quoted, not on /pricing.
      await expect(page.getByRole("link", { name: service.cta }).first()).toHaveAttribute("href", "/#contact");

      const data = await jsonLd(page);
      const svc = data.find((block) => block["@type"] === "Service");
      expect(svc?.name).toBe(service.name);
      expect((svc?.provider as { "@id": string })["@id"]).toMatch(/\/#organization$/);
      expect(svc?.url).toMatch(new RegExp(`${service.path}$`));
      expect(svc).not.toHaveProperty("offers");
      const crumbs = data.find((block) => block["@type"] === "BreadcrumbList")?.itemListElement as { name: string }[];
      expect(crumbs.map((item) => item.name)).toEqual(["Home", service.name]);
    });
  }

  test("the footer links each discipline to its own page", async ({ page }) => {
    await page.goto("/insights");
    const disciplines = page.getByRole("navigation", { name: "Footer: Disciplines" }).getByRole("link");
    await expect(disciplines).toHaveCount(4);
    expect(await disciplines.evaluateAll((els) => els.map((el) => el.getAttribute("href")))).toEqual([
      "/services/ai-integration",
      "/services/workflow-automation",
      "/services/custom-software",
      "/services/seo",
    ]);
  });
});

test.describe("pricing", () => {
  test("summarises the terms and links each quoted service to its page", async ({ page }) => {
    await page.goto("/pricing");
    const billing = page.locator("#billing");
    await expect(billing.getByRole("heading", { level: 2 })).toHaveText("Billing and terms.");
    await expect(billing).toContainText("exclusive of any applicable tax");
    await expect(billing).toContainText("30 days’ notice");
    await expect(billing.getByRole("link", { name: "Read the full terms" })).toHaveAttribute("href", "/terms");
    expect(await page.locator("#other-services a").evaluateAll((els) => els.map((el) => el.getAttribute("href")))).toEqual(
      SERVICE_PAGES.map((service) => service.path),
    );
    const crumbs = (await jsonLd(page)).find((block) => block["@type"] === "BreadcrumbList")?.itemListElement as { name: string }[];
    expect(crumbs.map((item) => item.name)).toEqual(["Home", "Pricing"]);
  });
});

test.describe("article structured data", () => {
  test("ties the article to the site's Organization and breadcrumbs from Home", async ({ page }) => {
    await page.goto("/insights/what-should-you-automate-first");
    const data = await jsonLd(page);
    const article = data.find((block) => block["@type"] === "Article");
    expect((article?.publisher as { "@id": string })["@id"]).toMatch(/\/#organization$/);
    expect((article?.author as { "@id": string })["@id"]).toMatch(/\/#organization$/);
    expect(article?.image).toMatch(/opengraph-image\.png$/);
    const crumbs = data.find((block) => block["@type"] === "BreadcrumbList")?.itemListElement as { name: string }[];
    expect(crumbs.map((item) => item.name)).toEqual(["Home", "Insights", "What Should You Automate First?"]);
  });
});
