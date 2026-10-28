import { expect, test } from "@playwright/test";

const PLATES = [
  { id: "services-ai", title: "AI & Automation Integration", href: "/insights/where-ai-can-save-your-business-time" },
  { id: "services-automation", title: "Automation & Workflows", href: "/insights/what-should-you-automate-first" },
  { id: "services-software", title: "Software & Web", href: "/insights/when-should-a-business-build-custom-software" },
  { id: "services-seo", title: "SEO & Digital Growth", href: "/pricing" },
];

test.describe("services section", () => {
  test("four plates with anchors, headings and correct links", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#services");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("Four disciplines, one way of working.");
    await expect(section.locator("ol > li > article")).toHaveCount(4);
    for (const { id, title, href } of PLATES) {
      const article = page.locator(`article#${id}`);
      await expect(article.getByRole("heading", { level: 3 })).toHaveText(title);
      await expect(article.locator(`a[href="${href}"]`)).toHaveCount(1);
    }
    await expect(section).toContainText("Also: Digital Strategy · Data Integration · Analytics & BI · Technical Architecture");
  });

  test("anchors scroll to their plate", async ({ page }) => {
    await page.goto("/#services-seo");
    await expect(page.locator("#services-seo")).toBeInViewport();
  });

  test("diagrams are decorative and links are large enough to tap", async ({ page }) => {
    await page.goto("/");
    const frames = page.locator("#services .svc-fig");
    await expect(frames).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(frames.nth(i).locator("> div").first()).toHaveAttribute("aria-hidden", "true");
    }
    const link = page.locator("#services-ai").getByRole("link", { name: /Read the article/ });
    await link.scrollIntoViewIfNeeded();
    const box = await link.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });

  test("no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    await page.locator("#services-seo").scrollIntoViewIfNeeded();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("content and finished diagrams are visible without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("#services-ai h3")).toBeVisible();
    const opacity = await page.locator("#services-seo .svc-fill").first().evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity).toBe("1");
    await context.close();
  });

  test("reduced motion shows the finished diagram immediately", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    const fill = page.locator("#services-ai .svc-fill").first();
    await fill.scrollIntoViewIfNeeded();
    expect(await fill.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    expect(await page.locator("#services-ai .svc-built").evaluate((el) => getComputedStyle(el).clipPath)).toBe("none");
    await context.close();
  });

  test("diagram draws in and builds on reveal", async ({ page }) => {
    await page.goto("/");
    const fill = page.locator("#services-software .svc-fill").first();
    await page.locator("#services-software").scrollIntoViewIfNeeded();
    await expect.poll(() => fill.evaluate((el) => getComputedStyle(el).opacity), { timeout: 5000 }).toBe("1");
  });
});
