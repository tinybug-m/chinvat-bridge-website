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
const message = (page: Page) => contact(page).getByRole("textbox", { name: "How can we help?" });
const send = (page: Page) => contact(page).getByRole("button", { name: "Send message" });
const sent = (page: Page) => contact(page).getByRole("heading", { name: "Message sent." });

async function fill(page: Page, text: string, name = "Ada", email = "ada@example.com") {
  await message(page).fill(text);
  await contact(page).getByLabel("Your name").fill(name);
  await contact(page).getByLabel("Email", { exact: true }).fill(email);
  // A message sent within three seconds of the form opening is treated as a bot and quietly
  // "succeeds" without being processed (actions/enquiry.ts). Moving the page's clock past that
  // window means every send takes the real path, however fast or slow the run is.
  await page.clock.fastForward(3_000);
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
    // The real clock keeps running; fill only moves it forward.
    await page.clock.install();
    await stubMailDelivery(page);
  });

  test("a message, a topic, name and email: sends from the page and confirms", ONCE, async ({ page }) => {
    const sends = recordSends(page);
    await page.goto("/");
    await fill(page, "Our weekly reporting.", "Ada Lovelace");
    await contact(page).getByText("AI & Automation", { exact: true }).click();
    await send(page).click();

    await expect(sent(page)).toBeFocused();
    await expect(contact(page)).toContainText("Thanks, Ada. We’ll reply to ada@example.com.");
    expect(sends).toHaveLength(1);
    for (const part of ["Ada Lovelace", "ada@example.com", "AI & Automation", "Our weekly reporting."]) {
      expect(sends[0]).toContain(part);
    }
  });

  test("a message sent after reading a service page says which page prompted it", ONCE, async ({ page }) => {
    const sends = recordSends(page);
    await page.goto("/services/workflow-automation");
    await page.getByRole("link", { name: "Describe a process" }).first().click();
    await expect(page).toHaveURL(/\/#contact$/);
    await fill(page, "Invoices are retyped by hand.");
    await send(page).click();
    await expect(sent(page)).toBeVisible();
    expect(sends[0]).toContain('"entry":"/services/workflow-automation"');
    expect(sends[0]).toContain('"previous":"/services/workflow-automation"');
    expect(sends[0]).toContain('"need":""');
  });

  test("when sending fails, it says so, keeps the text and offers the email app", ONCE, async ({ page }) => {
    await page.route("**/*", (route) => (route.request().headers()["next-action"] ? route.abort() : route.fallback()));
    await page.goto("/");
    await fill(page, "We need a booking system.");
    await send(page).click();
    await expect(contact(page).getByText(/That didn’t go through\. Your message is still here/)).toBeVisible();
    await expect(contact(page).getByRole("link", { name: "send it from your email app" })).toHaveAttribute("href", /^mailto:.*booking%20system/);
    await expect(message(page)).toHaveValue("We need a booking system.");
    await expect(send(page)).toBeEnabled();
  });

  test("checks the fields in place, without sending", ONCE, async ({ page }) => {
    const sends = recordSends(page);
    await page.goto("/");
    await send(page).click();
    await expect(message(page)).toHaveAttribute("aria-invalid", "true");
    await expect(message(page)).toBeFocused();
    await expect(contact(page)).toContainText("Add your email so we can reply.");
    await message(page).fill("We need a booking system.");
    await expect(message(page)).not.toHaveAttribute("aria-invalid", "true");
    await contact(page).getByLabel("Email", { exact: true }).fill("not-an-email");
    await send(page).click();
    await expect(contact(page)).toContainText("Check the address");
    expect(sends).toEqual([]);
  });

  test("send another keeps the name and email", ONCE, async ({ page }) => {
    await page.goto("/");
    await fill(page, "We need a booking system.");
    await send(page).click();
    await contact(page).getByRole("button", { name: "Send another" }).click();
    await expect(message(page)).toHaveValue("");
    await expect(message(page)).toBeFocused();
    await expect(contact(page).getByLabel("Your name")).toHaveValue("Ada");
  });

  test("switching to Windy Pup and back keeps both drafts", async ({ page }) => {
    await page.goto("/");
    const ask = contact(page).getByRole("tab", { name: /Ask Windy Pup/ });
    // Without a model key the section is the form alone.
    test.skip((await ask.count()) === 0, "chat is not available on this server");
    await message(page).fill("Half a message");
    await ask.click();
    const line = contact(page).getByRole("textbox", { name: "Your message" });
    await line.fill("Half a question");
    await contact(page).getByRole("tab", { name: "Write to us" }).click();
    await expect(message(page)).toHaveValue("Half a message");
    await ask.click();
    await expect(line).toHaveValue("Half a question");
  });

  test("sending does not change the page's height, no overflow, 44px targets", async ({ page }) => {
    await page.goto("/");
    await fill(page, "Line one.\nLine two.\nLine three.");
    expect((await send(page).boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    const section = () => contact(page).evaluate((el) => Math.round(el.getBoundingClientRect().height));
    const height = await section();
    await send(page).click();
    await expect(sent(page)).toBeVisible();
    expect(await section()).toBe(height);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
