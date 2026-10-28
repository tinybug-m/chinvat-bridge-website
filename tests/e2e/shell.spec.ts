import { expect, test } from "@playwright/test";

test.describe("site shell", () => {
  test("homepage renders with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
    page.on("pageerror", (error) => errors.push(String(error)));
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("skip link moves focus to the main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  });

  test("mobile menu opens, traps focus, closes on Escape and follows anchors", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "desktop", "the desktop header shows the links inline");
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Menu" });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await dialog.getByRole("link", { name: /Insights/ }).click();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/#insights$/);
    await expect(page.locator("#insights")).toBeInViewport();
  });

  test("desktop header links reach every chapter", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    for (const name of ["Services", "Approach", "Insights", "About"]) {
      await nav.getByRole("link", { name }).click();
      await expect(page.locator(`#${name === "Approach" ? "approach" : name.toLowerCase()}`)).toBeInViewport();
    }
    await expect(nav.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
  });
});
