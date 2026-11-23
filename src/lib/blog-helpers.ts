/*
 * Pure helpers for articles and the sitemap. No imports, so they run under Node's test runner
 * (tests/unit/blog.test.mjs) as well as in the app.
 */

export interface RelatedCandidate {
  slug: string;
  category: string;
  tags: string[];
}

/**
 * Related reading from the cached list, exactly as the site chose it before the move to Supabase:
 * articles that share at least one tag first, then the rest, each group in list order (newest
 * first), never the article itself. Two by default.
 */
export function pickRelated<T extends RelatedCandidate>(current: RelatedCandidate, all: readonly T[], limit = 2): T[] {
  const others = all.filter((post) => post.slug !== current.slug);
  const sharesTag = (post: T) => post.tags.some((tag) => current.tags.includes(tag));
  return [...others.filter(sharesTag), ...others.filter((post) => !sharesTag(post))].slice(0, limit);
}

export interface SitemapSource {
  kind: "page" | "article";
  path: string;
  lastModified: string | null;
}

export interface SitemapItem {
  url: string;
  lastModified?: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
}

/** Position of a path in the sitemap: home, services, pricing, insights index, articles, legal, the rest. */
function rank(e: SitemapSource): number {
  if (e.path === "/") return 0;
  if (e.path.startsWith("/services/")) return 1;
  if (e.path === "/pricing") return 2;
  if (e.path === "/insights") return 3;
  if (e.kind === "article" || e.path.startsWith("/insights/")) return 4;
  if (e.path === "/privacy" || e.path === "/terms") return 6;
  return 5;
}

const PRIORITY = [1, 0.8, 0.8, 0.7, 0.6, 0.5, 0.3];

/** Canonical URL for a path; `siteUrl` has no trailing slash and the home page is the bare origin. */
export function canonicalUrl(siteUrl: string, path: string): string {
  const base = siteUrl.replace(/\/+$/, "");
  return path === "/" ? base : `${base}${path}`;
}

/**
 * Sitemap items from sitemap_entries(): canonical URLs, lastModified only when the entry has a date
 * (never the build time), ordered by rank and then by path (articles: newest first, as given).
 */
export function buildSitemap(siteUrl: string, entries: readonly SitemapSource[]): SitemapItem[] {
  // The archive changes whenever its newest article does, so /insights takes the latest article
  // date when that is later than (or instead of) its own.
  const newestArticle = entries
    .filter((e) => e.kind === "article" && e.lastModified)
    .map((e) => e.lastModified as string)
    .sort()
    .at(-1);
  const dated = entries.map((e) =>
    e.kind === "page" && e.path === "/insights" && newestArticle && (!e.lastModified || e.lastModified < newestArticle)
      ? { ...e, lastModified: newestArticle }
      : e,
  );
  return dated
    .map((e, index) => ({ e, index, r: rank(e) }))
    .sort((a, b) => a.r - b.r || (a.r === 4 ? a.index - b.index : a.e.path.localeCompare(b.e.path)))
    .map(({ e, r }) => ({
      url: canonicalUrl(siteUrl, e.path),
      ...(e.lastModified ? { lastModified: e.lastModified } : {}),
      changeFrequency: r === 3 ? ("weekly" as const) : r === 6 ? ("yearly" as const) : ("monthly" as const),
      priority: PRIORITY[r],
    }));
}
