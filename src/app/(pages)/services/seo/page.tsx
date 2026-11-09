import type { Metadata } from "next";
import { SeoDiagram } from "@/components/home/services/diagrams";
import { PlateDiagram } from "@/components/home/services/PlateDiagram";
import { ArticleEnd } from "@/components/insights/ArticleEnd";
import { Reveal } from "@/components/motion/Reveal";
import {
  FaqList,
  LinkList,
  ListPair,
  OfferingList,
  ServiceSection,
  TextGrid,
} from "@/components/services/ServiceBlocks";
import { ButtonLink } from "@/components/system/Button";
import { PageHeader } from "@/components/system/PageHeader";
import { SiteShell } from "@/components/templates/SiteShell";
import { PROCESS_STEPS } from "@/data/process";
import {
  SEO_APPROACH,
  SEO_DELIVERABLES,
  SEO_ENGAGEMENT,
  SEO_FAQS,
  SEO_OFFERINGS,
  SEO_PROBLEMS,
  SEO_PROCESS_NOTES,
  SEO_RELATED_INSIGHTS,
  SEO_RELATED_SERVICES,
  SEO_SERVICE,
} from "@/data/seo-service";
import { getPostBySlug } from "@/lib/blog";
import { SITE_URL } from "@/lib/constants";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: SEO_SERVICE.title,
  description: SEO_SERVICE.description,
  path: SEO_SERVICE.path,
});

const PAGE_URL = `${SITE_URL}${SEO_SERVICE.path}`;

/*
 * Service and BreadcrumbList only. The Service carries no offers: prices live
 * on /pricing, which this page links to rather than repeats, and markup should
 * describe what the page shows. The provider is the Organization the root
 * layout already declares.
 */
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${PAGE_URL}#service`,
    name: SEO_SERVICE.name,
    serviceType: "Search engine optimisation",
    description: SEO_SERVICE.description,
    url: PAGE_URL,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: "Worldwide",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: SEO_SERVICE.name, item: PAGE_URL },
    ],
  },
];

const relatedInsights = SEO_RELATED_INSIGHTS.flatMap(({ slug, reason }) => {
  const post = getPostBySlug(slug);
  return post ? [{ href: `/insights/${slug}`, title: post.meta.title, reason }] : [];
});

export default function SeoServicePage() {
  return (
    <SiteShell>
      <PageHeader
        kicker={SEO_SERVICE.name}
        title={SEO_SERVICE.h1}
        lede={SEO_SERVICE.lede}
        aside={
          <PlateDiagram viewBox="16 40 384 240" loop className="w-full max-w-[28rem] lg:max-w-none">
            <SeoDiagram />
          </PlateDiagram>
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <ButtonLink href="/#contact" size="lg" arrow="right" className="w-full sm:w-auto">
            Discuss your SEO goals
          </ButtonLink>
          <ButtonLink href="/pricing" size="lg" variant="secondary" arrow="right" className="w-full sm:w-auto">
            Explore SEO plans
          </ButtonLink>
        </div>
      </PageHeader>

      <ServiceSection
        id="problem"
        ruled={false}
        title="Why good businesses stay hard to find."
        intro="Most visibility problems come down to a few causes, and they compound: each one makes the others harder to fix."
      >
        <TextGrid items={SEO_PROBLEMS} />
      </ServiceSection>

      <ServiceSection
        id="what-we-do"
        title="What we do."
        intro="Six kinds of work, from the technical foundations of your site to the links that point to it."
      >
        <OfferingList items={SEO_OFFERINGS} />
      </ServiceSection>

      <ServiceSection
        id="seo-approach"
        title="Foundations, content, authority."
        intro={SEO_APPROACH.intro}
        className="bg-paper-raised"
        stacked
      >
        <TextGrid items={SEO_APPROACH.parts} columns={3} />
        <Reveal>
          <p className="mt-10 max-w-measure text-lede text-pretty text-ink">{SEO_APPROACH.note}</p>
        </Reveal>
      </ServiceSection>

      <ServiceSection id="deliverables" ruled={false} title="What you receive.">
        <ListPair lists={[SEO_DELIVERABLES.start, SEO_DELIVERABLES.monthly]} note={SEO_DELIVERABLES.note} />
      </ServiceSection>

      <ServiceSection
        id="how-we-work"
        title="How we work."
        intro="The same four steps as all our work, applied to search."
      >
        <TextGrid
          items={PROCESS_STEPS.map((step) => ({
            title: step.title,
            body: `${step.description} ${SEO_PROCESS_NOTES[step.title] ?? ""}`.trim(),
          }))}
        />
      </ServiceSection>

      <ServiceSection id="plans" title="Plans and engagement." className="bg-haze">
        <Reveal>
          {SEO_ENGAGEMENT.map((paragraph) => (
            <p key={paragraph} className="mb-5 max-w-measure text-body text-pretty text-ink-soft">
              {paragraph}
            </p>
          ))}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/pricing" size="lg" arrow="right" className="w-full sm:w-auto">
              Compare SEO plans
            </ButtonLink>
            <ButtonLink href="/#contact" size="lg" variant="secondary" arrow="right" className="w-full sm:w-auto">
              Request a custom package
            </ButtonLink>
          </div>
        </Reveal>
      </ServiceSection>

      <ServiceSection id="faq" ruled={false} title="Questions we’re asked.">
        <FaqList items={SEO_FAQS} />
      </ServiceSection>

      {relatedInsights.length > 0 ? (
        // Not "insights": the header lights its Insights link for any #insights on a page.
        <ServiceSection id="related-insights" title="Related insights.">
          <LinkList items={relatedInsights} />
        </ServiceSection>
      ) : null}

      <ServiceSection id="related-services" title="Related services.">
        <LinkList items={SEO_RELATED_SERVICES} />
      </ServiceSection>

      <ArticleEnd
        related={[]}
        title="Tell us where search is holding you back."
        lede="Send us your website and what you’d like it to achieve, and we’ll tell you what we’d look at first."
        cta="Discuss your SEO goals"
      />

      {jsonLd.map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          // Escaped so no string in the data can close the script element.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
        />
      ))}
    </SiteShell>
  );
}
