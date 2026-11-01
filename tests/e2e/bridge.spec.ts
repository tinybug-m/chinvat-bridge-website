import { type Page, expect, test } from "@playwright/test";

/*
 * 02 Approach (The Bridge): the seam slider drives the stage and the live
 * caption that names the pair being crossed; scrolling sweeps it from today
 * to the future and back, the visitor can override it (drag or keys);
 * reduced motion and no-JS keep everything readable, the control working
 * and never scroll-drive it.
 */

// GSAP's core keeps this global's name through minification, so it marks the
// library in dev and production chunks alike.
const GSAP_MARKER = "GreenSockGlobals";

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(String(error)));
  return errors;
}

const section = (page: Page) => page.locator("section#approach");
const slider = (page: Page) => section(page).getByRole("slider", { name: "Move the seam" });
/** The live caption under the stage, and the one pair in it that is showing. */
const pairLine = (page: Page) => section(page).getByTestId("approach-pair");
const shownPair = (page: Page) => pairLine(page).locator(":scope > span:not([aria-hidden])");

/** Scrolls so the stage's centre sits at the given share of the viewport height (0 = top). */
async function placeStage(page: Page, share: number) {
  await page.evaluate((at) => {
    const stage = document.querySelector<HTMLElement>("[data-stage=bridge]")!;
    const rect = stage.getBoundingClientRect();
    window.scrollTo({ top: rect.top + window.scrollY + rect.height / 2 - window.innerHeight * at, behavior: "instant" });
  }, share);
}

/**
 * The homepage with the 3D scene forced off (the QA switch). Tests of the seam's scroll timing use
 * it: creating and drawing the WebGL scene on headless Chromium's software renderer can hold the
 * main thread for seconds under parallel load, which freezes the seam's ease mid-assertion. The
 * seam, the slider and the caption work the same with or without the scene.
 */
const SEAM_ONLY = "/?quality=none";

test.describe("approach (bridge)", () => {
  test("content: heading, lede, a live pair under the stage, no console errors", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/");
    const heading = section(page).getByRole("heading", { level: 2 });
    await expect(heading).toHaveId("approach-title");
    await expect(heading).toHaveText("From today to what’s next.");
    await expect(section(page)).toHaveAttribute("aria-labelledby", "approach-title");
    await expect(section(page).getByText("Technology creates the most value when it solves a real constraint.")).toBeVisible();
    // The five comparison rows are gone; one line names the pair the seam is crossing.
    await expect(section(page).locator("ol")).toHaveCount(0);
    await expect(pairLine(page)).toBeVisible();
    await expect(shownPair(page)).toHaveCount(1);
    // The old count readout is gone too; "Move the seam" still labels the slider.
    await expect(section(page).getByTestId("approach-readout")).toHaveCount(0);
    await expect(section(page).getByText("Move the seam")).toBeVisible();
    await expect(section(page).locator("[data-stage=bridge]")).toHaveAttribute("data-stage-state", /.+/);
    // One call to action closes Approach and Method together, and it lives under Method.
    await expect(section(page).getByRole("link", { name: "Start a conversation" })).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("decluttered: no mythology quotes or source labels in the section", async ({ page }) => {
    await page.goto("/");
    const approach = section(page);
    for (const text of ["Rashn", "renders no favour", "Mainyo", "Pahlavi", "razor", "lances", "Dadestan", "Denkard", "Gathas"]) {
      await expect(approach).not.toContainText(text);
    }
    // No mono source labels left in the section.
    await expect(approach.locator(".font-label")).toHaveCount(0);
  });

  test("the pair line: today emphasised until built, the next state after, and it advances", async ({ page }) => {
    await page.goto("/");
    await placeStage(page, 0.5);
    const thumb = slider(page);
    await thumb.focus();
    await page.keyboard.press("Home");
    await expect(pairLine(page)).toHaveAttribute("data-pair", "0");
    await expect(pairLine(page)).toHaveAttribute("data-state", "drawn");
    await expect(shownPair(page)).toHaveText(/^Repetitive manual work\s*→\s*to\s*Automated workflows$/);
    // Readable, not pale: today in ink and medium weight, the next state in soft ink, at heading size.
    const [today, next] = [shownPair(page).locator(":scope > span").first(), shownPair(page).locator(":scope > span").last().locator(":scope > span").last()];
    await expect(today).toHaveCSS("color", "rgb(11, 26, 38)");
    await expect(today).toHaveCSS("font-weight", "500");
    await expect(next).toHaveCSS("color", "rgb(51, 65, 76)");

    // Past the pair's midpoint it is built: today struck through, the next state in ink.
    for (let i = 0; i < 10; i++) await page.keyboard.press("ArrowLeft");
    await expect(thumb).toHaveAttribute("aria-valuenow", "10");
    await expect(pairLine(page)).toHaveAttribute("data-state", "built");
    await expect(today).toHaveCSS("text-decoration-line", "line-through");
    await expect(next).toHaveCSS("color", "rgb(11, 26, 38)");
    await expect(next).toHaveCSS("font-weight", "500");

    // The next fifth of the sweep brings the next pair in, as it is today.
    for (let i = 0; i < 10; i++) await page.keyboard.press("ArrowLeft");
    await expect(pairLine(page)).toHaveAttribute("data-pair", "1");
    await expect(pairLine(page)).toHaveAttribute("data-state", "drawn");
    await expect(shownPair(page)).toContainText("Disconnected tools");
    await expect(shownPair(page)).toContainText("Connected systems");

    // The line never changes height as the pair changes (the tallest pair's height is reserved).
    const height = (await pairLine(page).boundingBox())!.height;
    await page.keyboard.press("End");
    await expect(pairLine(page)).toHaveAttribute("data-pair", "4");
    await expect(pairLine(page)).toHaveAttribute("data-state", "built");
    await expect(shownPair(page)).toContainText("Software built around the business");
    expect((await pairLine(page).boundingBox())!.height).toBe(height);
    // No live region: the line would chatter all through a scroll.
    await expect(section(page).locator("[aria-live]")).toHaveCount(0);
  });

  test("scrolling down builds the path and scrolling up undoes it", async ({ page }) => {
    await page.goto(SEAM_ONLY);
    const value = () => slider(page).getAttribute("aria-valuenow").then(Number);
    /** The value once the ease has finished: the same reading twice, 250 ms apart. */
    const settled = async () => {
      let before = await value();
      for (let tries = 0; tries < 20; tries++) {
        await page.waitForTimeout(250);
        const now = await value();
        if (now === before) return now;
        before = now;
      }
      return before;
    };
    const seam = () =>
      section(page).evaluate((element) =>
        getComputedStyle(element.querySelector<HTMLElement>("[data-seam-value]")!).getPropertyValue("--seam").trim(),
      );

    // The seam eases to the scroll position, so poll rather than sleep.
    await expect.poll(value).toBe(0);
    await expect(pairLine(page)).toHaveAttribute("data-pair", "0");
    await expect(pairLine(page)).toHaveAttribute("data-state", "drawn");

    await placeStage(page, 0.7);
    await expect.poll(value).toBeGreaterThan(20);
    await expect.poll(value).toBeLessThan(85);
    const middle = await settled();

    // Centred on the stage the bridge is fully built, with the stage whole.
    await placeStage(page, 0.3);
    await expect.poll(value).toBe(100);
    await expect(pairLine(page)).toHaveAttribute("data-pair", "4");
    await expect(pairLine(page)).toHaveAttribute("data-state", "built");

    // And back up: the same position gives (nearly) the same value, and the seam line follows it.
    await placeStage(page, 0.7);
    await expect.poll(async () => Math.abs((await value()) - middle)).toBeLessThanOrEqual(2);
    await placeStage(page, 1.3);
    await expect.poll(value).toBe(0);
    await expect.poll(seam).toBe("100%");
    // No pin: the section keeps its place in the flow.
    expect(await section(page).evaluate((element) => getComputedStyle(element).position)).toBe("relative");
  });

  test("the energy wire powers the seam as its sweep starts", async ({ page }) => {
    await page.goto(SEAM_ONLY);
    const frame = section(page).locator("[data-energy-sweep]");
    const seamColour = () =>
      frame.evaluate((element) => getComputedStyle(element.querySelector(".bridge-seam")!).backgroundColor);
    // Before the energy reaches it the seam waits unpowered: a hairline, not the ink seam.
    await placeStage(page, 1.6);
    await page.waitForTimeout(400);
    await expect(frame).not.toHaveAttribute("data-energized");
    const unpowered = await seamColour();
    // Down through the sweep: the energy arrives, powers the seam, and the bridge is built.
    for (const share of [1.3, 1.1, 0.9, 0.7, 0.5, 0.3]) {
      await placeStage(page, share);
      await page.waitForTimeout(250);
    }
    await expect(frame).toHaveAttribute("data-energized", "", { timeout: 5000 });
    await expect.poll(seamColour).not.toBe(unpowered);
  });

  test("no sideways scroll with the seam at either end", async ({ page }) => {
    await page.goto(SEAM_ONLY);
    for (const [share, expected] of [
      [1.3, 0],
      [0.3, 100],
    ] as const) {
      await placeStage(page, share);
      await expect.poll(async () => Number(await slider(page).getAttribute("aria-valuenow"))).toBe(expected);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
      // The handle stays whole on screen.
      const box = (await slider(page).boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    }
  });

  test("keyboard moves the seam and updates the pair line", async ({ page }) => {
    await page.goto("/");
    await placeStage(page, 0.5);
    const thumb = slider(page);
    await thumb.focus();
    await page.keyboard.press("Home");
    await expect(thumb).toHaveAttribute("aria-valuetext", "0% modernised: Repetitive manual work to Automated workflows");
    await expect(pairLine(page)).toHaveAttribute("data-pair", "0");
    // Inverted: the built side is on the right, so moving the seam left builds more.
    await page.keyboard.press("ArrowLeft");
    await expect(thumb).toHaveAttribute("aria-valuenow", "1");
    for (let i = 0; i < 39; i++) await page.keyboard.press("ArrowLeft");
    // 40 opens the third fifth of the sweep: its pair, not yet built.
    await expect(thumb).toHaveAttribute("aria-valuetext", "40% modernised: Poor search visibility to Stronger organic visibility");
    await expect(pairLine(page)).toHaveAttribute("data-pair", "2");
    await expect(pairLine(page)).toHaveAttribute("data-state", "drawn");
    await expect(shownPair(page)).toContainText("Poor search visibility");
    await page.keyboard.press("ArrowLeft");
    await expect(thumb).toHaveAttribute("aria-valuetext", "41% modernised: Poor search visibility to Stronger organic visibility");
    await page.keyboard.press("End");
    await expect(thumb).toHaveAttribute(
      "aria-valuetext",
      "100% modernised: Too much operational friction to Software built around the business",
    );
    await expect(pairLine(page)).toHaveAttribute("data-pair", "4");
    await expect(pairLine(page)).toHaveAttribute("data-state", "built");

    // The seam line follows: it sits at the left edge when everything is built.
    // (The line is eased toward the slider value, so it arrives a few frames after the key press.)
    await expect
      .poll(() =>
        section(page).evaluate((element) => {
          const frame = element.querySelector<HTMLElement>("[data-seam-value]")!;
          return getComputedStyle(frame).getPropertyValue("--seam").trim();
        }),
      )
      .toBe("0%");
    // --seam is scoped to the frame: nothing above it carries the variable.
    expect(
      await section(page).evaluate((element) => getComputedStyle(element).getPropertyValue("--seam").trim()),
    ).toBe("");

    // A small scroll barely moves the visitor's value; a long one hands the seam back to the page.
    await page.evaluate(() => window.scrollBy({ top: 40, behavior: "instant" }));
    await page.waitForTimeout(500);
    expect(Number(await thumb.getAttribute("aria-valuenow"))).toBeGreaterThan(85);
    await thumb.blur();
    await placeStage(page, 1.3);
    await expect.poll(async () => Number(await thumb.getAttribute("aria-valuenow"))).toBe(0);
  });

  test("reduced motion: posters, no animation library, the slider still works", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    const scripts: Promise<boolean>[] = [];
    page.on("response", (response) => {
      if (response.request().resourceType() !== "script") return;
      scripts.push(response.text().then((body) => body.includes(GSAP_MARKER), () => false));
    });
    await page.goto("/");
    await placeStage(page, 1.1);
    await page.waitForTimeout(800);
    await expect(slider(page)).toHaveAttribute("aria-valuenow", "50");
    await placeStage(page, 0.5);
    await expect(section(page).locator("[data-stage=bridge]")).toHaveAttribute("data-stage-state", "fallback");
    await expect(section(page).locator('[data-layer="poster"] img')).toHaveCount(2);
    await slider(page).focus();
    await page.keyboard.press("PageDown");
    await expect(slider(page)).toHaveAttribute("aria-valuenow", "40");
    await expect(pairLine(page)).toHaveAttribute("data-pair", "2");
    await expect(shownPair(page)).toContainText("Poor search visibility");
    expect((await Promise.all(scripts)).some(Boolean)).toBe(false);
    await context.close();
  });

  test("without JavaScript the pair line and posters are readable", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    // The server's half-built seam (50) is crossing the middle pair, just built.
    await expect(pairLine(page)).toHaveAttribute("data-pair", "2");
    await expect(pairLine(page)).toHaveAttribute("data-state", "built");
    await expect(shownPair(page)).toBeVisible();
    await expect(shownPair(page)).toContainText("Poor search visibility");
    await expect(shownPair(page)).toContainText("Stronger organic visibility");
    await expect(section(page).locator('[data-layer="poster"] img')).toHaveCount(2);
    await context.close();
  });

  test("no horizontal overflow and a 44px seam handle", async ({ page }) => {
    await page.goto("/");
    await placeStage(page, 0.5);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    const target = await slider(page).evaluate((element) => {
      const before = getComputedStyle(element, "::before");
      const rect = element.getBoundingClientRect();
      return rect.width - 2 * parseFloat(before.left);
    });
    expect(target).toBeGreaterThanOrEqual(44);

    // The handle rides the seam line, halfway up the stage.
    const { thumb, line, stage } = await section(page).evaluate((element) => {
      const box = (el: Element) => el.getBoundingClientRect();
      const frame = element.querySelector("[data-seam-value]")!;
      return {
        thumb: box(element.querySelector("[role=slider]")!),
        line: box(frame.querySelector(":scope > div[aria-hidden=true]")!),
        stage: box(frame),
      };
    });
    expect(Math.abs(thumb.x + thumb.width / 2 - line.x)).toBeLessThanOrEqual(1.5);
    expect(Math.abs(thumb.y + thumb.height / 2 - (stage.y + stage.height / 2))).toBeLessThanOrEqual(1.5);
  });
});
