import { expect, test } from "@playwright/test";

const PEOPLE = [
  ["Artin", "Owner"],
  ["Arshia", "CTO"],
  ["Erik", "SEO expert"],
] as const;

test.describe("team section", () => {
  test("heading, three people with their exact roles", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#team");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("The team.");
    await expect(section.locator("h2")).toHaveAttribute("id", "team-title");
    await expect(section).toHaveAttribute("aria-labelledby", "team-title");
    const items = section.locator("ul > li");
    await expect(items).toHaveCount(3);
    for (const [index, [name, role]] of PEOPLE.entries()) {
      await expect(items.nth(index)).toHaveText(`${name}, ${role}`);
    }
  });

  test("comes straight after About and invents no photos or links", async ({ page }) => {
    await page.goto("/");
    const ids = await page.locator("main section[id]").evaluateAll((els) => els.map((el) => el.id));
    expect(ids.indexOf("team")).toBe(ids.indexOf("about") + 1);
    await expect(page.locator("#team img, #team a, #team figure")).toHaveCount(0);
  });

  test("names step down the grid and every role shares one column on wide screens", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "the stagger only applies from lg up");
    await page.goto("/");
    const items = page.locator("#team ul > li");
    const lefts = async (selector: string) =>
      items.evaluateAll((els, sel) => els.map((el) => Math.round(el.querySelector(sel)!.getBoundingClientRect().left)), selector);
    const names = await lefts("span:first-child");
    expect(names[0]).toBeLessThan(names[1]);
    expect(names[1]).toBeLessThan(names[2]);
    expect(new Set(await lefts("span:last-child")).size).toBe(1);
  });

  test("no horizontal overflow and content is visible without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto("/");
    for (const [name] of PEOPLE) await expect(page.locator("#team").getByText(name, { exact: true })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await context.close();
  });

  test("the section fits inside a 390px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const right = await page.locator("#team ul").evaluate((el) =>
      Math.max(...[...el.querySelectorAll("li, li span")].map((n) => n.getBoundingClientRect().right)),
    );
    expect(right).toBeLessThanOrEqual(390);
  });
});
