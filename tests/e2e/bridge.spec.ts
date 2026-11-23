import { type Page, expect, test } from "@playwright/test";

// Approach (The Bridge): the seam slider works by keyboard, and nothing overflows at either end.

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


test.describe("approach (bridge)", () => {
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
