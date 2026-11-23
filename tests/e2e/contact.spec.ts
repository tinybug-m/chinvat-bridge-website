import { expect, test, type Page } from "@playwright/test";
import { ONCE } from "./once";

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
  // A message sent within three seconds of the conversation opening is treated as a bot and quietly
  // "succeeds" without being processed (actions/enquiry.ts). Moving the page's clock past that
  // window means every send takes the real path, however fast or slow the run is.
  await page.clock.fastForward(3_000);
  await contact(page).getByRole("button", { name: "Send message" }).click();
}

/*
 * The suite runs against a production build with no mail credentials, where the enquiry action
 * ends at its mail step with "unavailable". Each send still goes to the real server action
 * (validation, rate limit, composing the email); only that one outcome, which means "no mail
 * transport here", is replaced with "sent". Any other result (invalid, limited, error) reaches the
 * page as it is, so a real failure still fails the test.
 */
const NO_MAIL_TRANSPORT = /\{"status":"unavailable","message":"[^"]*"\}/;
async function stubMailDelivery(page: Page) {
  await page.route("**/*", async (route) => {
    if (route.request().method() !== "POST" || !route.request().headers()["next-action"]) return route.fallback();
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace(NO_MAIL_TRANSPORT, '{"status":"sent"}') });
  });
}

/*
 * The action allows five sends per client address per ten minutes, keyed on x-forwarded-for, and
 * remembers them in the server's memory. Each test sends from its own address in the IPv6
 * documentation range (RFC 3849), with a random segment per run, so no two tests share that
 * allowance, even across runs against the same long-lived server.
 */
const hex4 = () => Math.floor(Math.random() * 0x10000).toString(16);
const RUN = `2001:db8:${hex4()}:${hex4()}`;
let client = 0;

test.describe("contact section", () => {
  test.use({ reducedMotion: "reduce" });

  test.beforeEach(async ({ page }, testInfo) => {
    client += 1;
    await page.setExtraHTTPHeaders({ "x-forwarded-for": `${RUN}:${testInfo.parallelIndex.toString(16)}::${client.toString(16)}` });
    // The real clock keeps running; fillContact only moves it forward.
    await page.clock.install();
    await stubMailDelivery(page);
  });

  test("topic, a sentence, then name and email: sends from the page and confirms", ONCE, async ({ page }) => {
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

  test("a message sent after reading a service page says which page prompted it", ONCE, async ({ page }) => {
    const sends = recordSends(page);
    await page.goto("/services/workflow-automation");
    await page.getByRole("link", { name: "Describe a process" }).first().click();
    await expect(page).toHaveURL(/\/#contact$/);
    await say(page, /What can we help you with/, "Invoices are retyped by hand.");
    await fillContact(page, "Ada", "ada@example.com");
    await expect(log(page)).toContainText("Got it, thanks Ada.");
    expect(sends[0]).toContain('"entry":"/services/workflow-automation"');
    expect(sends[0]).toContain('"previous":"/services/workflow-automation"');
  });

  test("typing straight away skips the topic", ONCE, async ({ page }) => {
    const sends = recordSends(page);
    await page.goto("/");
    await say(page, /What can we help you with/, "We need a booking system.");
    await expect(log(page)).toContainText("Where should we send our reply?");
    await fillContact(page, "Ada", "ada@example.com");
    await expect(log(page)).toContainText("Got it, thanks Ada.");
    expect(sends[0]).toContain("We need a booking system.");
    expect(sends[0]).toContain('"need":""');
  });

  test("when sending fails, it says so and offers the email app instead", ONCE, async ({ page }) => {
    await page.route("**/*", (route) => (route.request().headers()["next-action"] ? route.abort() : route.fallback()));
    await page.goto("/");
    await say(page, /What can we help you with/, "We need a booking system.");
    await fillContact(page, "Ada", "ada@example.com");
    await expect(contact(page).getByText(/That didn’t go through\. Try again/)).toBeVisible();
    await expect(contact(page).getByRole("link", { name: "email it to us instead" })).toHaveAttribute("href", /^mailto:.*booking%20system/);
    await expect(contact(page).getByRole("button", { name: "Send message" })).toBeEnabled();
  });

  test("checks name and email in place, without sending", ONCE, async ({ page }) => {
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

  test("clicking an answer rewinds to it for editing", ONCE, async ({ page }) => {
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

  test("send another message starts over", ONCE, async ({ page }) => {
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
