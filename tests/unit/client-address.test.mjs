// Client address for rate limiting (src/lib/client-address.ts): only edge-set headers are trusted.
import assert from "node:assert/strict";
import { test } from "node:test";
import { clientAddress } from "../../src/lib/client-address.ts";

const headers = (h) => (name) => h[name] ?? null;

test("on Vercel the edge-set address is used, preferring x-vercel-forwarded-for", () => {
  const env = { VERCEL: "1", NODE_ENV: "production" };
  assert.equal(clientAddress(headers({ "x-vercel-forwarded-for": "203.0.113.7", "x-forwarded-for": "198.51.100.1" }), env), "203.0.113.7");
  assert.equal(clientAddress(headers({ "x-real-ip": "2001:db8::1" }), env), "2001:db8::1");
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
  assert.equal(clientAddress(get, { NODE_ENV: "production", ...optIn }), "2001:db8::7");
  assert.equal(clientAddress(get, { NODE_ENV: "development", ...optIn }), "2001:db8::7");
  // Without the opt-in the header stays untrusted.
  assert.equal(clientAddress(get, { NODE_ENV: "production" }), "unknown");
  // On Vercel the edge's own header wins, opt-in or not.
  assert.equal(clientAddress(get, { VERCEL: "1", NODE_ENV: "production", ...optIn }), "203.0.113.9");
  // A malformed header falls back to the shared bucket.
  assert.equal(clientAddress((n) => (n === "x-forwarded-for" ? "not-an-ip" : null), { NODE_ENV: "production", ...optIn }), "unknown");
});
