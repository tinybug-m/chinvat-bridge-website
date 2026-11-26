import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { buildSitemap } from "@/lib/blog-helpers";
import { getSitemapEntries } from "@/lib/content/read";

/*
 * Entries come from Supabase's sitemap_entries() (published pages that are not noindex, and published
 * articles; never drafts), cached under the `sitemap` tag. Publication events expire it, so no deploy
 * is needed. lastModified appears only where the content carries a real date. If Supabase cannot be
 * reached and no good copy is cached, this fails rather than publish a sitemap without articles.
 *
 * The route itself is dynamic: only the data is cached. As an ISR route handler on Vercel, the
 * rendered sitemap was never purged by revalidateTag("sitemap") or revalidatePath("/sitemap.xml")
 * (pages were), so new articles appeared only after the 24-hour timer, and sometimes not even then.
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap(SITE_URL, await getSitemapEntries());
}
