import { type Page, expect, test } from "@playwright/test";

/*
 * The homepage hero, THE CROSSING (CrossingHero.tsx): the engraved chart,
 * the copy beside it and the four tiers as the discipline links.
 */

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(String(error)));
  return errors;
}

test.describe("hero", () => {
  test("content, links and one h1, with no console errors", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/");
    const hero = page.locator("section[data-hero]");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Cross the bridge\.\s*Enter the future\./);
    await expect(hero.getByText("UK Based // Working Globally")).toBeVisible();
    await expect(
      hero.getByText(
        "We bridge the gap between complex challenges and intelligent technology: AI and automation, custom software, SEO, and data analytics.",
      ),
    ).toBeVisible();
    await expect(hero.getByRole("link", { name: "Start a conversation" })).toHaveAttribute("href", "/#contact");
    await expect(hero.getByRole("link", { name: "Explore services" })).toHaveAttribute("href", "/#services");

    // The chart's tiers are the discipline links, at every width: named in full, large enough to tap.
    const index = hero.locator('nav[aria-label="Disciplines"]').getByRole("link");
    const expected = [
      ["AI integration", "/#services-ai"],
      ["Automation & workflows", "/#services-automation"],
      ["Software & web", "/#services-software"],
      ["SEO & growth", "/services/seo"],
    ];
    await expect(index).toHaveCount(4);
    for (const [i, [label, href]] of expected.entries()) {
      await expect(index.nth(i)).toHaveAccessibleName(label);
      await expect(index.nth(i)).toHaveAttribute("href", href);
      const box = await index.nth(i).boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    // The eyebrow is plain text, not mono capitals.
    const eyebrow = await hero.getByText("UK Based // Working Globally").evaluate((el) => {
      const style = getComputedStyle(el);
      return { transform: style.textTransform, family: style.fontFamily };
    });
    expect(eyebrow.transform).toBe("none");
    expect(eyebrow.family).not.toMatch(/mono/i);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBe(0);
    expect(errors).toEqual([]);
  });

  test("a tier lights while its link is hovered", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "no hover on touch");
    await page.goto("/");
    await page.waitForTimeout(3500);
    const glow = page.locator('.cx-tier[data-i="1"] .cx-glow');
    await expect.poll(() => glow.evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
    await page.locator('.cx-link[data-i="1"]').hover();
    await expect.poll(() => glow.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });

  // The H1 is the LCP on desktop; on narrow screens the lede may cover more
  // area. Either way it is server-rendered hero text, never the chart.
  test("the largest contentful paint is the hero text", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
    const lcp = await page.evaluate(
      () =>
        new Promise<string>((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries() as (PerformanceEntry & { element?: Element | null })[];
            const element = entries[entries.length - 1]?.element;
            resolve(
              element?.closest("h1")
                ? "h1"
                : element?.closest("section[data-hero]") && element.tagName === "P"
                  ? "lede"
                  : (element?.outerHTML.slice(0, 120) ?? "none"),
            );
          }).observe({ type: "largest-contentful-paint", buffered: true });
        }),
    );
    if (testInfo.project.name === "desktop") expect(lcp).toBe("h1");
    else expect(["h1", "lede"]).toContain(lcp);
  });

  test("reduced motion: no intro animation and no sweep down the tiers", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = collectErrors(page);
    await page.goto("/", { waitUntil: "load" });
    expect(await page.locator("h1").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
    expect(await page.locator(".cx-glow").first().evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
    expect(errors).toEqual([]);
  });
});
