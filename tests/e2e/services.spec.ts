import { expect, test } from "@playwright/test";

const PLATES = [
  { id: "services-ai", title: "AI & Automation Integration", href: "/insights/where-ai-can-save-your-business-time" },
  { id: "services-automation", title: "Automation & Workflows", href: "/insights/what-should-you-automate-first" },
  { id: "services-software", title: "Software & Web", href: "/insights/when-should-a-business-build-custom-software" },
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

  test("the energy wire, not scrolling, reveals each plate, which then holds without replaying", async ({ page }) => {
    await page.goto("/");
    const fig = page.locator("#services-ai .svc-fig");
    const port = page.locator(".energy-port").first();
    // Scroll so the figure's top edge sits at a share of the viewport height.
    const topAt = (share: number) =>
      page.evaluate((share) => {
        const top = document.querySelector("#services-ai .svc-fig")!.getBoundingClientRect().top + scrollY;
        window.scrollTo(0, top - innerHeight * share);
      }, share);
    // The top edge just on screen: in view, but the energy has not reached it yet.
    await topAt(0.9);
    await page.waitForTimeout(600);
    await expect(fig).not.toHaveAttribute("data-revealed");
    await expect(port).not.toHaveAttribute("data-lit");
    // Its port above the trigger line: the energy arrives, lights the port and reveals the plate.
    await topAt(0.3);
    await expect(port).toHaveAttribute("data-lit", "", { timeout: 3000 });
    await expect(fig).toHaveAttribute("data-revealed", "");
    // The story plays once and holds at END; scrolling away and back does not replay it.
    const time = () =>
      fig.evaluate((el) =>
        el
          .getAnimations({ subtree: true })
          .filter((a) => (a.effect as KeyframeEffect).target?.classList.contains("loop"))
          .map((a) => Math.round(Number(a.currentTime)))
          .join(),
      );
    await expect.poll(async () => fig.evaluate((el) => el.getAnimations({ subtree: true }).some((a) => a.playState === "running")), { timeout: 10000 }).toBe(false);
    const held = await time();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await topAt(0.3);
    await page.waitForTimeout(800);
    expect(await time()).toBe(held);
  });

  test("a plate's nodes each stop on their END pose, never running on into the loop's return", async ({ page }) => {
    await page.goto("/");
    // Every frame, the furthest pose any loop of each plate shows: its first END hold is at 80%, and
    // some keyframes start back toward START right after it.
    await page.evaluate(() => {
      const furthest: number[] = [];
      (window as unknown as { furthest: number[] }).furthest = furthest;
      const tick = () => {
        document.querySelectorAll("#services .svc-fig").forEach((fig, i) => {
          for (const a of fig.getAnimations({ subtree: true })) {
            if (!(a.effect as KeyframeEffect).target?.classList.contains("loop")) continue;
            const { currentIteration, progress } = a.effect!.getComputedTiming();
            if (progress != null) furthest[i] = Math.max(furthest[i] ?? 0, (currentIteration ?? 0) + progress);
          }
        });
        requestAnimationFrame(tick);
      };
      tick();
    });
    // Read down through all four plates, then give the last one time to finish.
    const bottom = await page.evaluate(() => document.querySelector("#services-seo")!.getBoundingClientRect().bottom + scrollY);
    for (let y = 0; y < bottom; y += 150) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.waitForTimeout(150);
    }
    await expect
      .poll(() => page.evaluate(() => document.querySelectorAll("#services .svc-fig[data-revealed]").length))
      .toBe(4);
    await page.waitForTimeout(4000);
    const furthest = await page.evaluate(() => (window as unknown as { furthest: number[] }).furthest);
    expect(furthest.length).toBeGreaterThan(0);
    for (const pose of furthest) expect(pose).toBeLessThanOrEqual(0.801);
  });

  test("each diagram opens on its START pose and morphs to END", async ({ page }) => {
    await page.goto("/");
    for (const slug of ["ai", "automation", "software", "seo"]) {
      const fig = page.locator(`#services-${slug} .svc-fig`);
      // On narrow screens the diagram sits below the text, so scroll to it directly.
      await fig.scrollIntoViewIfNeeded();
      await expect(fig).toHaveAttribute("data-loop", "on", { timeout: 6000 });
      // Seek every loop animation to 0% and to the END hold (80%): START shows its scaffolding, END its built detail.
      const at = (pct: number) =>
        fig.evaluate((el, pct) => {
          for (const a of el.getAnimations({ subtree: true })) {
            a.pause();
            const { delay = 0, duration } = a.effect!.getTiming();
            a.currentTime = delay + (pct / 100) * Number(duration);
          }
          const start = el.querySelector(".mx-guess, .mx-start, .ai-guess") as Element;
          const end = el.querySelector(".mx-in, .ai-spoke") as Element;
          return [getComputedStyle(start).opacity, getComputedStyle(end).opacity];
        }, pct);
      expect(await at(0)).toEqual(["1", "0"]);
      expect(await at(80)).toEqual(["0", "1"]);
    }
  });
});
