import { expect, test, type Page } from "@playwright/test";

const EMAIL = "chinvatbridge.tech@gmail.com";

/** Records programmatic anchor clicks (how the brief opens the mail client) instead of navigating. */
async function stubMailClient(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __mailto: string[] };
    w.__mailto = [];
    HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
      w.__mailto.push(this.href);
    };
  });
}

async function fill(page: Page) {
  await page.getByLabel("Name", { exact: true }).fill("Ada Lovelace");
  await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
  await page.getByRole("button", { name: "AI & Automation" }).click();
  await page.getByRole("button", { name: "SEO & Growth" }).click();
  await page.getByRole("radio", { name: "1–3 months" }).click();
  await page.getByLabel("Message").fill("We need to automate our weekly reporting.");
}

test.describe("contact section", () => {
  test("shows the closing heading, direct details and the brief", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#contact");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("Build a better way forward.");
    await expect(section.getByRole("link", { name: EMAIL })).toHaveAttribute("href", `mailto:${EMAIL}`);
    await expect(section).toContainText("UK Based // Working Globally");
    await expect(section.getByRole("group", { name: "What do you need?" }).getByRole("button")).toHaveCount(5);
    await expect(section.getByRole("radiogroup", { name: /Timeline/ }).getByRole("radio")).toHaveCount(4);
    await expect(section.getByRole("button", { name: "Open email to send" })).toBeVisible();
  });

  test("validates on submit, then live per field", async ({ page }) => {
    await stubMailClient(page);
    await page.goto("/");
    const name = page.getByLabel("Name", { exact: true });
    const email = page.getByLabel("Email", { exact: true });
    const message = page.getByLabel("Message");
    await expect(name).not.toHaveAttribute("aria-invalid", "true");

    await page.getByRole("button", { name: "Open email to send" }).click();
    await expect(page.locator("#contact").getByRole("status").first()).toHaveText("4 fields need attention");
    await expect(name).toBeFocused();
    for (const [field, text] of [
      [name, "Enter your name."],
      [email, "Enter your email address."],
      [message, "Tell us a little about the project."],
    ] as const) {
      await expect(field).toHaveAttribute("aria-invalid", "true");
      const describedBy = await field.getAttribute("aria-describedby");
      await expect(page.locator(`#${describedBy?.split(" ")[0]}`)).toHaveText(text);
    }
    await expect(page.locator("#brief-needs-error")).toHaveText("Choose at least one option.");
    expect(await page.evaluate(() => (window as unknown as { __mailto: string[] }).__mailto)).toEqual([]);

    await name.fill("Ada");
    await expect(name).not.toHaveAttribute("aria-invalid", "true");
    await email.fill("not-an-email");
    await expect(page.locator("#brief-email-error")).toContainText("valid email");
    await message.fill("Too short");
    await expect(page.locator("#brief-message-error")).toContainText("at least 20 characters");
    await page.getByRole("button", { name: "Software & Web" }).click();
    await expect(page.locator("#brief-needs-error")).toBeHidden();

    await page.getByRole("button", { name: "Open email to send" }).click();
    await expect(page.locator("#contact").getByRole("status").first()).toHaveText("2 fields need attention");
    await expect(email).toBeFocused();
    await email.fill("ada@example.com");
    await message.fill("Exactly twenty chars!");
    await page.getByRole("button", { name: "Open email to send" }).click();
    await expect(page.getByText("Your email app should open. If it didn’t:")).toBeVisible();
  });

  test("opens the exact mailto URL for a filled brief", async ({ page }) => {
    await stubMailClient(page);
    await page.goto("/");
    await fill(page);
    await page.getByLabel(/Company/).fill("Analytical Engines Ltd");
    await page.getByRole("button", { name: "Open email to send" }).click();

    const body = [
      "Name: Ada Lovelace",
      "Email: ada@example.com",
      "Company: Analytical Engines Ltd",
      "Interested in: AI & Automation, SEO & Growth",
      "Timeline: 1–3 months",
      "",
      "We need to automate our weekly reporting.",
    ].join("\n");
    const expected = `mailto:${EMAIL}?subject=${encodeURIComponent("Project enquiry: AI & Automation, SEO & Growth")}&body=${encodeURIComponent(body)}`;
    await expect.poll(() => page.evaluate(() => (window as unknown as { __mailto: string[] }).__mailto)).toEqual([expected]);
  });

  test("uses an em dash for an empty company and timeline", async ({ page }) => {
    await stubMailClient(page);
    await page.goto("/");
    await page.getByLabel("Name", { exact: true }).fill("Ada");
    await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
    await page.getByRole("button", { name: "Not sure yet" }).click();
    await page.getByLabel("Message").fill("Just a conversation about options.");
    await page.getByRole("button", { name: "Open email to send" }).click();
    const [url] = await page.evaluate(() => (window as unknown as { __mailto: string[] }).__mailto);
    const body = decodeURIComponent(url.split("&body=")[1]);
    expect(body).toContain("Company: —\nInterested in: Not sure yet\nTimeline: —\n\nJust a conversation");
    expect(decodeURIComponent(url.split("?subject=")[1].split("&")[0])).toBe("Project enquiry: Not sure yet");
  });

  test("copy fallback: copies, and falls back to selectable text when the clipboard is blocked", async ({ page, context }, testInfo) => {
    await stubMailClient(page);
    if (testInfo.project.name === "desktop") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    await fill(page);
    await page.getByRole("button", { name: "Open email to send" }).click();
    await expect(page.getByText("Your email app should open. If it didn’t:")).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy message" })).toBeVisible();

    if (testInfo.project.name === "desktop") {
      await page.getByRole("button", { name: "Copy address" }).click();
      await expect(page.getByText("Address copied to the clipboard.")).toBeVisible();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EMAIL);
    }

    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("blocked")) }, configurable: true });
    });
    await page.getByRole("button", { name: "Copy message" }).click();
    await expect(page.getByText(/Copying was blocked/)).toBeVisible();
    const manual = page.getByLabel("Message to copy");
    await expect(manual).toBeFocused();
    await expect(manual).toHaveValue(/^Subject: Project enquiry: AI & Automation, SEO & Growth\n\nName: Ada Lovelace/);
  });

  test("no horizontal overflow and tap targets are 44px", async ({ page }) => {
    await page.goto("/");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    for (const locator of [page.getByRole("button", { name: "Workflows" }), page.getByRole("radio", { name: "Just exploring" }), page.getByRole("button", { name: "Open email to send" })]) {
      await locator.scrollIntoViewIfNeeded();
      expect((await locator.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
