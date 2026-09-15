import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/templates/SiteShell";
import { Section } from "@/components/molecules/Section";
import { SectionIntro } from "@/components/molecules/SectionIntro";
import { getAllPosts, formatPostDate } from "@/lib/blog";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Insights",
  description: "Practical thinking on AI, automation, software and SEO for UK small businesses.",
  alternates: { canonical: "/insights" },
};

export default function InsightsIndexPage() {
  const posts = getAllPosts();

  return (
    <SiteShell>
      <Section containerSize="5xl">
        <SectionIntro
          eyebrow="Insights"
          heading="Ideas & Observations"
          description="Practical thinking about AI, software, automation and digital growth."
        />

        <div className="divide-y divide-stone-border border-t border-b border-stone-border">
          {posts.map((post) => (
            <Link
              key={post.meta.slug}
              href={`/insights/${post.meta.slug}`}
              className="group block py-6 px-4 hover:bg-obsidian-900/60 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] text-gold-500 uppercase tracking-technical block mb-1.5">
                    {post.meta.category}
                  </span>
                  <h2 className="font-serif-monument text-lg sm:text-xl text-parchment-100 group-hover:text-gold-300 transition-colors">
                    {post.meta.title}
                  </h2>
                  <p className="font-serif-monument text-sm text-parchment-muted mt-1 max-w-2xl">
                    {post.meta.description}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-parchment-dim uppercase tracking-technical shrink-0">
                  {formatPostDate(post.meta.date)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Insights",
            url: `${SITE_URL}/insights`,
          }),
        }}
      />
    </SiteShell>
  );
}
