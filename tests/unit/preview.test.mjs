// Draft-preview link signing and target-path validation (src/lib/editorial/preview).
import assert from "node:assert/strict";
import { test } from "node:test";
import { signPreview, verifyPreview, previewPath, MAX_PREVIEW_SECONDS } from "../../src/lib/editorial/preview.ts";

const SECRET = "p".repeat(40);
const NOW = 1_800_000_000;
const exp = NOW + 600;
const params = (over = {}) => ({ rev: "7", kind: "article", exp: String(exp), sig: signPreview(SECRET, 7, "article", exp), ...over });

test("a signed, fresh link verifies", () => {
  assert.deepEqual(verifyPreview(SECRET, params(), NOW), { ok: true, rev: 7, kind: "article", exp });
});

test("bad links are refused", () => {
  assert.equal(verifyPreview(SECRET, params({ sig: null }), NOW).reason, "missing");
  assert.equal(verifyPreview(SECRET, params(), exp + 1).reason, "expired");
  const far = NOW + MAX_PREVIEW_SECONDS + 1;
  assert.equal(verifyPreview(SECRET, params({ exp: String(far), sig: signPreview(SECRET, 7, "article", far) }), NOW).reason, "too_far");
  assert.equal(verifyPreview(SECRET, params({ kind: "page" }), NOW).reason, "malformed");
  assert.equal(verifyPreview(SECRET, params({ rev: "1.5" }), NOW).reason, "malformed");
  assert.equal(verifyPreview(SECRET, params({ rev: "0" }), NOW).reason, "malformed");
  assert.equal(verifyPreview(SECRET, params({ kind: "document" }), NOW).reason, "mismatch");
  assert.equal(verifyPreview(SECRET, params({ sig: "0".repeat(64) }), NOW).reason, "mismatch");
  assert.equal(verifyPreview("q".repeat(40), params(), NOW).reason, "mismatch");
});

test("target paths come from revision data and are validated", () => {
  assert.equal(previewPath("article", { slug: "my-post" }), "/insights/my-post");
  assert.equal(previewPath("document", { key: "page:/services/seo" }), "/services/seo");
  assert.equal(previewPath("document", { key: "settings:site" }), "/");
  assert.equal(previewPath("document", { key: "page://evil.com" }), null);
  assert.equal(previewPath("document", { key: "page:/../x" }), null);
  assert.equal(previewPath("document", { key: "page:https://evil.com" }), null);
  assert.equal(previewPath("article", { slug: "../x" }), null);
  assert.equal(previewPath("article", null), null);
});
