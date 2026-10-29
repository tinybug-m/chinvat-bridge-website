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
    // The supporting capabilities are listed once, under Capabilities.
    await expect(section).not.toContainText("Also:");
  });

  test("tags carry no separator glyphs and plates are not stamped copies", async ({ page }) => {
    await page.goto("/");
    const article = page.locator("#services-ai");
    await expect(article.locator("ul > li")).toHaveText(["AI strategy", "LLM applications", "Automated workflows", "Internal AI tools"]);
    // No generated content on a tag, so a wrapped line never starts on a separator.
    const before = await article.locator("ul > li").first().evaluate((el) => getComputedStyle(el, "::before").content);
    expect(["none", "normal"]).toContain(before);
    // Plates differ in type scale and in how the link is set.
    const sizes = await page.locator("#services article h3").evaluateAll((els) => els.map((el) => getComputedStyle(el).fontSize));
    expect(new Set(sizes).size).toBeGreaterThan(1);
    await expect(page.locator("#services-software a[href^='/insights/']")).toHaveClass(/shadow/);
    await expect(page.locator("#services-ai a[href^='/insights/']")).not.toHaveClass(/shadow/);
  });

  test("the software plate sits on a full-bleed haze band", async ({ page }) => {
    await page.goto("/");
    const band = await page.locator("#services-software").evaluate((el) => {
      const style = getComputedStyle(el, "::before");
      return { bg: style.backgroundColor, width: parseFloat(style.width), vw: document.documentElement.clientWidth };
    });
    expect(band.bg).toBe("rgb(236, 238, 239)");
    expect(Math.round(band.width)).toBeGreaterThanOrEqual(band.vw);
  });

  test("the SEO chart runs to the viewport edge on purpose, with no sideways scroll", async ({ page }) => {
    await page.goto("/");
    const edge = await page.locator("#services-seo .svc-built line").first().evaluate((el) => el.getBoundingClientRect().right);
    const vw = await page.evaluate(() => document.documentElement.clientWidth);
    expect(Math.round(edge)).toBe(vw);
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
      await expect(frames.nth(i).locator("> svg")).toHaveAttribute("aria-hidden", "true");
    }
    // Frameless: no registration marks, Drawn/Built captions or seam inside the plates.
    await expect(page.locator("#services").getByText(/^(Drawn|Built)$/)).toHaveCount(0);
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
    // On narrow screens the diagram sits below the text, so scroll to it directly.
    await page.locator("#services-software .svc-fig").scrollIntoViewIfNeeded();
    await expect.poll(() => fill.evaluate((el) => getComputedStyle(el).opacity), { timeout: 5000 }).toBe("1");
  });
});
