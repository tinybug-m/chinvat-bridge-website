import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/templates/SiteShell";
import { Section } from "@/components/molecules/Section";
import { getAllPosts, getPostBySlug, getRelatedPosts, formatPostDate } from "@/lib/blog";
import { SITE_URL, SITE_NAME } from "@/lib/constants";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.meta.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `${SITE_URL}/insights/${post.meta.slug}`;

  return {
    title: post.meta.title,
    description: post.meta.description,
    alternates: { canonical: `/insights/${post.meta.slug}` },
    openGraph: {
      title: post.meta.title,
      description: post.meta.description,
      url,
      type: "article",
      publishedTime: post.meta.date,
      modifiedTime: post.meta.updated ?? post.meta.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta.title,
      description: post.meta.description,
    },
  };
}

export default async function InsightArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { Content } = post;
  const related = getRelatedPosts(post);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.meta.title,
    description: post.meta.description,
    datePublished: post.meta.date,
    dateModified: post.meta.updated ?? post.meta.date,
    author: { "@type": "Organization", name: post.meta.author },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: `${SITE_URL}/insights/${post.meta.slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Insights", item: `${SITE_URL}/insights` },
      { "@type": "ListItem", position: 2, name: post.meta.title, item: `${SITE_URL}/insights/${post.meta.slug}` },
    ],
  };

  return (
    <SiteShell>
      <Section containerSize="4xl" containerWide={false}>
        <article className="space-y-8 font-serif-monument text-parchment-200 leading-relaxed">
          <div>
            <Link
              href="/insights"
              className="font-mono text-[10px] text-gold-400 hover:text-gold-300 uppercase tracking-technical"
            >
              &larr; All Insights
            </Link>
            <span className="font-mono text-[10px] text-gold-500 uppercase tracking-technical block mb-2 mt-4">
              {post.meta.category}
            </span>
            <h1 className="font-serif-monument text-3xl sm:text-4xl text-parchment-50 uppercase tracking-tight">
              {post.meta.title}
            </h1>
            <p className="font-mono text-[11px] text-parchment-dim uppercase tracking-technical mt-3">
              {formatPostDate(post.meta.date)} &middot; {post.meta.readingMinutes} min read
            </p>
          </div>

          <Content />

          {related.length > 0 ? (
            <div className="pt-8 border-t border-stone-border space-y-4">
              <span className="font-mono text-[10px] text-gold-500 uppercase tracking-technical block">
                Related Reading
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {related.map((relatedPost) => (
                  <Link
                    key={relatedPost.meta.slug}
                    href={`/insights/${relatedPost.meta.slug}`}
                    className="block border border-stone-border p-4 hover:border-gold-500/50 transition-colors"
                  >
                    <span className="font-mono text-[9px] text-gold-500 uppercase tracking-technical block mb-1">
                      {relatedPost.meta.category}
                    </span>
                    <span className="font-serif-monument text-sm text-parchment-100">{relatedPost.meta.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </article>
      </Section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </SiteShell>
  );
}
