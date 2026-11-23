import "server-only";
import type { PreviewKind } from "./preview";

/** Reads one draft revision from the editorial API with the drafts:read token. Never cached. */
export async function fetchPreviewRevision(kind: PreviewKind, rev: number): Promise<unknown> {
  const base = process.env.EDITORIAL_API_URL?.replace(/\/+$/, "");
  const token = process.env.EDITORIAL_PREVIEW_TOKEN;
  if (!base || !token) throw new Error("EDITORIAL_API_URL or EDITORIAL_PREVIEW_TOKEN is not set");
  const res = await fetch(`${base}/api/editorial/v1/preview/revisions/${kind}/${rev}`, {
    headers: { accept: "application/json", authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`preview revision request failed with ${res.status}`);
  return res.json();
}
