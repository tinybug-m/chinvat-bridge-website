// Windy Pup chat: schema, prompt, errors, limiter, and the real gemini.ts against a local fake (test double).
import assert from "node:assert/strict";
import { register } from "node:module";
import { test } from "node:test";

// The sources use extensionless relative imports; teach Node's resolver to find the .ts files.
register(
  "data:text/javascript," +
    encodeURIComponent(`export async function resolve(s, c, next) {
  try { return await next(s, c); } catch (e) {
    if (s.startsWith(".") && !/\\.[a-z]+$/.test(s)) return next(s + ".ts", c);
    throw e;
  }
}`),
);

const base = "../../src/lib/windy-pop/";
const schema = await import(base + "chat-schema.ts");
const { buildSystemPrompt, FALLBACK_PROMPT } = await import(base + "prompt.ts");
const { classifyError, WindyError } = await import(base + "errors.ts");
const limits = await import(base + "limits.ts");
const { streamGemini } = await import(base + "gemini.ts");
const { mockStream, MOCK_FIRST_LINE } = await import(base + "mock.ts");
const { withMood } = await import(base + "mood.ts");
const { startFake } = await import("../../scripts/windy-pop/fake-gemini.mjs");

const u = (content) => ({ role: "user", content });
const a = (content) => ({ role: "assistant", content });

test("schema accepts a normal conversation and trims whitespace", () => {
  const r = schema.chatRequestSchema.safeParse({ messages: [u("  hi  ")] });
  assert.ok(r.success);
  assert.equal(r.data.messages[0].content, "hi");
});

test("schema rejects empty, over-long, and assistant-last", () => {
  assert.ok(!schema.chatRequestSchema.safeParse({ messages: [u("   ")] }).success);
  assert.ok(!schema.chatRequestSchema.safeParse({ messages: [u("x".repeat(schema.MAX_MESSAGE_CHARS + 1))] }).success);
  assert.ok(!schema.chatRequestSchema.safeParse({ messages: [u("hi"), a("hello")] }).success);
  assert.ok(!schema.chatRequestSchema.safeParse({ messages: [] }).success);
});

test("schema trims oldest messages by count and total size, keeping the last user message", () => {
  const many = Array.from({ length: 30 }, (_, i) => (i % 2 ? a(`a${i}`) : u(`u${i}`)));
  many.push(u("last"));
  const r = schema.chatRequestSchema.parse({ messages: many });
  assert.ok(r.messages.length <= schema.MAX_MESSAGES);
  assert.equal(r.messages.at(-1).content, "last");
  const big = Array.from({ length: 10 }, (_, i) => (i % 2 ? a("y".repeat(1400)) : u("x".repeat(1400))));
  big.push(u("final"));
  const t = schema.chatRequestSchema.parse({ messages: big });
  assert.ok(t.messages.reduce((n, m) => n + m.content.length, 0) <= schema.MAX_TOTAL_CHARS);
  assert.equal(t.messages.at(-1).content, "final");
  assert.equal(t.messages[0].role, "user");
});

const chrome = {
  settings: { siteDescription: "UK-based technology consultancy.", contactEmail: "team@example.com" },
  services: { items: [{ title: "Widget Wrangling", strapline: "Tidy widgets", description: "We wrangle widgets.", tags: ["alpha", "beta"], href: "/services/widgets" }] },
  capabilities: { items: [{ title: "Cap One", category: "Cat", description: "Does cap things." }] },
  processSteps: { items: [{ title: "Discover", description: "Look around." }] },
  workProjects: {
    items: [
      { name: "RealCo", context: "A site.", kind: "client" },
      { name: "DreamCo", context: "A mock-up.", kind: "concept" },
    ],
  },
};

test("prompt includes services, rules, concept/client wording, never Ltd", () => {
  const p = buildSystemPrompt(chrome);
  assert.match(p, /Widget Wrangling/);
  assert.match(p, /alpha, beta/);
  assert.match(p, /team@example\.com/);
  assert.match(p, /Never state prices, quotes, timelines, guarantees, client results or testimonials/);
  assert.match(p, /DreamCo: a design concept, NOT a client/);
  assert.match(p, /RealCo: client project/);
  assert.match(p, /Discover, Define, Build, Improve/);
  assert.ok(!/\bLtd\b/.test(p) || /never write "Ltd"/.test(p));
  assert.ok(!/\bLtd\b/.test(FALLBACK_PROMPT));
  assert.match(FALLBACK_PROMPT, /Do not describe specific services/);
});

test("error classification", () => {
  assert.equal(classifyError({ status: 429 }), "rate_limited");
  assert.equal(classifyError({ status: 500 }), "upstream_error");
  assert.equal(classifyError(new Error("x"), true), "timeout");
  assert.equal(classifyError(Object.assign(new Error("x"), { name: "AbortError" })), "timeout");
  assert.equal(classifyError(Object.assign(new TypeError("fetch failed"), { cause: { code: "ECONNREFUSED" } })), "network");
  assert.equal(classifyError(new WindyError("blocked")), "blocked");
  assert.equal(classifyError(new Error("???")), "upstream_error");
});

test("rate limiter: 10 per minute, then window slides; 60 per hour; key parsing", () => {
  limits.resetLimits();
  const t0 = 1_000_000;
  for (let i = 0; i < 10; i++) assert.ok(limits.checkLimit("k", t0 + i).ok);
  const blocked = limits.checkLimit("k", t0 + 20);
  assert.equal(blocked.ok, false);
  assert.ok(blocked.retryAfter >= 1 && blocked.retryAfter <= 60);
  assert.ok(limits.checkLimit("other", t0).ok);
  assert.ok(limits.checkLimit("k", t0 + 61_000).ok);
  limits.resetLimits();
  let now = t0;
  let ok = 0;
  for (let i = 0; i < 80; i++) {
    now += 7_000; // under the per-minute cap
    if (limits.checkLimit("h", now).ok) ok++;
  }
  assert.equal(ok, 60);
  const get = (h) => (n) => h[n] ?? null;
  assert.equal(limits.clientKey(get({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" })), "1.2.3.4");
  assert.equal(limits.clientKey(get({ "x-real-ip": "9.9.9.9" })), "9.9.9.9");
  assert.equal(limits.clientKey(get({})), "local");
});

test("mock stream opens with a mood tag, then the exact label, and is only text", async () => {
  let raw = "";
  for await (const c of mockStream("what does it cost?", undefined, 0)) raw += c;
  assert.match(raw, /^\[mood:neutral\]/);
  let out = "";
  let mood;
  for await (const e of withMood(mockStream("what does it cost?", undefined, 0))) {
    if (e.kind === "mood") mood = e.mood;
    else out += e.text;
  }
  assert.equal(mood, "neutral");
  assert.ok(out.startsWith(MOCK_FIRST_LINE));
  assert.match(out, /scope/);
});

async function run(mode, opts = {}) {
  const { server, port } = await startFake({ port: 0, mode });
  process.env.GEMINI_API_KEY = "fake-key";
  process.env.GEMINI_API_BASE_URL = `http://127.0.0.1:${port}`;
  try {
    let text = "";
    for await (const d of streamGemini({ messages: [u("hi")], systemPrompt: "s", ...opts })) text += d;
    return { text };
  } catch (e) {
    return { code: e.code };
  } finally {
    server.closeAllConnections();
    server.close();
  }
}

test("gemini.ts against the fake: ok, 429, empty, 500, blocked, slow timeout, no key", async () => {
  assert.deepEqual(await run("ok"), { text: "Hello from the fake." });
  assert.equal((await run("429")).code, "rate_limited");
  assert.equal((await run("empty")).code, "empty_response");
  assert.equal((await run("500")).code, "upstream_error");
  assert.equal((await run("blocked")).code, "blocked");
  assert.equal((await run("slow", { timeoutMs: 300 })).code, "timeout");
  delete process.env.GEMINI_API_KEY;
  const r = await (async () => {
    try {
      for await (const d of streamGemini({ messages: [u("hi")], systemPrompt: "s" })) void d;
    } catch (e) {
      return e.code;
    }
  })();
  assert.equal(r, "not_configured");
});
