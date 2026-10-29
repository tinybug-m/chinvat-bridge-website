import { expect, test } from "@playwright/test";

const PROJECTS = [
  { key: "scornik", name: "Scornik Gerstein LLP", label: "Client project", href: "https://scornik.vercel.app/", img: "/work/scornik.jpg" },
  { key: "benedict", name: "Benedict Funeral Directors", label: "Concept", href: "https://benedict-funeral.vercel.app/", img: "/work/benedict.jpg" },
  { key: "naturaglow", name: "NATURAGLOW", label: "Concept", href: "https://beauty-blue-sigma.vercel.app/", img: "/work/naturaglow.jpg" },
];

test.describe("work section", () => {
  test("section, heading and three projects with truthful labels", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#work");
    await expect(section).toHaveAttribute("aria-labelledby", "work-title");
    await expect(section.locator("h2")).toHaveText("Recent work.");
    await expect(section.locator("h2")).toHaveAttribute("id", "work-title");
    await expect(section.locator("[data-project]")).toHaveCount(3);
    for (const p of PROJECTS) {
      const project = section.locator(`[data-project="${p.key}"]`);
      await expect(project).toContainText(p.name);
      await expect(project.locator("[data-label]")).toHaveText(p.label);
    }
    await expect(section.locator("[data-label]")).toHaveText(["Client project", "Concept", "Concept"]);
    await expect(section).toContainText("We designed and built their website.");
    await expect(section.getByRole("heading", { name: "Concepts" })).toBeVisible();
    await expect(section.getByText("Two concepts. Speculative, not client work.", { exact: true })).toBeVisible();
    await expect(section.locator('[data-project="scornik"]')).toContainText("London law firm.");
    await expect(section).not.toContainText(/Holborn|Mayfair|Sotogrande|without a brief/);
  });

  test("lead sits above two equal concepts side by side with no stagger", async ({ page }, testInfo) => {
    await page.goto("/");
    const box = (key: string) => page.locator(`#work [data-project="${key}"] img`).boundingBox();
    const [lead, benedict, naturaglow] = [await box("scornik"), await box("benedict"), await box("naturaglow")];
    expect(lead!.width).toBeGreaterThanOrEqual(benedict!.width);
    expect(Math.abs(benedict!.width - naturaglow!.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(benedict!.height - naturaglow!.height)).toBeLessThanOrEqual(1);
    expect(benedict!.y).toBeGreaterThan(lead!.y + lead!.height);
    if (testInfo.project.name !== "mobile") {
      expect(Math.abs(benedict!.y - naturaglow!.y)).toBeLessThanOrEqual(1);
      expect(naturaglow!.x).toBeGreaterThan(benedict!.x + benedict!.width - 1);
    } else {
      expect(naturaglow!.y).toBeGreaterThan(benedict!.y + benedict!.height);
    }
  });

  test("the screenshot is part of the link, with a hover state", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "hover needs a pointer");
    await page.goto("/");
    for (const p of PROJECTS) {
      const project = page.locator(`#work [data-project="${p.key}"]`);
      const img = project.locator("img");
      await img.scrollIntoViewIfNeeded();
      const link = project.getByRole("link", { name: /Visit the site/ });
      const box = (await img.boundingBox())!;
      // The link's stretched hit area covers the image.
      const hit = await page.evaluate(
        ([x, y]) => document.elementFromPoint(x, y)?.closest("a")?.getAttribute("href") ?? null,
        [box.x + box.width / 2, box.y + box.height / 2],
      );
      expect(hit).toBe(p.href);
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await expect.poll(() => img.evaluate((el) => getComputedStyle(el).opacity)).not.toBe("1");
      await expect(link).toHaveCount(1);
    }
  });

  test("external links open safely and point at the right sites", async ({ page }) => {
    await page.goto("/");
    const links = page.locator("#work").getByRole("link", { name: /Visit the site/ });
    await expect(links).toHaveCount(3);
    for (const [i, p] of PROJECTS.entries()) {
      const link = links.nth(i);
      await expect(link).toHaveAttribute("href", p.href);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
      await expect(link).toHaveAttribute("rel", /noreferrer/);
      await expect(link).toContainText("opens in a new tab");
      await expect(link).toContainText(p.name);
    }
  });

  test("screenshots load, have alt text and the lead is the largest", async ({ page }) => {
    await page.goto("/");
    await page.locator("#work").scrollIntoViewIfNeeded();
    const images = page.locator("#work img");
    await expect(images).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      const img = images.nth(i);
      await img.scrollIntoViewIfNeeded();
      await expect(img).toHaveAttribute("alt", /.{40,}/);
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    }
    const lead = await images.nth(0).boundingBox();
    const other = await images.nth(1).boundingBox();
    expect(lead!.width).toBeGreaterThanOrEqual(other!.width);
  });

  test("no horizontal overflow and content is visible without JavaScript", async ({ browser }, testInfo) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: testInfo.project.use.viewport ?? { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("#work h2")).toBeVisible();
    await expect(page.locator("#work [data-label]").first()).toBeVisible();
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
