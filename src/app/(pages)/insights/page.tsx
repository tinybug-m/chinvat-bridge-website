import type { Metadata } from "next";
import { InsightIndex } from "@/components/insights/InsightIndex";
import { PageHeader } from "@/components/system/PageHeader";
import { SiteShell } from "@/components/templates/SiteShell";
import { getAllPosts } from "@/lib/blog";
import { JsonLdScripts, breadcrumbJsonLd } from "@/components/services/structured-data";
import { SITE_URL } from "@/lib/constants";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Insights: AI, Automation, Software & SEO for SMEs",
  description:
    "Practical thinking on AI, automation, software and SEO for UK small businesses — written to help you make better, faster operational decisions.",
  path: "/insights",
});

export default function InsightsIndexPage() {
  const posts = getAllPosts();

  return (
    <SiteShell>
      <PageHeader
        kicker="Insights"
        title="Ideas & observations"
        lede="Practical thinking about AI, software, automation and digital growth."
        ruled={false}
      />
      <InsightIndex posts={posts} />

      <JsonLdScripts
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `${SITE_URL}/insights#page`,
            name: "Insights",
            url: `${SITE_URL}/insights`,
            inLanguage: "en-GB",
            isPartOf: { "@id": `${SITE_URL}/#website` },
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
          breadcrumbJsonLd([{ name: "Insights", path: "/insights" }]),
        ]}
      />
    </SiteShell>
  );
}
