import { expect, test, type Page } from "@playwright/test";

const EMAIL = "contact@chinvatbridge.com";

/** Collects the bodies of Server Action POSTs (the request that sends the message). */
function recordSends(page: Page) {
  const bodies: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && request.headers()["next-action"]) bodies.push(request.postData() ?? "");
  });
  return bodies;
}

const contact = (page: Page) => page.locator("#contact");
const log = (page: Page) => contact(page).getByRole("log");

/** Types into the composer (labelled by the question it answers) and sends. */
async function say(page: Page, question: RegExp, text: string) {
  await contact(page).getByRole("textbox", { name: question }).fill(text);
  await contact(page).getByRole("button", { name: "Send", exact: true }).click();
}

async function fillContact(page: Page, name: string, email: string, company = "") {
  await contact(page).getByLabel("Name").fill(name);
  await contact(page).getByLabel("Email").fill(email);
  if (company) await contact(page).getByLabel(/Company/).fill(company);
  await contact(page).getByRole("button", { name: "Send message" }).click();
}

test.describe("contact section", () => {
  test.use({ reducedMotion: "reduce" });

  test("shows the closing heading, direct details and the first question with topics", async ({ page }) => {
    await page.goto("/");
    const section = contact(page);
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("Build a better way forward.");
    await expect(section.getByRole("link", { name: EMAIL })).toHaveAttribute("href", `mailto:${EMAIL}`);
    await expect(section.getByText("Chinvat Bridge", { exact: true })).toBeVisible();
    await expect(section.getByText("1 of 3")).toBeVisible();
    await expect(log(page).getByRole("listitem")).toHaveCount(1);
    await expect(section.getByRole("group", { name: /What can we help you with/ }).getByRole("button")).toHaveCount(5);
    await expect(section.getByRole("textbox", { name: /What can we help you with/ })).toBeVisible();
    // Nothing takes focus on page load.
    await expect(section.getByRole("textbox")).not.toBeFocused();
  });

  test("topic, a sentence, then name and email: sends from the page and confirms", async ({ page }) => {
    const sends = recordSends(page);
    await page.goto("/");
    await contact(page).getByRole("button", { name: "AI & Automation" }).click();
    await expect(log(page)).toContainText("What would you like to automate");
    await expect(contact(page).getByText("2 of 3")).toBeVisible();
    await say(page, /automate/, "Our weekly reporting.");
    await expect(contact(page).getByLabel("Name")).toBeFocused();
    await fillContact(page, "Ada Lovelace", "ada@example.com", "Analytical Engines Ltd");

    await expect(log(page)).toContainText("Got it, thanks Ada. Your message is with us, and we’ll reply to ada@example.com.");
    await expect(contact(page).getByText("Sent", { exact: true })).toBeVisible();
    expect(sends).toHaveLength(1);
    for (const part of ["Ada Lovelace", "ada@example.com", "Analytical Engines Ltd", "AI & Automation", "Our weekly reporting."]) {
      expect(sends[0]).toContain(part);
    }
  });

  test("typing straight away skips the topic", async ({ page }) => {
    const sends = recordSends(page);
    await page.goto("/");
    await say(page, /What can we help you with/, "We need a booking system.");
    await expect(log(page)).toContainText("Where should we send our reply?");
    await fillContact(page, "Ada", "ada@example.com");
    await expect(log(page)).toContainText("Got it, thanks Ada.");
    expect(sends[0]).toContain("We need a booking system.");
    expect(sends[0]).toContain('"need":""');
  });

  test("when sending fails, it says so and offers the email app instead", async ({ page }) => {
    await page.route("**/*", (route) => (route.request().headers()["next-action"] ? route.abort() : route.fallback()));
    await page.goto("/");
    await say(page, /What can we help you with/, "We need a booking system.");
    await fillContact(page, "Ada", "ada@example.com");
    await expect(contact(page).getByText(/That didn’t go through\. Try again/)).toBeVisible();
    await expect(contact(page).getByRole("link", { name: "email it to us instead" })).toHaveAttribute("href", /^mailto:.*booking%20system/);
    await expect(contact(page).getByRole("button", { name: "Send message" })).toBeEnabled();
  });

  test("checks name and email in place, without sending", async ({ page }) => {
    const sends = recordSends(page);
    await page.goto("/");
    await say(page, /What can we help you with/, "We need a booking system.");
    await contact(page).getByRole("button", { name: "Send message" }).click();
    const name = contact(page).getByLabel("Name");
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(name).toBeFocused();
    await expect(contact(page)).toContainText("Add your email so we can reply.");
    await name.fill("Ada");
    await expect(name).not.toHaveAttribute("aria-invalid", "true");
    await contact(page).getByLabel("Email").fill("not-an-email");
    await contact(page).getByRole("button", { name: "Send message" }).click();
    await expect(contact(page)).toContainText("Check the address");
    expect(sends).toEqual([]);
  });

  test("clicking an answer rewinds to it for editing", async ({ page }) => {
    await page.goto("/");
    await contact(page).getByRole("button", { name: "Workflows" }).click();
    await say(page, /process/, "Invoices take forever.");
    await contact(page).getByRole("button", { name: /Invoices take forever\. Edit this answer/ }).click();
    const box = contact(page).getByRole("textbox", { name: /process/ });
    await expect(box).toHaveValue("Invoices take forever.");
    await expect(box).toBeFocused();
    await contact(page).getByRole("button", { name: /Workflows\. Edit this answer|Workflows Edit this answer/ }).click();
    await expect(log(page).getByRole("listitem")).toHaveCount(1);
    await expect(contact(page).getByRole("group", { name: /What can we help you with/ })).toBeVisible();
  });

  test("send another message starts over", async ({ page }) => {
    await page.goto("/");
    await say(page, /What can we help you with/, "We need a booking system.");
    await fillContact(page, "Ada", "ada@example.com");
    await contact(page).getByRole("button", { name: "Send another message" }).click();
    await expect(log(page).getByRole("listitem")).toHaveCount(1);
    await expect(contact(page).getByText("1 of 3")).toBeVisible();
  });

  test("the page does not grow as the conversation does, no overflow, 44px targets", async ({ page }) => {
    await page.goto("/");
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    await contact(page).getByRole("button", { name: "Not sure yet" }).click();
    await say(page, /slowing/, "Line one.\nLine two.\nLine three.");
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(height);
    await expect(contact(page).getByRole("button", { name: "Send message" })).toBeVisible();
    expect((await contact(page).getByRole("button", { name: "Send message" }).boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
