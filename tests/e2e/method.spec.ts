import { expect, test } from "@playwright/test";

/*
 * 03 Method: one crossing in four steps, each a plate of the same stone path.
 * No WebGL stage runs here; each plate draws in when the energy wire from the
 * hero reaches it, in order, and the wire ends on the last.
 */

const STEPS = ["Discover", "Define", "Build", "Improve"];

test.describe("method", () => {
  test("outline, copy and no overflow", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.goto("/");
    const section = page.locator("#method");
    await expect(section).toHaveAttribute("aria-labelledby", "method-title");
    await expect(section.getByRole("heading", { level: 2, name: "How we work." })).toBeVisible();
    await expect(section.getByRole("heading", { level: 3 })).toHaveText(STEPS);
    await expect(section.getByText("We understand your business, your existing systems and the problems worth solving.")).toBeAttached();
    await expect(section.getByRole("link", { name: "Start a conversation" })).toHaveAttribute("href", "/#contact");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors.filter((error) => /method/i.test(error))).toEqual([]);
  });

  test("four decorative plates, no 3D stage, nothing tied to scroll", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#method");
    await expect(section.locator("[data-stage]")).toHaveCount(0);
    await expect(section.locator("canvas")).toHaveCount(0);
    await expect(section.locator("[data-method-root]")).toHaveCount(0);
    const plates = section.locator("li svg");
    await expect(plates).toHaveCount(4);
    for (let index = 0; index < 4; index++) {
      await expect(plates.nth(index)).toHaveAttribute("aria-hidden", "true");
      await expect(plates.nth(index).locator("text")).toHaveCount(0);
    }
    // No step numerals above the titles: the plates already show the order.
    await expect(section.locator("li p.font-label")).toHaveCount(0);
  });

  test("the plates are one bridge: same board, stone fills, saffron inlay once built, unique gradient ids", async ({ page }) => {
    await page.goto("/");
    const plates = page.locator("#method li svg");
    const boards = await plates.evaluateAll((svgs) => svgs.map((svg) => svg.getAttribute("viewBox")));
    expect(new Set(boards).size).toBe(1);
    const ids = await plates.evaluateAll((svgs) => svgs.flatMap((svg) => [...svg.querySelectorAll("linearGradient")].map((node) => node.id)));
    expect(ids).toHaveLength(16);
    expect(new Set(ids).size).toBe(ids.length);
    for (let index = 0; index < 4; index++) {
      await expect(plates.nth(index).locator('path[fill="var(--color-slab-top)"]').first()).toBeAttached();
    }
    // Saffron inlay runs on the built slabs only: none in Discover and Define, some in Build and Improve.
    const inlays = await plates.evaluateAll((svgs) => svgs.map((svg) => svg.querySelectorAll('path[stroke="var(--color-saffron-500)"]').length));
    expect(inlays).toEqual([0, 0, 1, 1]);
  });

  test("the plates draw in once the section is reached", async ({ page }) => {
    await page.goto("/");
    const plate = page.locator("#method li").nth(3).locator(".svc-fig");
    await plate.scrollIntoViewIfNeeded();
    await expect(plate).toHaveAttribute("data-revealed", /.*/, { timeout: 10_000 });
  });

  test("the energy wire reveals the plates in order and ends on Improve", async ({ page }) => {
    await page.goto("/");
    const figs = page.locator("#method li .svc-fig");
    await expect(figs.first()).toHaveAttribute("data-reveal-by", "energy");
    // Every plate has a way in; only the last has no way out.
    const outs = await page
      .locator("#method li svg")
      .evaluateAll((svgs) => svgs.map((svg) => JSON.parse(svg.getAttribute("data-energy-ports")!).outs.length));
    expect(outs).toEqual([1, 1, 1, 0]);
    // Record the order the plates are revealed in while the page is scrolled down through them.
    await page.evaluate(() => {
      const order: number[] = [];
      (window as unknown as { order: number[] }).order = order;
      document.querySelectorAll("#method li .svc-fig").forEach((fig, index) =>
        new MutationObserver(() => {
          if (fig.hasAttribute("data-revealed") && !order.includes(index)) order.push(index);
        }).observe(fig, { attributes: true, attributeFilter: ["data-revealed"] }),
      );
    });
    const bottom = await page.evaluate(() => {
      const r = document.querySelector("#method ol")!.getBoundingClientRect();
      return r.bottom + scrollY;
    });
    for (let y = 0; y < bottom; y += 200) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.waitForTimeout(60);
    }
    await expect.poll(() => page.evaluate(() => (window as unknown as { order: number[] }).order), { timeout: 15_000 }).toEqual([0, 1, 2, 3]);
    await expect(page.locator(".energy-port").last()).toHaveAttribute("data-lit", "");
  });

  test("Build and Improve settle slab by slab from the near bank, unclipped", async ({ page }) => {
    await page.goto("/");
    const plates = page.locator("#method li .svc-fig");
    for (const [plate, count] of [[2, 8], [3, 14]] as const) {
      const slabs = plates.nth(plate).locator(".rise-in");
      await expect(slabs).toHaveCount(count);
      // Painted far to near; --i counts from the near bank (0), so the stagger starts there.
      const order = await slabs.evaluateAll((nodes) => nodes.map((node) => Number((node as SVGElement).style.getPropertyValue("--i"))));
      expect(order).toEqual(Array.from({ length: count }, (_, index) => count - 1 - index));
      await expect(slabs.first().locator("xpath=..")).toHaveClass(/svc-noclip/);
    }
  });

  test("the plates fit at every width", async ({ page }) => {
    await page.goto("/");
    for (const step of STEPS) {
      const item = page.locator("#method li", { has: page.getByRole("heading", { level: 3, name: step }) });
      await item.scrollIntoViewIfNeeded();
      const box = await item.locator("svg").boundingBox();
      const viewport = page.viewportSize()!;
      expect(box!.width).toBeGreaterThan(200);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
    }
  });

  test("reduced motion: the finished plates are there at once", async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "one viewport is enough");
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("#method li svg")).toHaveCount(4);
    const clip = await page.locator("#method li .svc-built").last().evaluate((element) => getComputedStyle(element).clipPath);
    expect(clip === "none" || clip.startsWith("inset(-6px -6px")).toBe(true);
    await context.close();
  });

  test("without JavaScript every step is readable", async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "one viewport is enough");
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto("/");
    for (const title of STEPS) {
      await expect(page.locator("#method").getByRole("heading", { level: 3, name: title })).toBeVisible();
    }
    await expect(page.locator("#method li svg").first()).toBeVisible();
    await context.close();
  });
});
