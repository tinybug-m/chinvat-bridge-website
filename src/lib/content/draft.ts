import "server-only";
import { cookies, draftMode } from "next/headers";
import { cache } from "react";
import { MIN_SECRET_LENGTH, verifyPreview } from "@/lib/editorial/preview";
import { fetchPreviewRevision } from "@/lib/editorial/preview-fetch";
import { parseDocumentData, type DocumentData } from "./schema";

/*
 * Draft preview for content documents (CONTRACT "Preview"). Only in Draft Mode, and only after the
 * cb_preview cookie ("document.<rev>.<exp>.<sig>") re-verifies against PREVIEW_SECRET on this
 * request: the bypass cookie alone never shows a draft. The revision is read from the editorial API,
 * uncached (never through unstable_cache), and used only for the document whose key it carries. In
 * every other case the caller renders the published version.
 *
 * cookies() is read only when Draft Mode is on, which never happens during a build or a normal
 * visit, so pages stay static.
 */

export class DraftUnavailableError extends Error {}

/** The previewed document revision for this request (fetched once), or null. */
const activeDraft = cache(async (): Promise<{ key: string; data: unknown } | null> => {
  if (!(await draftMode()).isEnabled) return null;
  const secret = process.env.PREVIEW_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) return null;
  const raw = (await cookies()).get("cb_preview")?.value;
  if (!raw) return null;
  const [kind, rev, exp, sig] = raw.split(".");
  const check = verifyPreview(secret, { kind: kind ?? null, rev: rev ?? null, exp: exp ?? null, sig: sig ?? null });
  if (!check.ok || check.kind !== "document") return null;

  let revision: unknown;
  try {
    revision = await fetchPreviewRevision("document", check.rev);
  } catch (error) {
    throw new DraftUnavailableError(`Preview revision ${check.rev} could not be read: ${(error as Error).message}`);
  }
  const r = (revision && typeof revision === "object" ? revision : {}) as Record<string, unknown>;
  if (typeof r.key !== "string") throw new DraftUnavailableError(`Preview revision ${check.rev} has no document key`);
  if (r.schemaVersion !== undefined && r.schemaVersion !== 1) throw new DraftUnavailableError(`Preview revision ${check.rev}: unsupported schema version`);
  return { key: r.key, data: r.data };
});

/** The draft data for `key` when this request is previewing that document's revision, else null. */
export async function draftDocument<K extends string>(key: K): Promise<DocumentData<K> | null> {
  const draft = await activeDraft();
  if (!draft || draft.key !== key) return null;
  // Drafts are validated like published content, so a preview shows exactly what publishing would.
  return parseDocumentData(key, draft.data);
}
