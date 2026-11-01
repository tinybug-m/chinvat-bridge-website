import { type Page, expect, test } from "@playwright/test";

const KEY = "chinvat:logo-material";

const group = (page: Page) => page.getByRole("radiogroup", { name: "Logo" });
const chrome = (page: Page) => group(page).getByRole("radio", { name: "Chrome" });
const classic = (page: Page) => group(page).getByRole("radio", { name: "Classic" });
const material = (page: Page) => page.evaluate(() => document.documentElement.getAttribute("data-logo-material"));

test.describe("logo material toggle", () => {
  test("defaults to chrome, flips to classic and back, and persists after reload", async ({ page }) => {
    await page.goto("/");
    await expect(group(page)).toBeVisible();
    await expect(chrome(page)).toHaveAttribute("aria-checked", "true");
    await expect(classic(page)).toHaveAttribute("aria-checked", "false");
    expect(await material(page)).toBe("chrome");

    // Both layers are server-rendered in the hero mark and the About mark; CSS shows one.
    const mark = page.locator("[data-hero] .cx-chart > div").first();
    await expect(mark.locator('[data-material="chrome"]')).toHaveCount(1);
    await expect(mark.locator('[data-material="classic"]')).toHaveCount(1);
    await expect(page.locator('#about [data-material="classic"]')).toHaveCount(1);

    await classic(page).click();
    await expect(classic(page)).toHaveAttribute("aria-checked", "true");
    await expect(chrome(page)).toHaveAttribute("aria-checked", "false");
    expect(await material(page)).toBe("classic");
    await expect(page.locator('#about [data-material="classic"]')).toHaveCSS("opacity", "1");
    await expect(page.locator('#about [data-material="chrome"]')).toHaveCSS("visibility", "hidden");

    await page.reload();
    expect(await material(page)).toBe("classic");
    await expect(classic(page)).toHaveAttribute("aria-checked", "true");
    expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBe("classic");

    await chrome(page).click();
    await expect(chrome(page)).toHaveAttribute("aria-checked", "true");
    expect(await material(page)).toBe("chrome");
    await expect(page.locator('#about [data-material="classic"]')).toHaveCSS("opacity", "0");
    await page.reload();
    expect(await material(page)).toBe("chrome");
  });

  test("keyboard: the group is one tab stop, arrows move and select", async ({ page }) => {
    await page.goto("/");
    await chrome(page).focus();
    await expect(chrome(page)).toHaveAttribute("tabindex", "0");
    await expect(classic(page)).toHaveAttribute("tabindex", "-1");
    await page.keyboard.press("ArrowRight");
    await expect(classic(page)).toBeFocused();
    await expect(classic(page)).toHaveAttribute("aria-checked", "true");
    expect(await material(page)).toBe("classic");
    await page.keyboard.press("ArrowLeft");
    await expect(chrome(page)).toBeFocused();
    expect(await material(page)).toBe("chrome");
  });

  test("touch targets are at least 44px", async ({ page }) => {
    await page.goto("/");
    for (const option of [chrome(page), classic(page)]) {
      const box = await option.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    }
  });

  test("a saved choice is applied before first paint (no flash)", async ({ page }) => {
    await page.addInitScript((key) => localStorage.setItem(key, "classic"), KEY);
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        (window as unknown as { __atReady: string | null }).__atReady = document.documentElement.getAttribute("data-logo-material");
      });
    });
    await page.goto("/");
    expect(await page.evaluate(() => (window as unknown as { __atReady: string | null }).__atReady)).toBe("classic");
  });

  test("works with reduced motion: switches at once, no transition", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await classic(page).click();
    expect(await material(page)).toBe("classic");
    await expect(classic(page)).toHaveAttribute("aria-checked", "true");
    const layer = page.locator('#about [data-material="classic"]');
    // 0s, or the global reduced-motion floor (1e-5s): either way, no visible fade.
    const duration = await layer.evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration));
    expect(duration).toBeLessThan(0.001);
    await expect(layer).toHaveCSS("opacity", "1");
    await page.reload();
    expect(await material(page)).toBe("classic");
  });

  test("with storage blocked the toggle still works for the page view", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new Error("blocked");
        },
      });
    });
    await page.goto("/");
    await classic(page).click();
    expect(await material(page)).toBe("classic");
    await expect(classic(page)).toHaveAttribute("aria-checked", "true");
  });

  test("the hero mark and the tier glow follow the choice", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.goto("/");
    const mark = page.locator("[data-hero] .cx-chart > div").first();
    const glow = page.locator('[data-hero] .cx-tier[data-i="0"] .cx-glow');
    await classic(page).click();
    await expect(mark.locator('[data-material="classic"]')).toHaveCSS("opacity", "1");
    await expect(glow.locator('[data-material="chrome"]')).toHaveCSS("visibility", "hidden");
    await chrome(page).click();
    await expect(mark.locator('[data-material="classic"]')).toHaveCSS("opacity", "0");
    await expect(glow.locator('[data-material="chrome"]')).toHaveCSS("visibility", "visible");
    expect(errors).toEqual([]);
  });
});
