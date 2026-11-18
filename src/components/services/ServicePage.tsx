import type { ComponentType } from "react";
import type { Metadata } from "next";
import { AiDiagram, AutomationDiagram, SoftwareDiagram } from "@/components/home/services/diagrams";
import { PlateDiagram } from "@/components/home/services/PlateDiagram";
import { ArticleEnd } from "@/components/insights/ArticleEnd";
import { Reveal } from "@/components/motion/Reveal";
import { FaqList, LinkList, OfferingList, ServiceSection, TextGrid } from "@/components/services/ServiceBlocks";
import { ButtonLink } from "@/components/system/Button";
import { PageHeader } from "@/components/system/PageHeader";
import { SiteShell } from "@/components/templates/SiteShell";
import { PROCESS_STEPS } from "@/data/process";
import type { ServiceDiagram, ServicePageContent } from "@/data/service-pages";
import { getPostBySlug } from "@/lib/blog";
import { SITE_URL } from "@/lib/constants";
import { pageMetadata } from "@/lib/metadata";

/*
 * The AI, automation and software service pages: the same order of blocks as /services/seo
 * (problem, what we do, examples, approach, process, engagement, questions, related reading),
 * filled from data/service-pages.ts. The header figure is the service's own homepage diagram,
 * cropped as on its plate. These services are quoted per project, so the calls to action open
 * the homepage conversation; only SEO has plans on /pricing.
 */

const DIAGRAMS: Record<ServiceDiagram, { Diagram: ComponentType; viewBox: string }> = {
  ai: { Diagram: AiDiagram, viewBox: "16 24 368 270" },
  automation: { Diagram: AutomationDiagram, viewBox: "16 66 368 168" },
  software: { Diagram: SoftwareDiagram, viewBox: "16 40 368 232" },
};

export function serviceMetadata(content: ServicePageContent): Metadata {
  return pageMetadata({ title: content.title, description: content.description, path: content.path });
}

/** Service and BreadcrumbList; the provider is the Organization the root layout declares. No offers: none are priced. */
function structuredData(content: ServicePageContent) {
  const url = `${SITE_URL}${content.path}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${url}#service`,
      name: content.name,
      serviceType: content.serviceType,
      description: content.description,
      url,
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: "Worldwide",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: content.name, item: url },
      ],
    },
  ];
}

export function ServicePage({ content }: { content: ServicePageContent }) {
  const { Diagram, viewBox } = DIAGRAMS[content.diagram];
  const relatedInsights = content.relatedInsights.flatMap(({ slug, reason }) => {
    const post = getPostBySlug(slug);
    return post ? [{ href: `/insights/${slug}`, title: post.meta.title, reason }] : [];
  });

  return (
    <SiteShell>
      <PageHeader
        kicker={content.name}
        title={content.h1}
        lede={content.lede}
        aside={
          <PlateDiagram viewBox={viewBox} loop className="w-full max-w-[28rem] lg:max-w-none">
            <Diagram />
          </PlateDiagram>
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <ButtonLink href="/#contact" size="lg" arrow="right" className="w-full sm:w-auto">
            {content.primaryCta}
          </ButtonLink>
          <ButtonLink href="#what-we-do" size="lg" variant="secondary" arrow="down" className="w-full sm:w-auto">
            See what we do
          </ButtonLink>
        </div>
      </PageHeader>

      <ServiceSection id="problem" ruled={false} title={content.problems.title} intro={content.problems.intro}>
        <TextGrid items={content.problems.items} />
      </ServiceSection>

      <ServiceSection id="what-we-do" title={content.offerings.title} intro={content.offerings.intro}>
        <OfferingList items={content.offerings.items} />
      </ServiceSection>

      <ServiceSection id="examples" title={content.examples.title} intro={content.examples.intro} className="bg-paper-raised">
        <TextGrid items={content.examples.items} />
        {content.examples.note ? (
          <Reveal>
            <p className="mt-10 max-w-measure text-body text-pretty text-ink">{content.examples.note}</p>
          </Reveal>
        ) : null}
      </ServiceSection>

      {content.detail ? (
        <ServiceSection id={content.detail.id} ruled={false} title={content.detail.title}>
          <Reveal>
            {content.detail.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mb-5 max-w-measure text-body text-pretty text-ink-soft">
                {paragraph}
              </p>
            ))}
          </Reveal>
        </ServiceSection>
      ) : null}

      <ServiceSection id="approach-principles" title={content.approach.title} intro={content.approach.intro} stacked>
        <TextGrid items={content.approach.parts} columns={3} />
        <Reveal>
          <p className="mt-10 max-w-measure text-lede text-pretty text-ink">{content.approach.note}</p>
        </Reveal>
      </ServiceSection>

      <ServiceSection id="how-we-work" title="How we work." intro="The same four steps as all our work, applied to this service.">
        <TextGrid
          items={PROCESS_STEPS.map((step) => ({
            title: step.title,
            body: `${step.description} ${content.process[step.title] ?? ""}`.trim(),
          }))}
        />
      </ServiceSection>

      <ServiceSection id="engagement" title="How projects start." className="bg-haze">
        <Reveal>
          {content.engagement.map((paragraph) => (
            <p key={paragraph} className="mb-5 max-w-measure text-body text-pretty text-ink-soft">
              {paragraph}
            </p>
          ))}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/#contact" size="lg" arrow="right" className="w-full sm:w-auto">
              {content.primaryCta}
            </ButtonLink>
            <ButtonLink href="/pricing" size="lg" variant="secondary" arrow="right" className="w-full sm:w-auto">
              See custom packages
            </ButtonLink>
          </div>
        </Reveal>
      </ServiceSection>

      <ServiceSection id="faq" ruled={false} title="Questions we’re asked.">
        <FaqList items={content.faqs} />
      </ServiceSection>

      {relatedInsights.length > 0 ? (
        // Not "insights": the header lights its Insights link for any #insights on a page.
        <ServiceSection id="related-insights" title="Related insights.">
          <LinkList items={relatedInsights} />
        </ServiceSection>
      ) : null}

      <ServiceSection id="related-services" title="Related services.">
        <LinkList items={content.relatedServices} />
      </ServiceSection>

      <ArticleEnd related={[]} title={content.close.title} lede={content.close.lede} cta={content.close.cta} />

      {structuredData(content).map((data) => (
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
