import type { ComponentType } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowIcon } from "@/components/system/ArrowIcon";
import { TextLink } from "@/components/system/TextLink";
import type { Service } from "@/data/services";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/system/Button";
import { PlateDiagram } from "./PlateDiagram";

/**
 * How a plate sets its text. The plates share one vocabulary (strapline,
 * title, description, tags, outcome, link) and each picks its own scale and
 * placement, so the four read as one system without being stamped copies.
 */
export interface PlateTone {
  /** Size of the H3. */
  title: "heading" | "title";
  /** Description in the lede size instead of body. */
  lede?: boolean;
  /** Tags run across the line, or stand one to a line. */
  tags: "row" | "stack";
  /** Outcome: after the tags, as the first thing under the title, or as a display line before the link. */
  outcome: "inline" | "lead" | "closing";
  /** Text link, or an outlined button. */
  link: "text" | "button";
  /** Full-bleed haze band behind the plate. */
  band?: boolean;
}

export interface PlateProps {
  service: Service;
  /** Anchor slug: the article gets id="services-<slug>". */
  slug: string;
  Diagram: ComponentType;
  /** Crop of the diagram board for this plate. */
  viewBox: string;
  tone: PlateTone;
  /** Per-plate layout: each plate sets its own spans, offsets and bleed. */
  layout: {
    /** Margin above the plate, which sets the vertical rhythm of the list. */
    article: string;
    grid: string;
    text: string;
    figure: string;
  };
}

const BAND =
  "relative isolate py-14 before:absolute before:inset-y-0 before:left-1/2 before:-z-10 before:w-screen before:-translate-x-1/2 before:bg-haze before:content-[''] lg:py-24";

export function ServicePlate({ service, slug, Diagram, viewBox, tone, layout }: PlateProps) {
  const linkLabel = service.href?.startsWith("/insights/") ? "Read the article" : "See pricing";
  const headingId = `services-${slug}-title`;

  const outcome = (
    <p className={tone.outcome === "inline" ? "mt-6 text-body" : tone.outcome === "lead" ? "mt-5" : "mt-8"}>
      <span className="text-body text-ink-muted">Outcome — </span>
      <span
        className={cn(
          "font-medium text-ink",
          tone.outcome === "inline" ? "text-body" : "font-display text-subheading",
        )}
      >
        {service.outcome}
      </span>
    </p>
  );

  return (
    <li>
      <article
        id={`services-${slug}`}
        aria-labelledby={headingId}
        className={cn("scroll-mt-20", layout.article, tone.band && BAND)}
      >
        <div className={cn("grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:gap-x-6", layout.grid)}>
          <Reveal className={cn("lg:row-start-1", layout.text)}>
            <p className="text-small text-ink-muted">{service.strapline}</p>
            <h3
              id={headingId}
              className={cn(
                "mt-3 text-balance font-display font-medium [font-stretch:100%] lg:[font-stretch:112%]",
                tone.title === "title" ? "max-w-[12ch] text-title" : "max-w-[16ch] text-heading",
              )}
            >
              {service.title}
            </h3>
            {tone.outcome === "lead" ? outcome : null}
            <p className={cn("max-w-measure text-pretty text-ink-soft", tone.outcome === "lead" ? "mt-4" : "mt-5", tone.lede ? "text-lede" : "text-body")}>
              {service.description}
            </p>
            {tone.tags === "row" ? (
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-small text-ink-muted">
                {service.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            ) : (
              <ul className="mt-6 grid gap-y-1 text-small text-ink-muted">
                {service.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
            {tone.outcome === "inline" || tone.outcome === "closing" ? outcome : null}
            {service.href ? (
              tone.link === "button" ? (
                <p className="mt-6">
                  <ButtonLink href={service.href} variant="secondary" arrow="right" className="w-full sm:w-auto">
                    {linkLabel}
                    <span className="sr-only">: {service.title}</span>
                  </ButtonLink>
                </p>
              ) : (
                <p className="mt-2">
                  <TextLink href={service.href} className="inline-flex min-h-11 items-center gap-2 text-body">
                    {linkLabel}
                    <span className="sr-only">: {service.title}</span>
                    <ArrowIcon />
                  </TextLink>
                </p>
              )
            ) : null}
          </Reveal>
          <PlateDiagram viewBox={viewBox} className={cn("lg:row-start-1", layout.figure)}>
            <Diagram />
          </PlateDiagram>
        </div>
      </article>
    </li>
  );
}
