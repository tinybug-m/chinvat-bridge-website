import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleEnd } from "@/components/insights/ArticleEnd";
import { ArrowIcon } from "@/components/system/ArrowIcon";
import { Container } from "@/components/system/Container";
import { PageHeader } from "@/components/system/PageHeader";
import { Prose } from "@/components/system/Prose";
import { TextLink } from "@/components/system/TextLink";
import { SiteShell } from "@/components/templates/SiteShell";
import { getAllPosts, getPostBySlug, getRelatedPosts, formatPostDate } from "@/lib/blog";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { SHARED_OPEN_GRAPH } from "@/lib/metadata";

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
  const title = post.meta.seoTitle ?? post.meta.title;

  return {
    title,
    description: post.meta.description,
    alternates: { canonical: `/insights/${post.meta.slug}` },
    // Drafts only render under `next dev`; keep them out of any index regardless.
    ...(post.meta.draft && { robots: { index: false, follow: false } }),
    openGraph: {
      ...SHARED_OPEN_GRAPH,
      title,
      description: post.meta.description,
      url,
      type: "article",
      publishedTime: post.meta.date,
      modifiedTime: post.meta.updated ?? post.meta.date,
    },
    twitter: {
      card: "summary_large_image",
      title,
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

  const url = `${SITE_URL}/insights/${post.meta.slug}`;
  // The same node the root layout declares, so search engines tie each article to the business.
  const organization = { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: post.meta.title,
    description: post.meta.description,
    url,
    inLanguage: "en-GB",
    image: `${SITE_URL}${SHARED_OPEN_GRAPH.images[0].url}`,
    datePublished: post.meta.date,
    dateModified: post.meta.updated ?? post.meta.date,
    // Every article is signed by the company; a named author waits for a real person's byline.
    author: post.meta.author === SITE_NAME ? organization : { "@type": "Person", name: post.meta.author },
    publisher: organization,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntityOfPage: url,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Insights", item: `${SITE_URL}/insights` },
      { "@type": "ListItem", position: 3, name: post.meta.title, item: url },
    ],
  };

  return (
    <SiteShell>
      <article aria-labelledby="article-title">
        <PageHeader
          kicker={post.meta.draft ? `Draft, not published · ${post.meta.category}` : post.meta.category}
          title={post.meta.title}
          titleId="article-title"
          lede={post.meta.description}
        />

        <Container className="grid grid-cols-1 gap-y-10 pt-10 pb-section lg:grid-cols-12 lg:gap-x-6 lg:pt-16">
          <aside aria-label="About this article" className="lg:col-span-3">
            <div className="lg:sticky lg:top-28">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-small lg:grid-cols-1">
                <div>
                  <dt className="text-ink-muted">Published</dt>
                  <dd className="mt-1 text-ink">
                    <time dateTime={post.meta.date}>{formatPostDate(post.meta.date)}</time>
                  </dd>
                </div>
                {post.meta.updated ? (
                  <div>
                    <dt className="text-ink-muted">Updated</dt>
                    <dd className="mt-1 text-ink">
                      <time dateTime={post.meta.updated}>{formatPostDate(post.meta.updated)}</time>
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-ink-muted">Reading time</dt>
                  <dd className="mt-1 text-ink">{post.meta.readingMinutes} min read</dd>
                </div>
              </dl>
              <TextLink
                href="/insights"
                className="mt-6 inline-flex min-h-11 items-center gap-2 text-small lg:mt-8"
              >
                <ArrowIcon className="rotate-180 group-hover/link:-translate-x-0.5" />
                All insights
              </TextLink>
            </div>
          </aside>

          <Prose className="lg:col-span-7 lg:col-start-4">
            <Content />
          </Prose>
        </Container>

        <ArticleEnd related={related} />
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />
    </SiteShell>
  );
}
