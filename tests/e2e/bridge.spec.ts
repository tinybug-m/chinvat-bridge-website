import { type Page, expect, test } from "@playwright/test";

/*
 * 02 Approach (The Bridge): the seam slider drives the rows and the stage;
 * scroll scrubs it until the user takes over; reduced motion and no-JS keep
 * everything readable and the control working.
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

  test("scroll scrubs the seam from 10 to 90 without pinning", async ({ page }) => {
    await page.goto("/");
    await placeStage(page, 1.1);
    await expect(slider(page)).toHaveAttribute("aria-valuetext", "10% modernised: 1 of 5", { timeout: 10_000 });
    await placeStage(page, 0.5);
    await expect(slider(page)).toHaveAttribute("aria-valuetext", /^(4[5-9]|5[0-5])% modernised: [23] of 5$/);
    // Radix hears whole steps only, whatever the scrub's fraction.
    await expect(slider(page)).toHaveAttribute("aria-valuenow", /^\d+$/);
    await placeStage(page, -0.2);
    // The scrub eases in over 0.6s, so the last whole step can arrive late on a busy machine.
    await expect(slider(page)).toHaveAttribute("aria-valuetext", "90% modernised: 5 of 5", { timeout: 10_000 });
    // No pin: the section keeps its place in the flow.
    const position = await section(page).evaluate((element) => getComputedStyle(element).position);
    expect(position).toBe("relative");
  });

  test("keyboard moves the seam, updates the rows, and scroll lets go", async ({ page }) => {
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

    await placeStage(page, 1.1);
    await page.waitForTimeout(800);
    await expect(thumb).toHaveAttribute("aria-valuenow", "100");
  });

  test("reduced motion: no scrub, no GSAP, the slider still works", async ({ browser }) => {
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
        line: box(frame.querySelector(".left-\\(--seam\\)")!),
        stage: box(frame),
      };
    });
    expect(Math.abs(thumb.x + thumb.width / 2 - line.x)).toBeLessThanOrEqual(1.5);
    expect(Math.abs(thumb.y + thumb.height / 2 - (stage.y + stage.height / 2))).toBeLessThanOrEqual(1.5);
  });
});
