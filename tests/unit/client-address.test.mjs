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
