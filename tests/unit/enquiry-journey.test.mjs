// Runs with Node's own test runner and type stripping (Node 24): `pnpm test:unit`.
// The sanitiser only feeds the enquiry email, which the e2e suite cannot see (no mail transport),
// so its edge cases are checked here.
import assert from "node:assert/strict";
import { test } from "node:test";
import { hostName, journeyLines, sitePath } from "../../src/lib/enquiry-journey.ts";

test("sitePath keeps site paths and plain query strings", () => {
  assert.equal(sitePath("/services/seo"), "/services/seo");
  assert.equal(sitePath("/"), "/");
  assert.equal(sitePath("/a%20b/c~@x"), "/a%20b/c~@x");
  assert.equal(sitePath("/insights?utm_source=google&utm_medium=cpc"), "/insights?utm_source=google&utm_medium=cpc");
  assert.equal(sitePath("/?q=a+b"), "/?q=a+b");
  // URLSearchParams leaves "*" unencoded.
  assert.equal(sitePath(`/pricing?${new URLSearchParams({ utm_term: "seo*" })}`), "/pricing?utm_term=seo*");
});

test("sitePath drops an unusable query but keeps the landing page", () => {
  assert.equal(sitePath("/pricing?utm_source=a(b)"), "/pricing");
  assert.equal(sitePath("/pricing?a=1?b=2"), "/pricing");
  assert.equal(sitePath("/pricing?"), "/pricing");
});

test("sitePath refuses anything that is not a path on this site", () => {
  assert.equal(sitePath("//evil.example/path"), "");
  assert.equal(sitePath("https://evil.example/"), "");
  assert.equal(sitePath("pricing"), "");
  assert.equal(sitePath("/a b"), "");
  assert.equal(sitePath("/a\nb"), "");
  assert.equal(sitePath(""), "");
  assert.equal(sitePath(42), "");
  assert.equal(sitePath(undefined), "");
});

test("hostName accepts bare host names only", () => {
  assert.equal(hostName("WWW.Google.com"), "www.google.com");
  assert.equal(hostName("https://www.google.com"), "");
  assert.equal(hostName("a b"), "");
});

test("journeyLines names the first page, its source and the page before contact", () => {
  assert.deepEqual(journeyLines({ entry: "/services/seo?utm_source=x", referrer: "www.google.com", previous: "/pricing" }), [
    "First page: /services/seo?utm_source=x (from www.google.com)",
    "Page before contact: /pricing",
  ]);
  assert.deepEqual(journeyLines({ entry: "/pricing", previous: "/pricing" }), ["First page: /pricing (direct or unknown)"]);
  assert.deepEqual(journeyLines({ entry: "//evil.example" }), []);
  assert.deepEqual(journeyLines(undefined), []);
});
