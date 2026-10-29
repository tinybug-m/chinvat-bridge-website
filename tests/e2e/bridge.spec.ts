import { type Page, expect, test } from "@playwright/test";

/*
 * 02 Approach (The Bridge): the seam slider drives the rows and the stage;
 * scrolling sweeps it from today to the future and back, the visitor can
 * override it (drag or keys); reduced motion and no-JS keep everything
 * readable, the control working and never scroll-drive it.
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
const builtRows = (page: Page) => section(page).locator("ol > li[data-state=built]");

/** Scrolls so the stage's centre sits at the given share of the viewport height (0 = top). */
async function placeStage(page: Page, share: number) {
  await page.evaluate((at) => {
    const stage = document.querySelector<HTMLElement>("[data-stage=bridge]")!;
    const rect = stage.getBoundingClientRect();
    window.scrollTo({ top: rect.top + window.scrollY + rect.height / 2 - window.innerHeight * at, behavior: "instant" });
  }, share);
}

test.describe("approach (bridge)", () => {
  test("content: heading, lede, five rows with both states, no console errors", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/");
    const heading = section(page).getByRole("heading", { level: 2 });
    await expect(heading).toHaveId("approach-title");
    await expect(heading).toHaveText("From today to what’s next.");
    await expect(section(page)).toHaveAttribute("aria-labelledby", "approach-title");
    await expect(section(page).getByText("Technology creates the most value when it solves a real constraint.")).toBeVisible();
    const rows = section(page).locator("ol > li");
    await expect(rows).toHaveCount(5);
    await expect(rows.first()).toContainText("Repetitive manual work");
    await expect(rows.first()).toContainText("High human overhead");
    await expect(rows.first()).toContainText("Automated workflows");
    await expect(rows.last()).toContainText("Software built around the business");
    await expect(rows.last()).toContainText("Enduring advantage");
    await expect(section(page).locator("[data-stage=bridge]")).toHaveAttribute("data-stage-state", /.+/);
    // One call to action closes Approach and Method together, and it lives under Method.
    await expect(section(page).getByRole("link", { name: "Start a conversation" })).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("origin touches: balance note with its source, a later-tradition caption, plain row headings", async ({ page }) => {
    await page.goto("/");
    const approach = section(page);
    await expect(approach).toContainText("In the Middle Persian texts, Rashn’s balance “renders no favour.”");
    await expect(approach).toContainText("by weighing where things really stand");
    await expect(approach).toContainText("Mainyo-i Khrad 2");
    // The width image is labelled as a later tradition and never as an early-text detail.
    await expect(approach).toContainText("A later Pahlavi tradition describes the bridge as narrow as a razor or nine lances wide");
    await expect(approach).toContainText("Later tradition: Dadestan i Denig 21.5; Denkard 809");
    await expect(approach).not.toContainText("Gathas");
    // The drawn balance is decorative: hidden from assistive tech, and it carries no text of its own.
    const balance = approach.locator("svg[aria-hidden=true]").first();
    await expect(balance).toHaveAttribute("focusable", "false");
    await expect(balance.locator("text")).toHaveCount(0);
    // Row headings read as plain statements, not scores.
    const first = approach.locator("ol > li").first();
    await expect(first).toContainText("Where it stands");
    await expect(first).toContainText("What we build");
  });

  test("scrolling down builds the path and scrolling up undoes it", async ({ page }) => {
    await page.goto("/");
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
        getComputedStyle(element.querySelector<HTMLElement>("[data-seam-value]")!.parentElement!.parentElement!).getPropertyValue("--seam").trim(),
      );

    // The seam eases to the scroll position, so poll rather than sleep.
    await placeStage(page, 1.3);
    await expect.poll(value).toBe(0);
    await expect(builtRows(page)).toHaveCount(0);

    await placeStage(page, 0.7);
    await expect.poll(value).toBeGreaterThan(20);
    await expect.poll(value).toBeLessThan(85);
    const middle = await settled();

    // Centred on the stage the bridge is fully built, with the stage whole.
    await placeStage(page, 0.3);
    await expect.poll(value).toBe(100);
    await expect(section(page).getByTestId("approach-readout")).toHaveText("Everything improved");
    // The rows flip as they come into view, not while still below the fold.
    await section(page).locator("ol > li").last().scrollIntoViewIfNeeded();
    await expect(builtRows(page)).toHaveCount(5);

    // And back up: the same position gives (nearly) the same value, and the seam line follows it.
    await placeStage(page, 0.7);
    await expect.poll(async () => Math.abs((await value()) - middle)).toBeLessThanOrEqual(2);
    await placeStage(page, 1.3);
    await expect.poll(value).toBe(0);
    await expect.poll(seam).toBe("100%");
    // No pin: the section keeps its place in the flow.
    expect(await section(page).evaluate((element) => getComputedStyle(element).position)).toBe("relative");
  });

  test("no sideways scroll with the seam at either end", async ({ page }) => {
    await page.goto("/");
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

  test("keyboard moves the seam and updates the rows", async ({ page }) => {
    await page.goto("/");
    await placeStage(page, 0.5);
    const thumb = slider(page);
    await thumb.focus();
    await page.keyboard.press("Home");
    await expect(thumb).toHaveAttribute("aria-valuetext", "0% modernised: 0 of 5");
    await expect(builtRows(page)).toHaveCount(0);
    // Inverted: the built side is on the right, so moving the seam left builds more.
    await page.keyboard.press("ArrowLeft");
    await expect(thumb).toHaveAttribute("aria-valuenow", "1");
    for (let i = 0; i < 39; i++) await page.keyboard.press("ArrowLeft");
    await expect(thumb).toHaveAttribute("aria-valuetext", "40% modernised: 2 of 5");
    await expect(builtRows(page)).toHaveCount(2);
    await expect(section(page).locator("ol > li").nth(1)).toHaveAttribute("data-state", "built");
    await expect(section(page).locator("ol > li").nth(2)).toHaveAttribute("data-state", "drawn");
    await page.keyboard.press("End");
    await expect(thumb).toHaveAttribute("aria-valuetext", "100% modernised: 5 of 5");
    await expect(section(page).getByTestId("approach-readout")).toHaveText("Everything improved");

    // The seam line follows: it sits at the left edge when everything is built.
    const offset = await section(page).evaluate((element) => {
      const frame = element.querySelector<HTMLElement>("[data-seam-value]")!;
      return getComputedStyle(frame.parentElement!.parentElement!).getPropertyValue("--seam").trim();
    });
    expect(offset).toBe("0%");

    // A small scroll barely moves the visitor's value; a long one hands the seam back to the page.
    await page.evaluate(() => window.scrollBy({ top: 40, behavior: "instant" }));
    await page.waitForTimeout(500);
    expect(Number(await thumb.getAttribute("aria-valuenow"))).toBeGreaterThan(85);
    await thumb.blur();
    await placeStage(page, 1.3);
    await expect.poll(async () => Number(await thumb.getAttribute("aria-valuenow"))).toBe(0);
  });

  test("reduced motion: posters, no GSAP, the slider still works", async ({ browser }) => {
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
    await expect(builtRows(page)).toHaveCount(2);
    expect((await Promise.all(scripts)).some(Boolean)).toBe(false);
    await context.close();
  });

  test("without JavaScript the rows and posters are readable", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(section(page).locator("ol > li")).toHaveCount(5);
    await expect(section(page).getByText("Stronger organic visibility")).toBeVisible();
    await expect(section(page).getByText("Poor search visibility")).toBeVisible();
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
