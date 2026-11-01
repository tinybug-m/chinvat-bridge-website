import type { Metadata } from "next";
import { InsightIndex } from "@/components/insights/InsightIndex";
import { PageHeader } from "@/components/system/PageHeader";
import { SiteShell } from "@/components/templates/SiteShell";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Practical thinking on AI, automation, software and SEO for UK small businesses — written to help you make better, faster operational decisions.",
  alternates: { canonical: "/insights" },
};

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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Insights",
            url: `${SITE_URL}/insights`,
          }).replace(/</g, "\\u003c"),
        }}
      />
    </SiteShell>
  );
}
