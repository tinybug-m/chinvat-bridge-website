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

  test("plates are cut to strapline, title, description and link", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#services");
    // The tags and the "Outcome —" line live in SERVICES but are not shown on the homepage.
    await expect(section.locator("article ul")).toHaveCount(0);
    await expect(section).not.toContainText("Outcome");
    for (const removed of ["AI strategy", "Practical adoption", "Workflow automation", "Built around you", "Technical SEO"]) {
      await expect(section).not.toContainText(removed);
    }
    const ai = page.locator("#services-ai");
    await expect(ai.getByText("AI that serves the business")).toBeVisible();
    await expect(ai.getByText(/practical AI opportunities/)).toBeVisible();
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
    // Layout height (offsetHeight), not the bounding box: the plate may still be rising into
    // place, and a transform makes the box a hair under 44 (43.99997) from float rounding alone.
    expect(await link.evaluate((el) => (el as HTMLElement).offsetHeight)).toBeGreaterThanOrEqual(44);
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
    // The SEO plate has no .svc-fill group any more: its stems carry their own motion (.grow-y).
    const stem = page.locator("#services-seo .grow-y").first();
    // 0.5 is the stems' authored opacity: any other value means a motion state leaked into the static render.
    expect(await stem.evaluate((el) => getComputedStyle(el).opacity)).toBe("0.5");
    expect(await stem.evaluate((el) => getComputedStyle(el).scale)).toMatch(/^(none|1|1 1)$/);
    await context.close();
  });

  test("reduced motion shows the finished diagram immediately", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    // The AI plate's nodes carry their own motion (.pop / .rise-in) inside noclip groups; all must be finished.
    const moving = page.locator("#services-ai :is(.pop, .rise-in)");
    await moving.first().scrollIntoViewIfNeeded();
    for (const el of await moving.all()) {
      expect(await el.evaluate((node) => getComputedStyle(node).opacity)).toBe("1");
      expect(await el.evaluate((node) => getComputedStyle(node).scale)).toMatch(/^(none|1|1 1)$/);
    }
    for (const el of await page.locator("#services-ai .svc-built").all()) {
      expect(await el.evaluate((node) => getComputedStyle(node).clipPath)).toBe("none");
    }
    await context.close();
  });

  test("plate loops play only when revealed and in view, never under reduced motion", async ({ browser }) => {
    // CSS loop animations (CSSAnimation) on the AI plate; transitions have no animationName.
    const loopAnimations = (page: import("@playwright/test").Page, state: "running" | "any") =>
      page.locator("#services-ai .svc-fig .loop").evaluateAll(
        (nodes, wanted) =>
          nodes
            .flatMap((n) => n.getAnimations())
            .filter((a) => ((a as CSSAnimation).animationName ?? "").startsWith("ai-") && (wanted === "any" || a.playState === "running")).length,
        state,
      );

    const reduced = await browser.newContext({ reducedMotion: "reduce" });
    const rPage = await reduced.newPage();
    await rPage.goto("/");
    await rPage.locator("#services-ai .svc-fig").scrollIntoViewIfNeeded();
    await rPage.waitForTimeout(1500);
    expect(await rPage.locator("#services-ai .svc-fig").getAttribute("data-loop")).not.toBe("on");
    expect(await loopAnimations(rPage, "any")).toBe(0);
    await reduced.close();

    const ctx = await browser.newContext({ reducedMotion: "no-preference" });
    const page = await ctx.newPage();
    await page.goto("/");
    const fig = page.locator("#services-ai .svc-fig");
    // Not in view yet: the loop is off and nothing runs.
    expect(await fig.getAttribute("data-loop")).not.toBe("on");
    expect(await loopAnimations(page, "running")).toBe(0);
    await fig.scrollIntoViewIfNeeded();
    await expect(fig).toHaveAttribute("data-loop", "on", { timeout: 6000 });
    await expect.poll(() => loopAnimations(page, "running")).toBeGreaterThan(0);
    // Scrolled away again: the controller pauses it.
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(fig).toHaveAttribute("data-loop", "off");
    expect(await loopAnimations(page, "running")).toBe(0);
    await ctx.close();
  });

  test("diagram draws in and builds on reveal", async ({ page }) => {
    await page.goto("/");
    const fill = page.locator("#services-software .svc-fill").first();
    // On narrow screens the diagram sits below the text, so scroll to it directly.
    await page.locator("#services-software .svc-fig").scrollIntoViewIfNeeded();
    await expect.poll(() => fill.evaluate((el) => getComputedStyle(el).opacity), { timeout: 5000 }).toBe("1");
  });
});
