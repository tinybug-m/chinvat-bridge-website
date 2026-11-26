// Client address for rate limiting (src/lib/client-address.ts): only edge-set headers are trusted.
import assert from "node:assert/strict";
import { test } from "node:test";
import { clientAddress, rateLimitKey } from "../../src/lib/client-address.ts";

const headers = (h) => (name) => h[name] ?? null;

test("on Vercel the edge-set address is used, preferring x-vercel-forwarded-for", () => {
  const env = { VERCEL: "1", NODE_ENV: "production" };
  assert.equal(clientAddress(headers({ "x-vercel-forwarded-for": "203.0.113.7", "x-forwarded-for": "198.51.100.1" }), env), "203.0.113.7");
  assert.equal(clientAddress(headers({ "x-real-ip": "2001:db8::1" }), env), "2001:db8:0:0::/64");
  assert.equal(clientAddress(headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }), env), "203.0.113.9");
});

test("garbage in forwarding headers is not used as a key", () => {
  const env = { VERCEL: "1", NODE_ENV: "production" };
  assert.equal(clientAddress(headers({ "x-forwarded-for": "<script>, 1.2.3.4" }), env), "unknown");
});

test("outside Vercel, client-supplied forwarding headers are ignored", () => {
  const spoof = headers({ "x-forwarded-for": "1.2.3.4", "x-real-ip": "5.6.7.8" });
  assert.equal(clientAddress(spoof, { NODE_ENV: "production" }), "unknown");
  assert.equal(clientAddress(spoof, { NODE_ENV: "development" }), "local");
});

test("the e2e-only opt-in trusts X-Forwarded-For off Vercel, and never changes Vercel's answer", () => {
  const headers = { "x-forwarded-for": "2001:db8::7, 10.0.0.1", "x-vercel-forwarded-for": "203.0.113.9" };
  const get = (name) => headers[name] ?? null;
  const optIn = { RATE_LIMIT_TRUST_FORWARDED_FOR: "1" };
  assert.equal(clientAddress(get, { NODE_ENV: "production", ...optIn }), "2001:db8:0:0::/64");
  assert.equal(clientAddress(get, { NODE_ENV: "development", ...optIn }), "2001:db8:0:0::/64");
  // Without the opt-in the header stays untrusted.
  assert.equal(clientAddress(get, { NODE_ENV: "production" }), "unknown");
  // On Vercel the edge's own header wins, opt-in or not.
  assert.equal(clientAddress(get, { VERCEL: "1", NODE_ENV: "production", ...optIn }), "203.0.113.9");
  // A malformed header falls back to the shared bucket.
  assert.equal(clientAddress((n) => (n === "x-forwarded-for" ? "not-an-ip" : null), { NODE_ENV: "production", ...optIn }), "unknown");
});

test("IPv6 addresses share one key per /64; IPv4 and IPv4-mapped stay per address", () => {
  assert.equal(rateLimitKey("2001:db8:1:2:aaaa:bbbb:cccc:dddd"), "2001:db8:1:2::/64");
  assert.equal(rateLimitKey("2001:0db8:0001:0002::1"), "2001:db8:1:2::/64");
  assert.equal(rateLimitKey("2001:DB8:1:2::ffff"), "2001:db8:1:2::/64");
  assert.equal(rateLimitKey("::1"), "0:0:0:0::/64");
  assert.equal(rateLimitKey("fe80::"), "fe80:0:0:0::/64");
  assert.equal(rateLimitKey("203.0.113.7"), "203.0.113.7");
  assert.equal(rateLimitKey("::ffff:203.0.113.7"), "203.0.113.7");
  for (const bad of ["1:2:3:4:5:6:7:8:9", "1::2::3", "12345::1", "1:2:3", "999.1", "::ffff:zz", ""]) {
    assert.equal(rateLimitKey(bad), null, bad);
  }
});
