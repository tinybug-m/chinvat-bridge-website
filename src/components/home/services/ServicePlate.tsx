import type { ComponentType } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowIcon } from "@/components/system/ArrowIcon";
import { TextLink } from "@/components/system/TextLink";
import type { Service } from "@/data/services";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/system/Button";
import { PlateDiagram } from "./PlateDiagram";
import type { EnergyPorts } from "./energy/EnergyFlow";

/**
 * How a plate sets its text. The plates share one short vocabulary
 * (strapline, title, description, link) and each picks its own scale and
 * link style, so the four read as one system without being stamped copies.
 * The tags and outcome in SERVICES are not shown here: the homepage keeps
 * each plate to what it does and where to read more.
 */
export interface PlateTone {
  /** Size of the H3. */
  title: "heading" | "title";
  /** Description in the lede size instead of body. */
  lede?: boolean;
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
  /** Plate uses .draw lines (needs a definite-width figure; see PlateDiagram). */
  draw?: boolean;
  tone: PlateTone;
  /** Where the energy wire enters and leaves the diagram (board units). */
  energy?: EnergyPorts;
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

export function ServicePlate({ service, slug, Diagram, viewBox, draw, tone, energy, layout }: PlateProps) {
  const linkLabel = service.href?.startsWith("/insights/") ? "Read the article" : "See pricing";
  const headingId = `services-${slug}-title`;

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
                tone.title === "title" ? "max-w-[12ch] text-[length:clamp(2.25rem,1.6rem+1.8vw,3rem)] leading-[1.04] tracking-[-0.02em]" : "max-w-[20ch] text-heading",
              )}
            >
              {service.title}
            </h3>
            <p className={cn("mt-5 max-w-measure text-pretty text-ink-soft", tone.lede ? "text-lede" : "text-body")}>
              {service.description}
            </p>
            {service.href ? (
              tone.link === "button" ? (
                <p className="mt-8">
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
          <PlateDiagram viewBox={viewBox} draw={draw} loop energy={energy} className={cn("lg:row-start-1", layout.figure)}>
            <Diagram />
          </PlateDiagram>
        </div>
      </article>
    </li>
  );
}
