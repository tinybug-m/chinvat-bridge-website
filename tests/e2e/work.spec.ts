import { expect, test } from "@playwright/test";

const PROJECTS = [
  { key: "scornik", name: "Scornik Gerstein LLP", label: "Client project", href: "https://www.scornik.com/", context: "London law firm. We designed and built their website." },
  { key: "benedict", name: "Benedict Funeral Directors", label: "Concept", href: "https://benedict-funeral.vercel.app/", context: "Funeral directors, Henlow Camp, Bedfordshire." },
  { key: "naturaglow", name: "NATURAGLOW", label: "Concept", href: "https://beauty-blue-sigma.vercel.app/", context: "Skincare and wellness clinic, Beverly Hills." },
];

test.describe("work section", () => {
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
    await expect(page.locator("#work [data-frame]").first()).toBeHidden();
  });

});
