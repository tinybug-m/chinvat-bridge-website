import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightIndex } from "@/components/insights/InsightIndex";
import { PageHeader } from "@/components/system/PageHeader";
import { SiteShell } from "@/components/templates/SiteShell";
import { getPublishedPosts } from "@/lib/blog";
import { getPage } from "@/lib/content/read";
import { JsonLdScripts, breadcrumbJsonLd } from "@/components/services/structured-data";
import { SITE_URL } from "@/lib/constants";
import { pageMetadata } from "@/lib/metadata";

// Header and SEO copy come only from the page:/insights document, like every other page: if it is
// unpublished the page is gone (404), never silently rendered from a second copy kept in code.
async function insightsCopy() {
  const doc = await getPage("/insights");
  if (doc?.data.template !== "insights_index") notFound();
  return doc.data;
}

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await insightsCopy();
  return pageMetadata({ title: seo.title, description: seo.description, path: "/insights" });
}

// Refreshed by publication events (tags editorial:articles, editorial:doc:page:/insights); daily revalidation is a safety net.
export const revalidate = 86400;

export default async function InsightsIndexPage() {
  // Published articles only: drafts are reviewed in the editorial desk, never on the site.
  const [posts, { header, collectionName }] = await Promise.all([getPublishedPosts(), insightsCopy()]);

  return (
    <SiteShell>
      <PageHeader
        kicker={header.kicker}
        title={header.title}
        lede={header.lede}
        ruled={false}
      />
      <InsightIndex posts={posts} />

      <JsonLdScripts
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `${SITE_URL}/insights#page`,
            name: collectionName,
            url: `${SITE_URL}/insights`,
            inLanguage: "en-GB",
            isPartOf: { "@id": `${SITE_URL}/#website` },
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
          breadcrumbJsonLd([{ name: collectionName, path: "/insights" }]),
        ]}
      />
    </SiteShell>
  );
}
