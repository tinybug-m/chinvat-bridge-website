// Editorial publication events and article content (src/lib/editorial). Runs with Node's type
// stripping: `pnpm test:unit`. The route handler and the article renderer use these same functions.
import assert from "node:assert/strict";
import { test } from "node:test";
import { signPayload, verifySignature, parseEvent, revalidationPlan, MAX_SKEW_SECONDS } from "../../src/lib/editorial/signature.ts";
import { classifyHref, parseArticleContent, InvalidContentError } from "../../src/lib/editorial/content.ts";

const SECRET = "s".repeat(64);
const NOW = 1_800_000_000;
const event = {
  id: "7f1c2a9e-0b4d-4c55-9e1a-3c2b1a0f9d8e",
  type: "article.published",
  occurredAt: "2026-11-22T12:00:00.000Z",
  article: { id: 3, slug: "new-article", previousSlug: null, revisionId: 9 },
};
const body = JSON.stringify(event);

test("a correctly signed, fresh event verifies", () => {
  assert.deepEqual(verifySignature(SECRET, String(NOW), signPayload(SECRET, NOW, body), body, NOW), { ok: true });
});

test("missing, malformed, expired, tampered and wrongly keyed signatures are refused", () => {
  const sig = signPayload(SECRET, NOW, body);
  assert.equal(verifySignature(SECRET, null, sig, body, NOW).reason, "missing");
  assert.equal(verifySignature(SECRET, String(NOW), null, body, NOW).reason, "missing");
  assert.equal(verifySignature(SECRET, "soon", sig, body, NOW).reason, "malformed");
  assert.equal(verifySignature(SECRET, String(NOW), "sha256=abc", body, NOW).reason, "malformed");
  assert.equal(verifySignature(SECRET, String(NOW), sig, body, NOW + MAX_SKEW_SECONDS + 1).reason, "expired");
  assert.equal(verifySignature(SECRET, String(NOW), sig, body, NOW - MAX_SKEW_SECONDS - 1).reason, "expired");
  assert.equal(verifySignature(SECRET, String(NOW), sig, body.replace("new-article", "other-article"), NOW).reason, "mismatch");
  assert.equal(verifySignature("t".repeat(64), String(NOW), sig, body, NOW).reason, "mismatch");
  // A signature for another timestamp cannot be moved onto a fresh one.
  assert.equal(verifySignature(SECRET, String(NOW + 10), sig, body, NOW).reason, "mismatch");
});

test("event bodies are checked strictly", () => {
  assert.deepEqual(parseEvent(body), event);
  assert.equal(parseEvent("not json"), null);
  assert.equal(parseEvent(JSON.stringify({ ...event, type: "article.deleted" })), null);
  assert.equal(parseEvent(JSON.stringify({ ...event, article: { ...event.article, slug: "../admin" } })), null);
  assert.equal(parseEvent(JSON.stringify({ ...event, article: { ...event.article, previousSlug: "Bad Slug" } })), null);
  assert.equal(parseEvent(JSON.stringify({ ...event, id: "1" })), null);
  assert.equal(parseEvent(JSON.stringify({ ...event, article: { ...event.article, slug: "renamed", previousSlug: "new-article" } })).article.previousSlug, "new-article");
});

test("links: site paths, anchors and https only", () => {
  assert.equal(classifyHref("/services/seo"), "internal");
  assert.equal(classifyHref("/#contact"), "internal");
  assert.equal(classifyHref("#section-two"), "anchor");
  assert.equal(classifyHref("https://www.gov.uk/guidance?a=1#b"), "external");
  for (const bad of ["javascript:alert(1)", "data:text/html,x", "http://example.com", "//evil.example", "https://u:p@example.com", "/Upper", "/a b", "mailto:x@y.z", "", null]) {
    assert.equal(classifyHref(bad), null, String(bad));
  }
});

test("article content: known structure passes, anything else fails before rendering", () => {
  const ok = parseArticleContent({
    schemaVersion: 1,
    blocks: [
      { type: "heading", level: 2, children: [{ type: "text", text: "H" }] },
      { type: "paragraph", children: [{ type: "strong", children: [{ type: "em", children: [{ type: "text", text: "x" }] }] }, { type: "conditional", slug: "other", children: [{ type: "link", href: "/insights/other", children: [{ type: "text", text: "y" }] }] }] },
      { type: "table", head: [[{ type: "text", text: "A" }]], rows: [[[{ type: "code", text: "z" }]]] },
      { type: "blockquote", children: [{ type: "paragraph", children: [{ type: "text", text: "q" }] }] },
      { type: "conditional", slug: "other", children: [{ type: "list", ordered: false, items: [{ children: [{ type: "text", text: "i" }] }] }] },
    ],
  });
  assert.equal(ok.blocks.length, 5);
  const bad = [
    { schemaVersion: 2, blocks: [] },
    { schemaVersion: 1, blocks: [{ type: "html", html: "<script>" }] },
    { schemaVersion: 1, blocks: [{ type: "paragraph", children: [{ type: "link", href: "javascript:alert(1)", children: [] }] }] },
    { schemaVersion: 1, blocks: [{ type: "paragraph", children: [{ type: "text", text: "x", dangerouslySetInnerHTML: { __html: "<b>" } }] }] },
    { schemaVersion: 1, blocks: [{ type: "heading", level: 1, children: [] }] },
    { schemaVersion: 1, blocks: [{ type: "conditional", slug: "../x", children: [] }] },
  ];
  for (const content of bad) assert.throws(() => parseArticleContent(content), InvalidContentError, JSON.stringify(content));
});

const SERVICES = ["/services/ai", "/services/seo"];
const docEvent = (key, type = "document.published") => ({
  id: "4d4a8c39-6a5f-4a3b-9a3e-8a3c7d1e0f10", type, occurredAt: "2026-11-23T10:00:00Z",
  document: { id: 7, key, revisionId: 12 },
});

test("document events parse strictly", () => {
  const e = docEvent("page:/services/ai");
  assert.deepEqual(parseEvent(JSON.stringify(e)), e);
  assert.deepEqual(parseEvent(JSON.stringify(docEvent("settings:site", "document.rolled_back"))), docEvent("settings:site", "document.rolled_back"));
  // Unknown key shapes, mixed subjects, wrong types and article types with a document body are refused.
  assert.equal(parseEvent(JSON.stringify(docEvent("page:/../etc"))), null);
  assert.equal(parseEvent(JSON.stringify(docEvent("draft:x"))), null);
  assert.equal(parseEvent(JSON.stringify({ ...docEvent("settings:site"), article: { id: 1, slug: "a", previousSlug: null } })), null);
  assert.equal(parseEvent(JSON.stringify({ ...docEvent("settings:site"), type: "document.deleted" })), null);
  assert.equal(parseEvent(JSON.stringify({ ...docEvent("settings:site"), type: "article.published" })), null);
  assert.equal(parseEvent(JSON.stringify({ ...docEvent("settings:site"), document: { id: "7", key: "settings:site" } })), null);
});

test("each event refreshes only what it affects", () => {
  const page = revalidationPlan(docEvent("page:/services/ai"), SERVICES);
  assert.deepEqual(page, { tags: ["editorial:doc:page:/services/ai", "sitemap"], paths: ["/services/ai", "/sitemap.xml"], everyArticlePage: false, wholeSite: false });

  const home = revalidationPlan(docEvent("page:/"), SERVICES);
  assert.deepEqual(home.paths, ["/", "/sitemap.xml"]);

  const chrome = revalidationPlan(docEvent("navigation:main"), SERVICES);
  assert.deepEqual(chrome, { tags: ["editorial:doc:navigation:main"], paths: [], everyArticlePage: false, wholeSite: true });

  const moved = revalidationPlan(
    { id: "4d4a8c39-6a5f-4a3b-9a3e-8a3c7d1e0f11", type: "article.slug_changed", occurredAt: "2026-11-23T10:00:00Z",
      article: { id: 3, slug: "new-name", previousSlug: "old-name", revisionId: 9 } },
    SERVICES,
  );
  assert.deepEqual(moved.tags, ["editorial:articles", "editorial:article:new-name", "editorial:article:old-name", "sitemap"]);
  assert.deepEqual(moved.paths, ["/insights", "/sitemap.xml", "/", "/insights/new-name", "/insights/old-name", ...SERVICES]);
  assert.equal(moved.everyArticlePage, true);
  assert.equal(moved.wholeSite, false);
});
