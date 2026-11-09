import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getAllPosts } from "@/lib/blog";
import { PRIVACY_UPDATED, TERMS_UPDATED } from "@/lib/legal";
import { SEO_SERVICE } from "@/data/seo-service";

/*
 * lastModified is given only where the content carries a real date: each
 * article's own dates, the newest of them for the index, the service pages'
 * own "updated" and the legal pages' "last updated". The homepage and /pricing have no such date (pricing comes
 * from the database), so they leave lastmod out rather than claim the build time.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const postModified = posts.map((post) => post.meta.updated ?? post.meta.date);
  const latestPost = postModified.toSorted().at(-1);

  return [
    {
      url: SITE_URL,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/pricing`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}${SEO_SERVICE.path}`,
      lastModified: SEO_SERVICE.updated,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/insights`,
      ...(latestPost && { lastModified: latestPost }),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...posts.map((post, i) => ({
      url: `${SITE_URL}/insights/${post.meta.slug}`,
      lastModified: postModified[i],
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    {
      url: `${SITE_URL}/privacy`,
      lastModified: PRIVACY_UPDATED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: TERMS_UPDATED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
