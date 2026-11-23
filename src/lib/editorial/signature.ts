import { createHmac, timingSafeEqual } from "node:crypto";

/*
 * Verifies a publication event from the editorial backend:
 *   x-editorial-timestamp: unix seconds; must be within five minutes of this server's clock
 *   x-editorial-signature: v1=<hex HMAC-SHA256(secret, "<timestamp>.<raw body>")>
 * computed over the exact bytes received and compared in constant time. No imports beyond Node,
 * so the unit tests load this file directly.
 */

export const MAX_SKEW_SECONDS = 300;

export function signPayload(secret: string, timestamp: number, body: string): string {
  return `v1=${createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")}`;
}

export type SignatureCheck = { ok: true } | { ok: false; reason: "missing" | "malformed" | "expired" | "mismatch" };

export function verifySignature(
  secret: string,
  timestamp: string | null,
  signature: string | null,
  body: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): SignatureCheck {
  if (!timestamp || !signature) return { ok: false, reason: "missing" };
  if (!/^\d{1,12}$/.test(timestamp) || !/^v1=[0-9a-f]{64}$/.test(signature)) return { ok: false, reason: "malformed" };
  if (Math.abs(nowSeconds - Number(timestamp)) > MAX_SKEW_SECONDS) return { ok: false, reason: "expired" };
  const expected = Buffer.from(signPayload(secret, Number(timestamp), body));
  const got = Buffer.from(signature);
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) return { ok: false, reason: "mismatch" };
  return { ok: true };
}

const ARTICLE_EVENT_TYPES = new Set(["article.published", "article.updated", "article.unpublished", "article.slug_changed", "article.rolled_back"]);
const DOCUMENT_EVENT_TYPES = new Set(["document.published", "document.updated", "document.unpublished", "document.rolled_back"]);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Same pattern as the editorial.documents key check (CONTRACT "Tables"). */
export const DOCUMENT_KEY = /^(page:\/[a-z0-9/_-]*|settings:site|navigation:main|collection:[a-z_]+)$/;

export interface ArticleEvent {
  id: string;
  type: string;
  occurredAt: string;
  article: { id: number; slug: string; previousSlug: string | null; revisionId: number | null };
}

export interface DocumentEvent {
  id: string;
  type: string;
  occurredAt: string;
  document: { id: number; key: string; revisionId: number | null };
}

export type PublicationEvent = ArticleEvent | DocumentEvent;

export const isDocumentEvent = (e: PublicationEvent): e is DocumentEvent => "document" in e;

/** Strict shape check of a verified event body; returns null when anything is off. */
export function parseEvent(body: string): PublicationEvent | null {
  let v: unknown;
  try {
    v = JSON.parse(body);
  } catch {
    return null;
  }
  const e = v as (Partial<ArticleEvent> & Partial<DocumentEvent>) | null;
  if (!e || typeof e.id !== "string" || !/^[0-9a-f-]{36}$/.test(e.id)) return null;
  if (typeof e.type !== "string") return null;
  if (typeof e.occurredAt !== "string" || Number.isNaN(Date.parse(e.occurredAt))) return null;

  if (DOCUMENT_EVENT_TYPES.has(e.type)) {
    const d = e.document;
    if (e.article !== undefined) return null;
    if (!d || typeof d.id !== "number" || typeof d.key !== "string" || d.key.length > 200 || !DOCUMENT_KEY.test(d.key)) return null;
    if (d.revisionId != null && typeof d.revisionId !== "number") return null;
    return { id: e.id, type: e.type, occurredAt: e.occurredAt, document: { id: d.id, key: d.key, revisionId: d.revisionId ?? null } };
  }

  if (!ARTICLE_EVENT_TYPES.has(e.type)) return null;
  const a = e.article;
  if (e.document !== undefined) return null;
  if (!a || typeof a.id !== "number" || typeof a.slug !== "string" || !SLUG.test(a.slug) || a.slug.length > 120) return null;
  if (a.previousSlug !== null && (typeof a.previousSlug !== "string" || !SLUG.test(a.previousSlug))) return null;
  return { id: e.id, type: e.type, occurredAt: e.occurredAt, article: { id: a.id, slug: a.slug, previousSlug: a.previousSlug ?? null, revisionId: a.revisionId ?? null } };
}

/**
 * What one event must refresh (CONTRACT "Publication events"). Pure, so it is unit-tested without
 * Next.js. `everyArticlePage` means revalidatePath("/insights/[slug]", "page"); `wholeSite` means
 * revalidatePath("/", "layout") (shared chrome such as settings, navigation and collections).
 */
export function revalidationPlan(
  event: PublicationEvent,
  servicePaths: readonly string[],
): { tags: string[]; paths: string[]; everyArticlePage: boolean; wholeSite: boolean } {
  if (isDocumentEvent(event)) {
    const key = event.document.key;
    if (key.startsWith("page:")) {
      return { tags: [`editorial:doc:${key}`, "sitemap"], paths: [key.slice("page:".length), "/sitemap.xml"], everyArticlePage: false, wholeSite: false };
    }
    return { tags: [`editorial:doc:${key}`], paths: [], everyArticlePage: false, wholeSite: true };
  }
  const slugs = [event.article.slug, ...(event.article.previousSlug ? [event.article.previousSlug] : [])];
  return {
    tags: ["editorial:articles", ...slugs.map((s) => `editorial:article:${s}`), "sitemap"],
    paths: ["/insights", "/sitemap.xml", "/", ...slugs.map((s) => `/insights/${s}`), ...servicePaths],
    everyArticlePage: true,
    wholeSite: false,
  };
}
