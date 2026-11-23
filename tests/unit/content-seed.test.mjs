// The content schema and the seed documents: every seed validates, the exports are current, and the
// schema rejects what the project rules forbid.
import { register } from "node:module";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SEED_DIR = path.join(ROOT, "supabase/seed-content");
register("../../scripts/content/ts-resolve.mjs", import.meta.url);
const schema = await import("../../src/lib/content/schema.ts");
const { classifyHref } = await import("../../src/lib/editorial/content.ts");
const { ContentDocument, parseDocumentData, crossFieldProblems, Href, kindOf } = schema;

const EXPECTED_KEYS = [
  "settings:site",
  "navigation:main",
  "collection:services",
  "collection:process_steps",
  "collection:capabilities",
  "collection:work_projects",
  "page:/",
  "page:/services/ai-integration",
  "page:/services/workflow-automation",
  "page:/services/custom-software",
  "page:/services/seo",
  "page:/pricing",
  "page:/insights",
  "page:/privacy",
  "page:/terms",
];
const fileFor = (key) => `${key === "page:/" ? "page-index" : key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.json`;
const seeds = readdirSync(SEED_DIR)
  .filter((f) => f.endsWith(".json") && f !== "content-schema.json")
  .map((f) => ({ file: f, doc: JSON.parse(readFileSync(path.join(SEED_DIR, f), "utf8")) }));
const seed = (key) => structuredClone(seeds.find((s) => s.doc.key === key).doc);
const rejects = (doc) => {
  if (!ContentDocument.safeParse(doc).success) return true;
  return crossFieldProblems(doc.key, doc.data).length > 0;
};
const node = (script, ...args) =>
  execFileSync(process.execPath, ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "--import", "./scripts/content/register.mjs", script, ...args], { cwd: ROOT, stdio: "pipe" });

test("every expected document has exactly one seed file, named after its key", () => {
  assert.deepEqual(seeds.map((s) => s.doc.key).sort(), [...EXPECTED_KEYS].sort());
  for (const { file, doc } of seeds) assert.equal(file, fileFor(doc.key), doc.key);
});

test("every seed file validates against the content schema", () => {
  for (const { file, doc } of seeds) {
    assert.deepEqual(Object.keys(doc).sort(), ["data", "key", "kind", "schemaVersion"], file);
    assert.equal(doc.schemaVersion, 1, file);
    assert.equal(doc.kind, kindOf(doc.key), file);
    const parsed = ContentDocument.safeParse(doc);
    assert.ok(parsed.success, `${file}: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 3))}`);
    assert.doesNotThrow(() => parseDocumentData(doc.key, doc.data), file);
  }
});

test("content-schema.json is current (pnpm content:schema)", () => {
  assert.doesNotThrow(() => node("scripts/content/export-schema.ts", "--check"));
});

// The export reads the pre-migration modules from git (44cdab1), so this holds after they are deleted.
test("the seed files match the export from the code-owned content at the migration commit (pnpm content:seed)", () => {
  assert.doesNotThrow(() => node("scripts/content/export-seed.ts", "--check"));
});

test("no seed carries a decorative index, markup or Ltd", () => {
  for (const { file } of seeds) {
    const text = readFileSync(path.join(SEED_DIR, file), "utf8");
    assert.doesNotMatch(text, /"index"\s*:/, file);
    assert.doesNotMatch(text, /\bLtd\b|legalName|LocalBusiness/, file);
    assert.doesNotMatch(text, /<[A-Za-z/!]/, file);
    assert.doesNotMatch(text, /\bTier [IVX]+\b/, file);
  }
});

test("the eyebrow stays verbatim", () => {
  assert.equal(seed("settings:site").data.eyebrow, "UK Based // Working Globally");
});

test("the schema rejects markup, Ltd and tier numbering in copy", () => {
  for (const bad of ["<script>alert(1)</script>", "Chinvat Bridge Ltd", "Tier II", " leading space", ""]) {
    const doc = seed("collection:services");
    doc.data.items[0].title = bad;
    assert.ok(rejects(doc), JSON.stringify(bad));
  }
});

test("the schema enforces the fixed cardinalities and keys", () => {
  const three = seed("collection:services");
  three.data.items.pop();
  assert.ok(rejects(three), "three services");
  const swapped = seed("collection:services");
  [swapped.data.items[0], swapped.data.items[1]] = [swapped.data.items[1], swapped.data.items[0]];
  assert.ok(rejects(swapped), "services out of key order");
  const steps = seed("collection:process_steps");
  steps.data.items.push({ ...steps.data.items[0] });
  assert.ok(rejects(steps), "five steps");
  const hero = seed("page:/");
  hero.data.blocks[0].disciplines.pop();
  assert.ok(rejects(hero), "three hero disciplines");
  const order = seed("page:/");
  [order.data.blocks[1], order.data.blocks[2]] = [order.data.blocks[2], order.data.blocks[1]];
  assert.ok(rejects(order), "homepage blocks out of order");
  const index = seed("collection:process_steps");
  index.data.items[0].index = "I.";
  assert.ok(rejects(index), "decorative index field");
});

test("the schema enforces unique keys and anchors, and the template per path", () => {
  const caps = seed("collection:capabilities");
  caps.data.items[1].key = caps.data.items[0].key;
  assert.ok(rejects(caps), "duplicate capability key");
  const nav = seed("navigation:main");
  nav.data.sections[1].key = nav.data.sections[0].key;
  assert.ok(rejects(nav), "duplicate section key");
  const anchors = seed("page:/services/seo");
  anchors.data.blocks[2].anchor = anchors.data.blocks[1].anchor;
  assert.ok(rejects(anchors), "duplicate anchor");
  const pricing = seed("page:/pricing");
  assert.ok(rejects({ ...pricing, key: "page:/services/pricing-elsewhere" }), "pricing template off /pricing");
  const service = seed("page:/services/seo");
  assert.ok(rejects({ ...service, key: "page:/pricing" }), "service template on /pricing");
});

test("links follow the editorial rules (no mailto:, no javascript:, https only)", () => {
  const samples = ["/", "/pricing", "/#contact", "#what-we-do", "https://www.scornik.com/", "https://stripe.com/gb/privacy",
    "mailto:a@b.co", "javascript:alert(1)", "http://example.com", "//evil.example", "/Upper", "https://localhost"];
  for (const href of samples) assert.equal(Href.safeParse(href).success, classifyHref(href) !== null, href);
  const doc = seed("page:/privacy");
  doc.data.body.blocks.push({ type: "paragraph", children: [{ type: "link", href: "mailto:a@b.co", children: [{ type: "text", text: "x" }] }] });
  assert.ok(rejects(doc), "mailto link in rich text");
});

test("rich text accepts the article model plus contact_email, and nothing else", () => {
  const doc = seed("page:/terms");
  doc.data.body.blocks.push({ type: "html", html: "<b>x</b>" });
  assert.ok(rejects(doc), "unknown block");
  const extra = seed("page:/terms");
  extra.data.body.blocks[0].dangerouslySetInnerHTML = "x";
  assert.ok(rejects(extra), "extra field");
  assert.ok(JSON.stringify(seed("page:/privacy").data.body).includes('"contact_email"'));
});
