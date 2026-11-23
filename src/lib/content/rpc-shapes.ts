import { z } from "zod";
import { IsoDate, Slug } from "./schema";

/*
 * The shapes the public read RPCs return (supabase/migrations/20261123121000_published_content_rpcs.sql).
 * Unknown fields are dropped, so the backend can add one without breaking the site; a missing or
 * mistyped field fails validation and the read throws.
 */

/** Postgres date (YYYY-MM-DD) or a timestamp whose date part is used. */
const DateOnly = z.string().transform((s) => s.slice(0, 10)).pipe(IsoDate);

export const ArticleSummaryRow = z.object({
  slug: Slug,
  title: z.string().min(1),
  seoTitle: z.string().min(1).nullable(),
  description: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()),
  author: z.string().min(1),
  relatedServices: z.array(z.object({ path: z.string(), reason: z.string() })).nullable().transform((v) => v ?? []),
  readingMinutes: z.number().int().positive(),
  wordCount: z.number().int().nonnegative().nullable(),
  firstPublishedOn: DateOnly,
  updatedOn: DateOnly.nullable(),
  revisionId: z.number().int().positive(),
});
export type ArticleSummaryRow = z.infer<typeof ArticleSummaryRow>;

export const ArticleListRows = z.array(ArticleSummaryRow);

/** published_article(): the summary plus the body (validated separately by parseArticleContent). */
export const ArticleRow = ArticleSummaryRow.extend({
  schemaVersion: z.number().int(),
  contentHash: z.string().regex(/^[0-9a-f]{64}$/),
  content: z.unknown(),
});

/** published_document(s)(): one entry. `data` is validated against the content schema for its key. */
export const DocumentRow = z.object({
  key: z.string(),
  kind: z.enum(["page", "settings", "navigation", "collection"]),
  revisionId: z.number().int().positive(),
  schemaVersion: z.number().int(),
  contentHash: z.string().regex(/^[0-9a-f]{64}$/),
  data: z.unknown(),
  publishedAt: z.string().nullable(),
  updatedOn: DateOnly.nullable(),
});
export type DocumentRow = z.infer<typeof DocumentRow>;

export const SitemapEntryRows = z.array(
  z.object({
    kind: z.enum(["page", "article"]),
    path: z.string().regex(/^\/[a-z0-9/_-]*$/),
    lastModified: DateOnly.nullable(),
  }),
);
export type SitemapEntry = z.infer<typeof SitemapEntryRows>[number];
