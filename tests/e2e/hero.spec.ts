import { type Locator, type Page, expect, test } from "@playwright/test";

type StageProbe = { state: string; frames: number; running: boolean; visible: boolean; triangles?: number; calls?: number };

// three.js keeps its warning strings through minification, so this finds the
// library in dev and production chunks alike (chunk names are hashed in production).
const THREE_MARKER = "THREE.WebGLRenderer";

/** Records every script the page fetches and whether it contains three.js. */
function collectScripts(page: Page) {
  const scripts: Promise<{ url: string; at: number; three: boolean }>[] = [];
  page.on("response", (response) => {
    if (response.request().resourceType() !== "script") return;
    const at = Date.now();
    scripts.push(
      response
        .text()
        .then((body) => ({ url: response.url(), at, three: body.includes(THREE_MARKER) }))
        .catch(() => ({ url: response.url(), at, three: false })),
    );
  });
  return () => Promise.all(scripts);
}

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(String(error)));
  return errors;
}

// The WebGL canvas. The line drawing also carries a 2D canvas for the chrome
// texture (MarkChromeCanvas, data-material="chrome"); it is not the scene.
const sceneCanvas = (stage: Locator) => stage.locator("canvas:not([data-material])");

const probe = (page: Page) => page.evaluate(() => (window as unknown as { __three?: Record<string, StageProbe> }).__three?.seam);

test.describe("hero", () => {
  test("the line drawing is one path per ring: an outer ring, then the holes", async ({ page }) => {
    await page.goto("/");
    const rings = page.locator('[data-layer="drawing"] svg path');
    expect(await rings.count()).toBeGreaterThan(1);
    await expect(rings.first()).toHaveAttribute("data-ring", "outer");
    await expect(page.locator('[data-layer="drawing"] path[data-ring="outer"]')).toHaveCount(1);
  });

  test("content, links and one h1, with no console errors", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/");
    const hero = page.locator("section[data-hero]");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Same business\.\s*Better systems\./);
    await expect(hero.getByText("UK Based // Working Globally")).toBeVisible();
    await expect(hero.getByRole("link", { name: "Start a conversation" })).toHaveAttribute("href", "/#contact");
    await expect(hero.getByRole("link", { name: "Explore services" })).toHaveAttribute("href", "/#services");

    const index = hero.getByRole("navigation", { name: "Disciplines" }).getByRole("link");
    await expect(index).toHaveCount(4);
    const expected = [
      ["AI integration", "/#services-ai"],
      ["Automation & workflows", "/#services-automation"],
      ["Software & web", "/#services-software"],
      ["SEO & growth", "/#services-seo"],
    ];
    for (const [i, [label, href]] of expected.entries()) {
      await expect(index.nth(i)).toContainText(label);
      await expect(index.nth(i)).toHaveAttribute("href", href);
      const box = await index.nth(i).boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    // One callout on the mark, where the seam leaves it; the figure's screen-reader caption names all three states.
    await expect(hero.locator("figure").getByText("Transition", { exact: true })).toBeVisible();
    await expect(hero.locator("figure figcaption")).toContainText(/Current state.*Transition.*Better systems/);
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

  // The H1 is the LCP on desktop. On narrow screens the four-line lede covers
  // more area than the two-line H1, so it may win there; either way the LCP is
  // server-rendered hero text, never the poster or the canvas.
  test("the largest contentful paint is the hero text", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
    const lcp = await page.evaluate(
      () =>
        new Promise<string>((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries() as (PerformanceEntry & { element?: Element | null })[];
            const last = entries[entries.length - 1];
            const element = last?.element;
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

  test("three loads only after the trigger; the stage goes live, hidden from AT, and sleeps offscreen", async ({ page }) => {
    const errors = collectErrors(page);
    const scripts = collectScripts(page);

    await page.goto("/", { waitUntil: "load" });
    const loadedAt = Date.now();
    const stage = page.locator('[data-stage="seam"]');
    // The trigger is load + idle (and near the viewport); nothing fetched before load may contain three.
    await expect(stage).toHaveAttribute("data-stage-state", "live", { timeout: 30_000 });
    const fetched = await scripts();
    expect(fetched.filter((s) => s.at <= loadedAt && s.three).map((s) => s.url)).toEqual([]);
    expect(fetched.some((s) => s.at > loadedAt && s.three)).toBe(true);

    const canvas = sceneCanvas(stage);
    await expect(canvas).toHaveAttribute("aria-hidden", "true");
    // window.__three only exists in development builds (three/core/debug.ts), so the
    // frame and triangle checks are skipped against `next start`.
    const info = await probe(page);
    if (info) {
      expect(info.triangles).toBeLessThanOrEqual(20_000);
      expect(info.calls).toBeLessThanOrEqual(4);
    }

    // Offscreen: the loop stops and no more frames are drawn.
    await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 1.6, behavior: "instant" }));
    if (info) {
      await expect.poll(async () => (await probe(page))?.running, { timeout: 15_000 }).toBe(false);
      const frames = (await probe(page))!.frames;
      await page.mouse.move(200, 200);
      await page.waitForTimeout(800);
      expect((await probe(page))!.frames).toBe(frames);
    }

    // Far offscreen: the context is released and the poster takes over.
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await expect(stage).toHaveAttribute("data-stage-state", "suspended", { timeout: 15_000 });
    await expect(sceneCanvas(stage)).toHaveCount(0);

    // Back on screen: it comes back.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(stage).toHaveAttribute("data-stage-state", "live", { timeout: 30_000 });
    expect(errors).toEqual([]);
  });

  test("reduced motion: static poster, no canvas, no intro animation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = collectErrors(page);
    await page.goto("/", { waitUntil: "load" });
    const stage = page.locator('[data-stage="seam"]');
    await expect(stage).toHaveAttribute("data-stage-state", "fallback");
    await expect(stage.locator('[data-layer="poster"] [data-material="chrome"] img')).toBeVisible();
    await page.waitForTimeout(1500);
    await expect(sceneCanvas(stage)).toHaveCount(0);
    const animation = await page.locator("h1").evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe("none");
    expect(errors).toEqual([]);
  });
});

// Playwright forbids test.use({ launchOptions }) inside a describe (it forces a
// new worker), so this group launches its own browser with WebGL switched off.
test.describe("hero without WebGL", () => {
  test("shows the poster and never loads three", async ({ playwright, baseURL }, testInfo) => {
    const browser = await playwright.chromium.launch({ args: ["--disable-webgl", "--disable-3d-apis"] });
    const { viewport, deviceScaleFactor, isMobile, hasTouch } = testInfo.project.use;
    const context = await browser.newContext({ baseURL, viewport, deviceScaleFactor, isMobile, hasTouch });
    const page = await context.newPage();
    try {
      const errors = collectErrors(page);
      const scripts = collectScripts(page);
      await page.goto("/", { waitUntil: "load" });
      const stage = page.locator('[data-stage="seam"]');
      await expect(stage).toHaveAttribute("data-stage-state", "fallback");
      const poster = stage.locator('[data-layer="poster"] [data-material="chrome"] img');
      await expect(poster).toBeVisible();
      await expect.poll(() => poster.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      await page.waitForTimeout(1500);
      await expect(sceneCanvas(stage)).toHaveCount(0);
      expect((await scripts()).filter((s) => s.three).map((s) => s.url)).toEqual([]);
      expect(errors).toEqual([]);
    } finally {
      await browser.close();
    }
  });
});
