import type { ComponentType } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowIcon } from "@/components/system/ArrowIcon";
import { TextLink } from "@/components/system/TextLink";
import type { Service } from "@/data/services";
import { cn } from "@/lib/utils";
import { DiagramFrame } from "./DiagramFrame";

export interface PlateProps {
  service: Service;
  /** Anchor slug: the article gets id="services-<slug>". */
  slug: string;
  /** Position in the list, from 0. Odd plates mirror the layout. */
  position: number;
  Diagram: ComponentType;
  /** Where the ring node sits on the diagram's seam, in percent. */
  node: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function ServicePlate({ service, slug, position, Diagram, node }: PlateProps) {
  const mirrored = position % 2 === 1;
  const linkLabel = service.href?.startsWith("/insights/") ? "Read the article" : "See pricing";
  const headingId = `services-${slug}-title`;

  return (
    <li>
      <article
        id={`services-${slug}`}
        aria-labelledby={headingId}
        className="scroll-mt-20 border-t border-line py-12 lg:py-16"
      >
        <div className="grid grid-cols-1 items-center gap-y-10 lg:grid-cols-12 lg:gap-x-6">
          <Reveal
            className={cn(
              "lg:row-start-1",
              mirrored ? "lg:col-span-5 lg:col-start-8" : "lg:col-span-5 lg:col-start-1",
            )}
          >
            <p className="flex items-center gap-3 font-label text-label uppercase text-ink-muted">
              <span className="text-ink">{pad(position + 1)}</span>
              <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
              <span>{service.strapline}</span>
            </p>
            <h3
              id={headingId}
              className="mt-5 max-w-[16ch] text-balance font-display text-heading font-medium [font-stretch:100%] lg:[font-stretch:112%]"
            >
              {service.title}
            </h3>
            <p className="mt-5 max-w-measure text-pretty text-body text-ink-soft">{service.description}</p>
            <ul className="mt-6 flex flex-wrap font-label text-label uppercase text-ink-muted">
              {service.tags.map((tag, i) => (
                <li key={tag}>
                  {tag}
                  {i < service.tags.length - 1 ? <span aria-hidden="true" className="mx-2">·</span> : null}
                </li>
              ))}
            </ul>
            <p className="mt-6 flex items-center gap-3 border-t border-line pt-5">
              <span
                aria-hidden="true"
                className="size-[11px] shrink-0 rounded-full border-2 border-saffron-500 bg-paper"
              />
              <span>
                <span className="font-label text-label uppercase text-ink-muted">Outcome — </span>
                <span className="font-medium text-ink">{service.outcome}</span>
              </span>
            </p>
            {service.href ? (
              <p className="mt-3">
                <TextLink href={service.href} className="inline-flex min-h-11 items-center gap-2 text-body">
                  {linkLabel}
                  <span className="sr-only">: {service.title}</span>
                  <ArrowIcon />
                </TextLink>
              </p>
            ) : null}
          </Reveal>
          <div
            className={cn(
              "lg:row-start-1",
              mirrored ? "lg:col-span-6 lg:col-start-1" : "lg:col-span-6 lg:col-start-7",
            )}
          >
            <DiagramFrame figure={pad(position + 1)} node={node}>
              <Diagram />
            </DiagramFrame>
          </div>
        </div>
      </article>
    </li>
  );
}
