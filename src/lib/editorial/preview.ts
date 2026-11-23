import { createHmac, timingSafeEqual } from "node:crypto";

/*
 * Draft-preview links from the Editorial UI: /api/preview?rev=&kind=&exp=&sig= where
 * sig = hex HMAC-SHA256(PREVIEW_SECRET, "<rev>.<kind>.<exp>"). Pure, Node-only imports so the unit
 * tests load this file directly.
 */

export const MAX_PREVIEW_SECONDS = 900;
export const MIN_SECRET_LENGTH = 32;
export const PREVIEW_PATH = /^\/[a-z0-9/_-]*$/;
export type PreviewKind = "article" | "document";

export function signPreview(secret: string, rev: number | string, kind: string, exp: number | string): string {
  return createHmac("sha256", secret).update(`${rev}.${kind}.${exp}`).digest("hex");
}

export type PreviewParams = { rev: string | null; kind: string | null; exp: string | null; sig: string | null };
export type PreviewCheck =
  | { ok: true; rev: number; kind: PreviewKind; exp: number }
  | { ok: false; reason: "missing" | "malformed" | "expired" | "too_far" | "mismatch" };

export function verifyPreview(secret: string, params: PreviewParams, nowSeconds = Math.floor(Date.now() / 1000)): PreviewCheck {
  const { rev, kind, exp, sig } = params;
  if (!rev || !kind || !exp || !sig) return { ok: false, reason: "missing" };
  if (kind !== "article" && kind !== "document") return { ok: false, reason: "malformed" };
  if (!/^[1-9]\d{0,15}$/.test(rev) || !Number.isSafeInteger(Number(rev))) return { ok: false, reason: "malformed" };
  if (!/^\d{1,12}$/.test(exp) || !/^[0-9a-f]{64}$/.test(sig)) return { ok: false, reason: "malformed" };
  const expN = Number(exp);
  if (expN < nowSeconds) return { ok: false, reason: "expired" };
  if (expN > nowSeconds + MAX_PREVIEW_SECONDS) return { ok: false, reason: "too_far" };
  const expected = Buffer.from(signPreview(secret, rev, kind, exp));
  const got = Buffer.from(sig);
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) return { ok: false, reason: "mismatch" };
  return { ok: true, rev: Number(rev), kind, exp: expN };
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Target path from revision data only; null when it does not validate (never a reflected URL). */
export function previewPath(kind: PreviewKind, revision: unknown): string | null {
  const r = (revision && typeof revision === "object" ? revision : {}) as Record<string, unknown>;
  let path: string;
  if (kind === "article") {
    if (typeof r.slug !== "string" || !SLUG.test(r.slug)) return null;
    path = `/insights/${r.slug}`;
  } else {
    const key = r.key;
    path = typeof key === "string" && key.startsWith("page:") ? key.slice(5) : "/";
  }
  return PREVIEW_PATH.test(path) && !path.startsWith("//") && !path.includes("..") ? path : null;
}
