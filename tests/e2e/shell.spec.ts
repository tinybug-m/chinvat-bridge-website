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
    // Insights is the index page, not the homepage teaser.
    await expect(dialog.getByRole("link", { name: "Insights" })).toHaveAttribute("href", "/insights");
    await dialog.getByRole("link", { name: /About/ }).click();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/#about$/);
    await expect(page.locator("#about")).toBeInViewport();
  });

  test("the menu sheet is loaded on demand, not with the page", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "desktop", "the menu button is hidden on desktop");
    const scripts: { url: string; body: Promise<string> }[] = [];
    page.on("response", (response) => {
      if (response.request().resourceType() === "script") scripts.push({ url: response.url(), body: response.text().catch(() => "") });
    });
    // Radix Dialog's focus guards are a string that survives minification.
    const withDialog = async () => (await Promise.all(scripts.map(async (s) => ((await s.body).includes("data-radix-focus-guard") ? s.url : null)))).filter(Boolean);

    await page.goto("/", { waitUntil: "load" });
    expect(await withDialog()).toEqual([]);
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect((await withDialog()).length).toBeGreaterThan(0);
  });

  test("mobile header keeps a compact Contact link beside the menu", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "below sm only");
    for (const width of [390, 360]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/");
      const header = page.locator("header");
      const contact = header.getByRole("link", { name: "Contact", exact: true });
      await expect(contact).toBeVisible();
      await expect(contact).toHaveAttribute("href", "/#contact");
      expect((await contact.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
      const menu = await header.getByRole("button", { name: "Menu" }).boundingBox();
      const cta = await contact.boundingBox();
      expect(cta!.x + cta!.width).toBeLessThanOrEqual(menu!.x);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    }
  });

  test("desktop header links reach every chapter", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    for (const name of ["Services", "Work", "Approach", "About"]) {
      await nav.getByRole("link", { name }).click();
      // Generous: the long smooth scroll passes the 3D stages, which can hold the main thread for a few seconds.
      await expect(page.locator(`#${name === "Approach" ? "approach" : name.toLowerCase()}`)).toBeInViewport({ timeout: 20_000 });
    }
    await expect(nav.getByRole("link", { name: "Insights" })).toHaveAttribute("href", "/insights");
    await expect(nav.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
    // Links run in page order.
    await expect(nav.getByRole("link")).toHaveText(["Services", "Work", "Approach", "About", "Insights", "Pricing"]);
  });

  test("the active chapter stays on Approach while reading Method, and clears when Capabilities opens", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await page.evaluate(() => document.getElementById("capabilities")!.scrollIntoView({ behavior: "instant", block: "center" }));
    await expect(page.locator("#capabilities")).toBeInViewport();
    await expect(nav.locator("[data-active]")).toHaveCount(0);
    await page.evaluate(() => document.getElementById("method")!.scrollIntoView({ behavior: "instant", block: "center" }));
    await expect(nav.getByRole("link", { name: "Approach" })).toHaveAttribute("data-active", "true");
  });

  test("one decorative indicator follows the lit link and hides when none is lit", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    const bar = nav.locator("span[aria-hidden=true]");
    await expect(bar).toHaveCount(1);
    await expect(bar).toHaveCSS("opacity", "0");
    await page.evaluate(() => document.getElementById("about")!.scrollIntoView({ behavior: "instant", block: "center" }));
    await expect(nav.getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "location");
    await expect(bar).toHaveCSS("opacity", "1");
    const linkBox = await nav.getByRole("link", { name: "About" }).boundingBox();
    // Settled under the About label (350ms slide).
    await expect.poll(async () => Math.abs(((await bar.boundingBox())?.x ?? -999) - (linkBox!.x + 8))).toBeLessThanOrEqual(14);
    await page.evaluate(() => document.getElementById("capabilities")!.scrollIntoView({ behavior: "instant", block: "center" }));
    await expect(bar).toHaveCSS("opacity", "0");
  });

  // Pricing is a page link, not a homepage chapter, so scroll-spy never lights it on the homepage.
  test("Pricing is not lit on the homepage", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link", { name: "Pricing" })).not.toHaveAttribute("aria-current", /.+/);
  });

  test("the scrolled header is a solid paper bar, not translucent", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.getElementById("about")!.scrollIntoView({ behavior: "instant", block: "center" }));
    const header = page.locator("header").first();
    await expect(header).toHaveAttribute("data-scrolled", "true");
    await expect.poll(() => header.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(246, 244, 239)");
    expect(await header.evaluate((el) => getComputedStyle(el).backdropFilter)).toBe("none");
  });

  test("the footer lists Work among the chapters", async ({ page }) => {
    await page.goto("/");
    const explore = page.getByRole("navigation", { name: "Footer: Explore" });
    await expect(explore.getByRole("link", { name: "Work" })).toHaveAttribute("href", "/#work");
    await expect(explore.getByRole("link", { name: "Insights" })).toHaveAttribute("href", "/insights");
  });

  test("Insights lights while its homepage teaser is read, and on the insights pages", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop only");
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await page.evaluate(() => document.getElementById("insights")!.scrollIntoView({ behavior: "instant", block: "center" }));
    await expect(nav.getByRole("link", { name: "Insights" })).toHaveAttribute("aria-current", "location");
    await page.goto("/insights");
    await expect(nav.getByRole("link", { name: "Insights" })).toHaveAttribute("aria-current", "page");
    await page.goto("/insights/what-should-you-automate-first");
    await expect(nav.getByRole("link", { name: "Insights" })).toHaveAttribute("aria-current", "true");
    await expect(nav.getByRole("link", { name: "Pricing" })).not.toHaveAttribute("aria-current", /.+/);
  });
});
