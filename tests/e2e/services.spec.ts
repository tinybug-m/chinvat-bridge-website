import { expect, test } from "@playwright/test";

const PLATES = [
  { id: "services-ai", title: "AI & Automation Integration", href: "/services/ai-integration" },
  { id: "services-automation", title: "Automation & Workflows", href: "/services/workflow-automation" },
  { id: "services-software", title: "Software & Web", href: "/services/custom-software" },
  { id: "services-seo", title: "SEO & Digital Growth", href: "/services/seo" },
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
    await expect(page.locator("#services-software a[href^='/services/']")).toHaveClass(/shadow/);
    await expect(page.locator("#services-ai a[href^='/services/']")).not.toHaveClass(/shadow/);
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
    const link = page.locator("#services-ai").getByRole("link", { name: /Explore the service/ });
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
    // The diagrams are authored in their END state; the START pose only exists in the loop.
    const stem = page.locator("#services-seo .seo-stem").first();
    // 0.5 is the stems' authored opacity: any other value means a motion state leaked into the static render.
    expect(await stem.evaluate((el) => getComputedStyle(el).opacity)).toBe("0.5");
    expect(await stem.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
    await context.close();
  });

  test("reduced motion shows the finished diagram immediately", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    // The AI plate morphs START -> END in its loop; without motion it must sit in the END state.
    await page.locator("#services-ai .svc-fig").scrollIntoViewIfNeeded();
    for (const el of await page.locator("#services-ai :is(.ai-face-end, .ai-spoke, .ai-rim, .ai-ring)").all()) {
      expect(await el.evaluate((node) => getComputedStyle(node).opacity)).toBe("1");
      expect(await el.evaluate((node) => getComputedStyle(node).transform)).toBe("none");
    }
    for (const el of await page.locator("#services-ai :is(.ai-face-start, .ai-merge, .ai-guess)").all()) {
      expect(await el.evaluate((node) => getComputedStyle(node).opacity)).toBe("0");
    }
    for (const el of await page.locator("#services-ai .ai-travel").all()) {
      expect(await el.evaluate((node) => getComputedStyle(node).transform)).toBe("none");
    }
    // The other three plates share the .mx-* morph and must sit in END too.
    for (const el of await page.locator("#services :is(.mx-end, .mx-in, .mx-grow, .mx-accent)").all()) {
      expect(await el.evaluate((node) => getComputedStyle(node).opacity)).not.toBe("0");
    }
    for (const el of await page.locator("#services :is(.mx-start, .mx-guess)").all()) {
      expect(await el.evaluate((node) => getComputedStyle(node).opacity)).toBe("0");
    }
    for (const el of await page.locator("#services :is(.mx-travel, .mx-grow)").all()) {
      expect(await el.evaluate((node) => getComputedStyle(node).transform)).toBe("none");
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

});
