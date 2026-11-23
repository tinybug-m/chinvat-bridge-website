import { expect, test } from "@playwright/test";

test.describe("services section", () => {
  test("diagrams are decorative and links are large enough to tap", async ({ page }) => {
    await page.goto("/");
    const frames = page.locator("#services .svc-fig");
    await expect(frames).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(frames.nth(i).locator("> svg")).toHaveAttribute("aria-hidden", "true");
    }
    // Frameless: no registration marks, Drawn/Built captions or seam inside the plates.
    await expect(page.locator("#services").getByText(/^(Drawn|Built)$/)).toHaveCount(0);
    const link = page.locator("#services-ai").getByRole("link", { name: /Explore the service/ });
    await link.scrollIntoViewIfNeeded();
    // Layout height (offsetHeight), not the bounding box: the plate may still be rising into
    // place, and a transform makes the box a hair under 44 (43.99997) from float rounding alone.
    expect(await link.evaluate((el) => (el as HTMLElement).offsetHeight)).toBeGreaterThanOrEqual(44);
  });

});
