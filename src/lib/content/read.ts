import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { ARTICLES_TAG, SAFETY_REVALIDATE_SECONDS, SITEMAP_TAG, articleTag, docTag } from "@/lib/editorial/api";
import { parseArticleContent, type ArticleContent } from "@/lib/editorial/content";
import { createPublicClient } from "@/lib/supabase/public";
import { draftDocument } from "./draft";
import { parseDocumentData, type DocumentData, type FixedKey } from "./schema";
import { ArticleListRows, ArticleRow, DocumentRow, SitemapEntryRows, type ArticleSummaryRow, type SitemapEntry } from "./rpc-shapes";

/*
 * The only server-side reads of published content (ARCHITECTURE_DECISIONS D2, D6; CONTRACT).
 *
 * - Every read is an anon-key RPC through the cookie-free public client, so pages stay static/ISR.
 * - Each RPC result sits in Next's data cache (unstable_cache) under the CONTRACT tags:
 *   editorial:doc:<key>, editorial:articles, editorial:article:<slug>, sitemap. Publication events
 *   expire exactly those tags (app/api/editorial/revalidate); the time-based revalidation is only a
 *   safety net.
 * - React cache() dedupes within one render, so a layout, a page and generateMetadata share a read.
 * - Failure is loud: an RPC error, a malformed response or data that fails the content schema throws
 *   ContentUnavailableError, never an empty success, so ISR keeps serving the last good page and a
 *   build without content fails instead of shipping blank pages.
 * - A document or article that is not published is `null`; callers turn that into notFound().
 * - Raw RPC results are cached; validation runs on every read (cheap), so a document that fails the
 *   schema can never render, whichever cache entry it came from.
 * - Draft mode bypasses unstable_cache automatically; previews read drafts elsewhere (preview route),
 *   never through these functions' cache.
 */

export class ContentUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ContentUnavailableError";
  }
}

type RpcName = "published_document" | "published_documents" | "published_articles" | "published_article" | "article_redirect" | "sitemap_entries";

async function rpc(name: RpcName, args?: Record<string, unknown>): Promise<unknown> {
  let result;
  try {
    // The generated Database types cover these functions; args are checked per call site below.
    result = await createPublicClient().rpc(name as never, args as never);
  } catch (error) {
    throw new ContentUnavailableError(`Supabase ${name} failed: ${(error as Error).message}`, { cause: error });
  }
  if (result.error) throw new ContentUnavailableError(`Supabase ${name} failed: ${result.error.code ?? ""} ${result.error.message}`.trim());
  return result.data;
}

function shape<T>(what: string, schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } } }, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new ContentUnavailableError(`${what} returned an unexpected shape (${issue ? `${issue.path.join(".")}: ${issue.message}` : "invalid"})`);
  }
  return parsed.data;
}

const cached = <T,>(fn: () => Promise<T>, keyParts: string[], tags: string[]) =>
  unstable_cache(fn, ["content", ...keyParts], { tags, revalidate: SAFETY_REVALIDATE_SECONDS })();

// ---------------------------------------------------------------------------------------------
// Documents

export interface PublishedDocument<K extends string> {
  key: K;
  revisionId: number;
  contentHash: string;
  publishedAt: string | null;
  updatedOn: string | null;
  data: DocumentData<K>;
}

function toDocument<K extends string>(key: K, raw: unknown): PublishedDocument<K> {
  const row = shape(`published_document(${key})`, DocumentRow, raw);
  if (row.key !== key) throw new ContentUnavailableError(`published_document(${key}) returned ${row.key}`);
  if (row.schemaVersion !== 1) throw new ContentUnavailableError(`${key}: unsupported content schema version ${row.schemaVersion}`);
  let data: DocumentData<K>;
  try {
    data = parseDocumentData(key, row.data);
  } catch (error) {
    throw new ContentUnavailableError(`Published content failed validation: ${(error as Error).message}`, { cause: error });
  }
  return { key, revisionId: row.revisionId, contentHash: row.contentHash, publishedAt: row.publishedAt, updatedOn: row.updatedOn, data };
}

const readDocumentsRaw = (keys: readonly string[]) =>
  cached(
    async () => {
      const value = await rpc("published_documents", { p_keys: [...keys] });
      if (value === null || typeof value !== "object" || Array.isArray(value)) throw new ContentUnavailableError("published_documents returned an unexpected shape");
      return value as Record<string, unknown>;
    },
    ["documents", ...keys],
    keys.map(docTag),
  );

/** One published document, validated for its key, or null when it is not published. */
export const getDocument = cache(async <K extends string>(key: K): Promise<PublishedDocument<K> | null> => {
  const raw = await cached(() => rpc("published_document", { p_key: key }), ["document", key], [docTag(key)]);
  return raw === null ? null : toDocument(key, raw);
});

/** Several documents in one round trip (one cache entry, tagged with every key). Missing keys are absent. */
export async function getDocuments<K extends string>(keys: readonly K[]): Promise<{ [P in K]?: PublishedDocument<P> }> {
  const sorted = [...new Set(keys)].sort();
  const raw = await readDocumentsBatch(sorted.join("\n"));
  const out: Partial<Record<string, PublishedDocument<string>>> = {};
  for (const key of sorted) if (raw[key] != null) out[key] = toDocument(key, raw[key]);
  return out as { [P in K]?: PublishedDocument<P> };
}
/** Keyed on the joined key list, so React cache() dedupes identical batches within a render. */
const readDocumentsBatch = cache((joined: string) => readDocumentsRaw(joined.split("\n")));

/** The documents every public page renders from: settings, navigation and the collections. */
export const CHROME_KEYS = [
  "settings:site",
  "navigation:main",
  "collection:services",
  "collection:process_steps",
  "collection:capabilities",
  "collection:work_projects",
] as const satisfies readonly FixedKey[];

export interface SiteChrome {
  settings: DocumentData<"settings:site">;
  navigation: DocumentData<"navigation:main">;
  services: DocumentData<"collection:services">;
  processSteps: DocumentData<"collection:process_steps">;
  capabilities: DocumentData<"collection:capabilities">;
  workProjects: DocumentData<"collection:work_projects">;
}

/**
 * The shared chrome in one batched published_documents call. Every key is required: a site with no
 * published settings or navigation cannot render, so a missing one throws rather than render blanks.
 */
export const getSiteChrome = cache(async (): Promise<SiteChrome> => {
  const docs = await getDocuments(CHROME_KEYS);
  const missing = CHROME_KEYS.filter((k) => !docs[k]);
  if (missing.length) throw new ContentUnavailableError(`Required content is not published: ${missing.join(", ")}`);
  const data = async <K extends (typeof CHROME_KEYS)[number]>(key: K): Promise<DocumentData<K>> => (await draftDocument(key)) ?? docs[key]!.data;
  return {
    settings: await data("settings:site"),
    navigation: await data("navigation:main"),
    services: await data("collection:services"),
    processSteps: await data("collection:process_steps"),
    capabilities: await data("collection:capabilities"),
    workProjects: await data("collection:work_projects"),
  };
});

/**
 * A page by its path ("/", "/pricing", "/services/seo"), or null: the caller calls notFound(). In a
 * verified preview of this page's document, the draft data replaces the published data.
 */
export const getPage = cache(async (path: string): Promise<PublishedDocument<`page:${string}`> | null> => {
  if (!/^\/[a-z0-9/_-]*$/.test(path)) return null;
  const key = `page:${path}` as const;
  const [draft, published] = await Promise.all([draftDocument(key), getDocument(key)]);
  if (!draft) return published;
  return { ...(published ?? { key, revisionId: 0, contentHash: "", publishedAt: null, updatedOn: null }), data: draft };
});

// ---------------------------------------------------------------------------------------------
// Articles

/** The summary shape the site already uses (lib/editorial/api ArticleSummary), from the RPC row. */
export interface ArticleSummary {
  slug: string;
  title: string;
  seoTitle: string | null;
  description: string;
  publishedOn: string;
  updatedOn: string | null;
  author: string;
  category: string;
  tags: string[];
  readingMinutes: number;
  relatedServices: { path: string; reason: string }[];
  revisionId: number;
}

const toSummary = (r: ArticleSummaryRow): ArticleSummary => ({
  slug: r.slug,
  title: r.title,
  seoTitle: r.seoTitle,
  description: r.description,
  publishedOn: r.firstPublishedOn,
  updatedOn: r.updatedOn,
  author: r.author,
  category: r.category,
  tags: r.tags,
  readingMinutes: r.readingMinutes,
  relatedServices: r.relatedServices,
  revisionId: r.revisionId,
});

/**
 * Every published article, newest first, without bodies. One cache entry (tag editorial:articles)
 * shared by the archive, the homepage teaser, the service pages, the sitemap and every article page
 * (related reading, conditional content), so an article render never re-queries the list.
 */
export const getPublishedArticles = cache(async (): Promise<ArticleSummary[]> => {
  const raw = await cached(() => rpc("published_articles"), ["articles"], [ARTICLES_TAG]);
  return shape("published_articles", ArticleListRows, raw).map(toSummary);
});

export interface PublishedArticle extends ArticleSummary {
  contentHash: string;
  content: ArticleContent;
}

/** One published article with its body, by live slug, or null (then check getArticleRedirect). */
export const getPublishedArticle = cache(async (slug: string): Promise<PublishedArticle | null> => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120) return null;
  const raw = await cached(() => rpc("published_article", { p_slug: slug }), ["article", slug], [articleTag(slug)]);
  if (raw === null) return null;
  const row = shape(`published_article(${slug})`, ArticleRow, raw);
  if (row.schemaVersion !== 1) throw new ContentUnavailableError(`Article ${slug}: unsupported schema version ${row.schemaVersion}`);
  let content: ArticleContent;
  try {
    content = parseArticleContent(row.content);
  } catch (error) {
    throw new ContentUnavailableError(`Article ${slug} failed validation: ${(error as Error).message}`, { cause: error });
  }
  return { ...toSummary(row), contentHash: row.contentHash, content };
});

/**
 * The live slug a former slug now redirects to (permanentRedirect), or null. Tagged with the list as
 * well as the slug: a slug change on another article's event is what creates the redirect.
 */
export const getArticleRedirect = cache(async (slug: string): Promise<string | null> => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120) return null;
  const raw = await cached(() => rpc("article_redirect", { p_slug: slug }), ["article-redirect", slug], [articleTag(slug), ARTICLES_TAG]);
  if (raw === null) return null;
  return shape(`article_redirect(${slug})`, ArticleListRows.element.shape.slug, raw);
});

// ---------------------------------------------------------------------------------------------
// Sitemap

/** Published pages (noindex excluded) and articles with their lastmod dates. */
export const getSitemapEntries = cache(async (): Promise<SitemapEntry[]> => {
  const raw = await cached(() => rpc("sitemap_entries"), ["sitemap"], [SITEMAP_TAG]);
  return shape("sitemap_entries", SitemapEntryRows, raw);
});
