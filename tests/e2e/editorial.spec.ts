import { expect, test } from "@playwright/test";

// The publication-event endpoint is reachable from the internet; only correctly signed events from the
// editorial backend may trigger a refresh. (Signed delivery is exercised end to end by the backend's
// lifecycle test, which holds the shared secret.)
test.describe("editorial revalidation endpoint", () => {
  test("refuses unsigned, wrongly signed and malformed requests", async ({ request }) => {
    const body = JSON.stringify({ id: "00000000-0000-4000-8000-000000000000", type: "article.published", occurredAt: new Date().toISOString(), article: { id: 1, slug: "x-y", previousSlug: null, revisionId: 1 } });
    const unsigned = await request.post("/api/editorial/revalidate", { data: body, headers: { "content-type": "application/json" } });
    expect([401, 503]).toContain(unsigned.status());
    const forged = await request.post("/api/editorial/revalidate", {
      data: body,
      headers: { "content-type": "application/json", "x-editorial-timestamp": String(Math.floor(Date.now() / 1000)), "x-editorial-signature": `v1=${"0".repeat(64)}` },
    });
    expect([401, 503]).toContain(forged.status());
    const stale = await request.post("/api/editorial/revalidate", {
      data: body,
      headers: { "content-type": "application/json", "x-editorial-timestamp": "1000", "x-editorial-signature": `v1=${"0".repeat(64)}` },
    });
    expect([401, 503]).toContain(stale.status());
    expect(stale.headers()["cache-control"]).toContain("no-store");
  });

  test("only POST is accepted", async ({ request }) => {
    expect((await request.get("/api/editorial/revalidate")).status()).toBe(405);
  });
});
