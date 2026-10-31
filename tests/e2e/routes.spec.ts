import { expect, test } from "@playwright/test";

// Routes still in the old design must keep working while the homepage changes.
const PAGES = [
  "/pricing",
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

  test("sitemap and robots respond", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("<urlset");
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("Sitemap:");
  });
});
