import { cache } from "react";
import { getPublishedArticle, getPublishedArticles, getArticleRedirect, type ArticleSummary } from "@/lib/content/read";
import type { ArticleContent } from "@/lib/editorial/content";
import { pickRelated } from "@/lib/blog-helpers";

/*
 * Articles come from Supabase's public read functions through src/lib/content/read.ts (cached under
 * the editorial:* tags, throwing when Supabase is unavailable). This module keeps the shapes the
 * pages already use. Drafts never reach the website: the RPCs return published articles only.
 */

export interface PostMeta {
  slug: string;
  /** The article's heading, shown on the page and in lists. */
  title: string;
  /** A shorter <title> and social title, when the heading is too long for a search result. */
  seoTitle?: string;
  description: string;
  /** ISO date (YYYY-MM-DD): when the article was first published. */
  date: string;
  /** ISO date: set only when the article has been revised since publishing. */
  updated?: string;
  author: string;
  tags: string[];
  /** Category label shown on the homepage Insights teaser and the listing page. */
  category: string;
  readingMinutes: number;
  /** Service pages the article supports, with the reason it is worth reading there. */
  relatedServices: { path: string; reason: string }[];
}

export interface Post {
  meta: PostMeta;
}

export interface Article extends Post {
  content: ArticleContent;
  related: Post[];
}

export type ArticleResult = { kind: "article"; article: Article } | { kind: "redirect"; slug: string } | { kind: "missing" };

function toMeta(s: ArticleSummary): PostMeta {
  return {
    slug: s.slug,
    title: s.title,
    ...(s.seoTitle ? { seoTitle: s.seoTitle } : {}),
    description: s.description,
    date: s.publishedOn,
    ...(s.updatedOn ? { updated: s.updatedOn } : {}),
    author: s.author,
    tags: s.tags,
    category: s.category,
    readingMinutes: s.readingMinutes,
    relatedServices: s.relatedServices,
  };
}

/** Published articles, newest first. The cached list is shared by every caller; a failure throws. */
export const getPublishedPosts = cache(async (): Promise<Post[]> => (await getPublishedArticles()).map((s) => ({ meta: toMeta(s) })));

/**
 * One published article (with related reading picked from the cached list, not a second query), a
 * permanent redirect from a former slug, or nothing.
 */
export const getArticle = cache(async (slug: string): Promise<ArticleResult> => {
  const article = await getPublishedArticle(slug);
  if (!article) {
    const to = await getArticleRedirect(slug);
    return to ? { kind: "redirect", slug: to } : { kind: "missing" };
  }
  const related = pickRelated(article, await getPublishedArticles()).map((s) => ({ meta: toMeta(s) }));
  return { kind: "article", article: { meta: toMeta(article), content: article.content, related } };
});

/** Slugs of published articles: what conditional content and related links may point to. */
export async function getPublishedSlugs(): Promise<Set<string>> {
  return new Set((await getPublishedArticles()).map((p) => p.slug));
}

export function formatPostDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
