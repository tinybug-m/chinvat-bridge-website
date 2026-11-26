// The Windy Pup chat's Markdown subset: structure, and that nothing unsafe becomes a link.
import assert from "node:assert/strict";
import { test } from "node:test";

const { parseMarkdown, parseInline, safeHref } = await import("../../src/components/windy-pop/markdown.ts");

test("paragraphs, bold, italics and code", () => {
  const [block] = parseMarkdown("A **bold** and *soft* word with `code`.");
  assert.equal(block.t, "p");
  assert.deepEqual(
    block.c.map((n) => n.t),
    ["text", "strong", "text", "em", "text", "code", "text"],
  );
});

test("lists group their items, bullets and numbers separately", () => {
  const blocks = parseMarkdown("Intro\n\n- one\n- two\n\n1. first\n2. second");
  assert.deepEqual(
    blocks.map((b) => b.t),
    ["p", "ul", "ol"],
  );
  assert.equal(blocks[1].items.length, 2);
  assert.equal(blocks[2].items.length, 2);
});

test("a list directly after a line still starts a list", () => {
  assert.deepEqual(
    parseMarkdown("Steps:\n- a\n- b").map((b) => b.t),
    ["p", "ul"],
  );
});

test("only http, https, mailto and site paths are linked", () => {
  assert.equal(safeHref("/pricing"), "/pricing");
  assert.equal(safeHref("https://example.com/a"), "https://example.com/a");
  assert.equal(safeHref("mailto:hi@example.com"), "mailto:hi@example.com");
  for (const bad of ["javascript:alert(1)", "data:text/html,x", "//evil.example", "/\\evil.example", "vbscript:x", ""]) {
    assert.equal(safeHref(bad), null, bad);
  }
});

test("unsafe link targets and raw HTML stay as plain text", () => {
  const nodes = parseInline("[click](javascript:alert(1)) <script>x</script> </script>");
  assert.equal(nodes.filter((n) => n.t === "link").length, 0);
  assert.ok(nodes.every((n) => n.t === "text"));
});

test("bare URLs and site paths link, without trailing punctuation", () => {
  const links = parseInline("See https://example.com/path. Then /pricing, or ask.").filter((n) => n.t === "link");
  assert.deepEqual(
    links.map((n) => n.href),
    ["https://example.com/path", "/pricing"],
  );
});

test("half-streamed markdown stays readable", () => {
  const [block] = parseMarkdown("A **bold that is still arriv");
  assert.equal(block.c.length, 1);
  assert.equal(block.c[0].v, "A **bold that is still arriv");
});
