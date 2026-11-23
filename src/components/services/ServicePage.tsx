import type { ComponentType } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PLATE_VIEWBOX } from "@/components/home/services/crops";
import { AiDiagram, AutomationDiagram, SeoDiagram, SoftwareDiagram } from "@/components/home/services/diagrams";
import { PlateDiagram } from "@/components/home/services/PlateDiagram";
import { ArticleEnd } from "@/components/insights/ArticleEnd";
import { Reveal } from "@/components/motion/Reveal";
import { FaqList, LinkList, ListPair, OfferingList, ServiceSection, TextGrid } from "@/components/services/ServiceBlocks";
import { JsonLdScripts, relatedInsightLinks, serviceJsonLd } from "@/components/services/structured-data";
import { ButtonLink } from "@/components/system/Button";
import { PageHeader } from "@/components/system/PageHeader";
import { SiteShell } from "@/components/templates/SiteShell";
import { getPage, getSiteChrome } from "@/lib/content/read";
import type { DIAGRAMS as DIAGRAM_KEYS, ProcessStepsCollection, SectionContent, ServiceBlock } from "@/lib/content/schema";
import { pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

/*
 * The service pages (AI, automation, software, SEO), rendered from their page documents
 * (template "service"): an ordered list of blocks, each mapped to the existing components below.
 * The header figure is the service's own homepage diagram, keyed by `diagram`; the crops, diagrams
 * and layout stay in code. Copy, calls to action and section order are content.
 */

const DIAGRAMS: Record<(typeof DIAGRAM_KEYS)[number], ComponentType> = {
  ai: AiDiagram,
  automation: AutomationDiagram,
  software: SoftwareDiagram,
  seo: SeoDiagram,
};
/** The header crop: the plate's own, except SEO, whose plate bleeds off the page edge. */
const HEADER_VIEWBOX: Record<keyof typeof DIAGRAMS, string> = {
  ai: PLATE_VIEWBOX.ai,
  automation: PLATE_VIEWBOX.automation,
  software: PLATE_VIEWBOX.software,
  seo: "16 40 384 240",
};
const BACKGROUND = { paper: undefined, raised: "bg-paper-raised", haze: "bg-haze" } as const;

/** The published (or verified-preview) service page at `path`, or a 404. */
async function servicePage(path: string) {
  const page = await getPage(path);
  if (!page || page.data.template !== "service") notFound();
  return page.data;
}

export async function serviceMetadata(path: string): Promise<Metadata> {
  const [page, { settings }] = await Promise.all([servicePage(path), getSiteChrome()]);
  return {
    ...pageMetadata({ title: page.seo.title, description: page.seo.description, path }, settings),
    ...(page.seo.robots === "noindex" && { robots: { index: false, follow: true } }),
  };
}

type Cta = Extract<ServiceBlock, { type: "page_header" }>["ctas"][number];

function CtaButton({ cta }: { cta: Cta }) {
  return (
    <ButtonLink href={cta.href} size="lg" variant={cta.variant === "secondary" ? "secondary" : undefined} arrow={cta.arrow} className="w-full sm:w-auto">
      {cta.label}
    </ButtonLink>
  );
}

function CtaRow({ ctas, className }: { ctas: Cta[]; className?: string }) {
  if (ctas.length === 0) return null;
  // One button sits alone; two or more wrap as a row from sm.
  if (ctas.length === 1) return <div className={className}><CtaButton cta={ctas[0]} /></div>;
  return (
    <div className={cn(className, "flex flex-col gap-3 sm:flex-row sm:flex-wrap")}>
      {ctas.map((cta) => (
        <CtaButton key={cta.href + cta.label} cta={cta} />
      ))}
    </div>
  );
}

function SectionContentBlock({ block, steps }: { block: SectionContent; steps: ProcessStepsCollection["items"] }) {
  switch (block.type) {
    case "text_grid":
      return <TextGrid items={block.items} columns={block.columns} />;
    case "offering_list":
      return <OfferingList items={block.items} />;
    case "list_pair":
      return <ListPair lists={block.lists} note={block.note} />;
    case "faq_list":
      return <FaqList items={block.items} />;
    case "link_list":
      return <LinkList items={block.items} />;
    case "note":
      return (
        <Reveal>
          <p className={cn("mt-10 max-w-measure text-pretty text-ink", block.size === "lede" ? "text-lede" : "text-body")}>{block.text}</p>
        </Reveal>
      );
    case "paragraphs":
      return (
        <Reveal>
          {block.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mb-5 max-w-measure text-body text-pretty text-ink-soft">
              {paragraph}
            </p>
          ))}
          <CtaRow ctas={block.ctas} className="mt-8" />
        </Reveal>
      );
    case "process_steps":
      // The shared four steps (collection:process_steps), each followed by this page's note for it.
      return <TextGrid items={steps.map((step) => ({ title: step.title, body: `${step.description} ${block.notes[step.key] ?? ""}`.trim() }))} />;
  }
}

async function Block({ block, path, steps }: { block: ServiceBlock; path: string; steps: ProcessStepsCollection["items"] }) {
  switch (block.type) {
    case "page_header": {
      const Diagram = DIAGRAMS[block.diagram];
      return (
        <PageHeader
          kicker={block.kicker}
          title={block.title}
          lede={block.lede}
          aside={
            <PlateDiagram viewBox={HEADER_VIEWBOX[block.diagram]} loop className="w-full max-w-[28rem] lg:max-w-none">
              <Diagram />
            </PlateDiagram>
          }
        >
          <CtaRow ctas={block.ctas} />
        </PageHeader>
      );
    }
    case "section":
      return (
        <ServiceSection
          id={block.anchor}
          title={block.title}
          intro={block.intro}
          ruled={block.ruled}
          stacked={block.stacked}
          className={BACKGROUND[block.background]}
        >
          {block.content.map((content, i) => (
            <SectionContentBlock key={i} block={content} steps={steps} />
          ))}
        </ServiceSection>
      );
    case "related_insights": {
      const links = await relatedInsightLinks(block.curated, path);
      // Left out while empty. Not "insights" as an id: the header lights its Insights link for any #insights.
      return links.length > 0 ? (
        <ServiceSection id={block.anchor} title={block.title}>
          <LinkList items={links} />
        </ServiceSection>
      ) : null;
    }
    case "closing":
      return <ArticleEnd related={[]} title={block.title} lede={block.lede} cta={block.ctaLabel} />;
  }
}

export async function ServicePage({ path }: { path: string }) {
  const [page, chrome] = await Promise.all([servicePage(path), getSiteChrome()]);
  const steps = chrome.processSteps.items;

  return (
    <SiteShell>
      {page.blocks.map((block, i) => (
        <Block key={i} block={block} path={path} steps={steps} />
      ))}
      {/* Service and BreadcrumbList; no offers (prices live on /pricing or are quoted). */}
      <JsonLdScripts data={serviceJsonLd({ path, name: page.service.name, serviceType: page.service.serviceType, description: page.seo.description })} />
    </SiteShell>
  );
}
