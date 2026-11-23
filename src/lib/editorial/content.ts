/*
 * The article content format (version 1) as served by the editorial API, and a strict runtime check
 * of every payload before it is rendered: structured data, never HTML or code. A link that is not a
 * plain site path, an in-page anchor or an https URL fails the check, so the page fails rather than
 * render it. No imports, so the unit tests can load this file directly.
 */

export type Inline =
  | { type: "text"; text: string }
  | { type: "strong"; children: Inline[] }
  | { type: "em"; children: Inline[] }
  | { type: "code"; text: string }
  | { type: "link"; href: string; children: Inline[] }
  | { type: "conditional"; slug: string; children: Inline[] };

export type Block =
  | { type: "paragraph"; children: Inline[] }
  | { type: "heading"; level: 2 | 3; id?: string; children: Inline[] }
  | { type: "list"; ordered: boolean; items: { children: Inline[] }[] }
  | { type: "table"; head: Inline[][]; rows: Inline[][][] }
  | { type: "blockquote"; children: Block[] }
  | { type: "conditional"; slug: string; children: Block[] };

export interface ArticleContent {
  schemaVersion: 1;
  blocks: Block[];
}

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ANCHOR_ID = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const INTERNAL_HREF = /^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?(?:#[a-z][a-z0-9-]*)?$/;
const ANCHOR_HREF = /^#[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export type LinkKind = "internal" | "anchor" | "external";

/** Same rules as the editorial backend: site paths, in-page anchors, https URLs with a real host. */
export function classifyHref(href: unknown): LinkKind | null {
  if (typeof href !== "string" || href.length === 0 || href.length > 2048) return null;
  if (/[\s\u0000-\u001f\u007f\\]/.test(href)) return null;
  if (href.startsWith("#")) return ANCHOR_HREF.test(href) ? "anchor" : null;
  if (href.startsWith("/")) return !href.startsWith("//") && INTERNAL_HREF.test(href) ? "internal" : null;
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password) return null;
  if (!/^[a-z0-9.-]+$/i.test(url.hostname) || !url.hostname.includes(".") || url.hostname.startsWith(".") || url.hostname.endsWith(".")) return null;
  return "external";
}

export class InvalidContentError extends Error {}

type Obj = Record<string, unknown>;

function fail(path: string, why: string): never {
  throw new InvalidContentError(`${path}: ${why}`);
}

function keys(o: Obj, allowed: string[], path: string) {
  for (const k of Object.keys(o)) if (!allowed.includes(k)) fail(path, `unexpected field "${k}"`);
}

function isObj(v: unknown): v is Obj {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function inlines(v: unknown, path: string, depth: number): Inline[] {
  if (!Array.isArray(v)) fail(path, "expected an array");
  if (depth > 8) fail(path, "nested too deeply");
  return v.map((n, i): Inline => {
    const p = `${path}[${i}]`;
    if (!isObj(n)) fail(p, "expected an object");
    switch (n.type) {
      case "text":
      case "code":
        keys(n, ["type", "text"], p);
        if (typeof n.text !== "string") fail(p, "text must be a string");
        return { type: n.type, text: n.text };
      case "strong":
      case "em":
        keys(n, ["type", "children"], p);
        return { type: n.type, children: inlines(n.children, `${p}.children`, depth + 1) };
      case "link":
        keys(n, ["type", "href", "children"], p);
        if (classifyHref(n.href) === null) fail(p, "unsafe or malformed link");
        return { type: "link", href: n.href as string, children: inlines(n.children, `${p}.children`, depth + 1) };
      case "conditional":
        keys(n, ["type", "slug", "children"], p);
        if (typeof n.slug !== "string" || !SLUG.test(n.slug)) fail(p, "invalid slug");
        return { type: "conditional", slug: n.slug, children: inlines(n.children, `${p}.children`, depth + 1) };
      default:
        return fail(p, `unknown inline type ${JSON.stringify(n.type)}`);
    }
  });
}

function blocks(v: unknown, path: string, depth: number): Block[] {
  if (!Array.isArray(v)) fail(path, "expected an array");
  if (depth > 4) fail(path, "nested too deeply");
  return v.map((b, i): Block => {
    const p = `${path}[${i}]`;
    if (!isObj(b)) fail(p, "expected an object");
    switch (b.type) {
      case "paragraph":
        keys(b, ["type", "children"], p);
        return { type: "paragraph", children: inlines(b.children, `${p}.children`, 1) };
      case "heading":
        keys(b, ["type", "level", "id", "children"], p);
        if (b.level !== 2 && b.level !== 3) fail(p, "heading level must be 2 or 3");
        if (b.id !== undefined && (typeof b.id !== "string" || !ANCHOR_ID.test(b.id))) fail(p, "invalid heading id");
        return { type: "heading", level: b.level, ...(b.id ? { id: b.id as string } : {}), children: inlines(b.children, `${p}.children`, 1) };
      case "list":
        keys(b, ["type", "ordered", "items"], p);
        if (typeof b.ordered !== "boolean" || !Array.isArray(b.items)) fail(p, "invalid list");
        return {
          type: "list",
          ordered: b.ordered,
          items: b.items.map((it, j) => {
            if (!isObj(it)) fail(`${p}.items[${j}]`, "expected an object");
            keys(it, ["children"], `${p}.items[${j}]`);
            return { children: inlines(it.children, `${p}.items[${j}].children`, 1) };
          }),
        };
      case "table":
        keys(b, ["type", "head", "rows"], p);
        if (!Array.isArray(b.head) || !Array.isArray(b.rows)) fail(p, "invalid table");
        return {
          type: "table",
          head: b.head.map((c, j) => inlines(c, `${p}.head[${j}]`, 1)),
          rows: b.rows.map((r, j) => {
            if (!Array.isArray(r)) fail(`${p}.rows[${j}]`, "expected an array");
            return r.map((c, k) => inlines(c, `${p}.rows[${j}][${k}]`, 1));
          }),
        };
      case "blockquote":
        keys(b, ["type", "children"], p);
        return { type: "blockquote", children: blocks(b.children, `${p}.children`, depth + 1) };
      case "conditional":
        keys(b, ["type", "slug", "children"], p);
        if (typeof b.slug !== "string" || !SLUG.test(b.slug)) fail(p, "invalid slug");
        return { type: "conditional", slug: b.slug, children: blocks(b.children, `${p}.children`, depth + 1) };
      default:
        return fail(p, `unknown block type ${JSON.stringify(b.type)}`);
    }
  });
}

/** Returns a clean copy of the content containing only known fields, or throws InvalidContentError. */
export function parseArticleContent(raw: unknown): ArticleContent {
  if (!isObj(raw)) fail("content", "expected an object");
  keys(raw, ["schemaVersion", "blocks"], "content");
  if (raw.schemaVersion !== 1) fail("content", `unsupported schema version ${JSON.stringify(raw.schemaVersion)}`);
  return { schemaVersion: 1, blocks: blocks(raw.blocks, "content.blocks", 1) };
}
