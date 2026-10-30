import { expect, test, type Page } from "@playwright/test";

const PROJECTS = [
  { key: "scornik", name: "Scornik Gerstein LLP", label: "Client project", href: "https://scornik.vercel.app/", context: "London law firm. We designed and built their website." },
  { key: "benedict", name: "Benedict Funeral Directors", label: "Concept", href: "https://benedict-funeral.vercel.app/", context: "Funeral directors, Henlow Camp, Bedfordshire." },
  { key: "naturaglow", name: "NATURAGLOW", label: "Concept", href: "https://beauty-blue-sigma.vercel.app/", context: "Skincare and wellness clinic, Beverly Hills." },
];

/** True when the preview canvas has any painted pixel. */
const previewPainted = (page: Page) =>
  page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>(".work-preview canvas");
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return false;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 3; i < data.length; i += 4 * 37) if (data[i] > 0) return true;
    return false;
  });

const previewState = (page: Page) => page.locator(".work-preview").getAttribute("data-state");

async function hoverName(page: Page, key: string) {
  const name = page.locator(`#work [data-project="${key}"] [data-name]`);
  await name.scrollIntoViewIfNeeded();
  const box = (await name.boundingBox())!;
  await page.mouse.move(box.x + 30, box.y + box.height / 2, { steps: 4 });
}

test.describe("work section", () => {
  test("heading and three projects as an index, labelled truthfully", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#work");
    await expect(section).toHaveAttribute("aria-labelledby", "work-title");
    await expect(section.locator("h2")).toHaveText("Recent work.");
    await expect(section.locator("[data-project]")).toHaveCount(3);
    await expect(section.locator("[data-label]")).toHaveText(["Client project", "Concept", "Concept"]);
    for (const p of PROJECTS) {
      const row = section.locator(`[data-project="${p.key}"]`);
      await expect(row.getByRole("heading", { level: 3 })).toContainText(p.name);
      await expect(row).toContainText(p.context);
    }
    await expect(section).not.toContainText(/Holborn|Mayfair|Sotogrande|without a brief/);
  });

  test("each row is one external link that opens safely, and the whole row is its hit area", async ({ page }) => {
    await page.goto("/");
    const links = page.locator("#work").getByRole("link");
    await expect(links).toHaveCount(3);
    for (const [i, p] of PROJECTS.entries()) {
      const link = links.nth(i);
      await expect(link).toHaveAttribute("href", p.href);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
      await expect(link).toHaveAttribute("rel", /noreferrer/);
      await expect(link).toHaveAccessibleName(`${p.name} (opens in a new tab)`);
      // The context line at the row's far side is still the link.
      const context = page.locator(`#work [data-project="${p.key}"]`).getByText(p.context);
      await context.scrollIntoViewIfNeeded();
      const box = (await context.boundingBox())!;
      const hit = await page.evaluate(
        ([x, y]) => document.elementFromPoint(x, y)?.closest("a")?.getAttribute("href") ?? null,
        [box.x + box.width / 2, box.y + box.height / 2],
      );
      expect(hit).toBe(p.href);
    }
  });

  test("hovering a name gathers its screenshot beside the pointer, leaving blows it away", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "hover needs a fine pointer");
    await page.goto("/");
    // Fine pointers keep the screenshots out of the rows.
    await expect(page.locator("#work .work-inline").first()).toBeHidden();
    await expect(page.locator(".work-preview")).toHaveCount(1);
    await expect(page.locator(".work-preview")).toHaveAttribute("aria-hidden", "true");

    await hoverName(page, "scornik");
    await expect(page.locator('#work [data-project="scornik"]')).toHaveAttribute("data-current", "");
    await expect.poll(() => previewState(page), { timeout: 10_000 }).toBe("on");
    await expect.poll(() => previewPainted(page)).toBe(true);
    // The preview sits beside the pointer, inside the viewport.
    const frame = (await page.locator(".work-preview").boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(frame.x).toBeGreaterThanOrEqual(0);
    expect(frame.x + frame.width).toBeLessThanOrEqual(viewport.width);

    // Moving to another name hands over; the others step back.
    await hoverName(page, "naturaglow");
    await expect(page.locator('#work [data-project="naturaglow"]')).toHaveAttribute("data-current", "");
    await expect(page.locator('#work [data-project="scornik"]')).not.toHaveAttribute("data-current", "");

    await page.mouse.move(5, 5);
    await expect.poll(() => previewState(page), { timeout: 10_000 }).toBe("off");
    await expect(page.locator("#work [data-current]")).toHaveCount(0);
  });

  test("keyboard focus shows the preview beside the focused name", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "the preview is for fine pointers");
    await page.goto("/");
    await page.locator("#work").scrollIntoViewIfNeeded();
    const links = page.locator("#work").getByRole("link");
    await links.first().focus();
    // focus() alone is not :focus-visible; a Tab from the previous element is.
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(links.first()).toBeFocused();
    await expect.poll(() => previewState(page), { timeout: 10_000 }).toBe("on");
    const outline = await page
      .locator('#work [data-project="scornik"]')
      .evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).toBe("solid");
  });

  test("under reduced motion the preview still appears, without the powder", async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "hover needs a fine pointer");
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    await hoverName(page, "benedict");
    await expect.poll(() => previewState(page), { timeout: 10_000 }).toBe("on");
    await expect.poll(() => previewPainted(page)).toBe(true);
    await context.close();
  });

  test("touch screens show each screenshot in its row, with alt text", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "touch layout");
    await page.goto("/");
    const images = page.locator("#work img");
    await expect(images).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      const img = images.nth(i);
      await img.scrollIntoViewIfNeeded();
      await expect(img).toBeVisible();
      await expect(img).toHaveAttribute("alt", /.{40,}/);
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    }
    await expect(page.locator(".work-preview")).toBeHidden();
  });

  test("names and labels are there without JavaScript, with no horizontal overflow", async ({ browser }, testInfo) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: testInfo.project.use.viewport ?? { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("#work h2")).toBeVisible();
    await expect(page.locator("#work [data-label]").first()).toBeVisible();
    await expect(page.locator("#work [data-name]")).toHaveCount(3);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await context.close();
  });

  test("no horizontal overflow at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
