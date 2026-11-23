/*
 * Cache tags and the safety-net interval shared by every Supabase content read (lib/content/read.ts)
 * and the publication-event handler (app/api/editorial/revalidate). The data itself is read from
 * Supabase's public RPCs; nothing here fetches.
 */

export const ARTICLES_TAG = "editorial:articles";
export const articleTag = (slug: string) => `editorial:article:${slug}`;
/** A published content document (`page:/…`, `settings:site`, `navigation:main`, `collection:…`). */
export const docTag = (key: string) => `editorial:doc:${key}`;
export const SITEMAP_TAG = "sitemap";
export const PLANS_TAG = "plans";
/** Safety-net revalidation, in seconds; publication events normally refresh the cache at once. */
export const SAFETY_REVALIDATE_SECONDS = 86400;
