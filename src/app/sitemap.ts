import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { buildSitemap } from "@/lib/blog-helpers";
import { getSitemapEntries } from "@/lib/content/read";

/*
 * Entries come from Supabase's sitemap_entries() (published pages that are not noindex, and published
 * articles; never drafts), cached under the `sitemap` tag. Publication events expire it, so no deploy
 * is needed. lastModified appears only where the content carries a real date. If Supabase cannot be
 * reached and no good copy is cached, this fails rather than publish a sitemap without articles.
 */
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap(SITE_URL, await getSitemapEntries());
}
