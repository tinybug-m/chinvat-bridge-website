import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/system/Container";
import { RowLink } from "@/components/system/RowLink";
import { Section } from "@/components/system/Section";
import { SectionHeading } from "@/components/system/SectionHeading";
import { cn } from "@/lib/utils";

/*
 * The building blocks of a service page, in the homepage's grammar: an H2 in
 * the left columns, the content to its right, hairlines instead of boxes, and
 * Reveal for the rise-in (which already yields to reduced motion). Each block
 * takes plain data, so every service page reads as one system.
 */

interface ServiceSectionProps {
  id: string;
  title: string;
  /** A sentence under the heading. */
  intro?: ReactNode;
  /** Draw the hairline above the section. */
  ruled?: boolean;
  /** Section background, for the occasional band (bg-paper-raised, bg-haze). */
  className?: string;
  /** Stack the heading above the content instead of beside it from lg. */
  stacked?: boolean;
  children: ReactNode;
}

/** A section with its heading beside (or above) its content. */
export function ServiceSection({ id, title, intro, ruled = true, className, stacked = false, children }: ServiceSectionProps) {
  const titleId = `${id}-title`;
  return (
    <Section id={id} labelledBy={titleId} ruled={ruled} className={className}>
      <Container className={cn("grid grid-cols-1 gap-y-10 lg:gap-x-6", !stacked && "lg:grid-cols-12")}>
        <Reveal className={cn(!stacked && "lg:col-span-4")}>
          <SectionHeading id={titleId}>{title}</SectionHeading>
          {intro ? <p className="mt-6 max-w-measure text-pretty text-lede text-ink-soft">{intro}</p> : null}
        </Reveal>
        <div className={cn(!stacked && "lg:col-span-7 lg:col-start-6")}>{children}</div>
      </Container>
    </Section>
  );
}

/** Short titled paragraphs in a hairline grid: two columns from md, or three when `columns` is 3 (from lg). */
export function TextGrid({ items, columns = 2 }: { items: { title: string; body: string }[]; columns?: 2 | 3 }) {
  return (
    <ul className={cn("grid list-none border-b border-line md:grid-cols-2 md:gap-x-6", columns === 3 && "lg:grid-cols-3")}>
      {items.map((item, index) => (
        <Reveal as="li" key={item.title} delay={(index % columns) * 60} className="border-t border-line pt-5 pb-8 md:pb-10">
          <h3 className="max-w-[24ch] text-balance font-display text-subheading font-medium text-ink">{item.title}</h3>
          <p className="mt-3 max-w-measure text-body text-pretty text-ink-soft">{item.body}</p>
        </Reveal>
      ))}
    </ul>
  );
}

/** Rows of what is offered: title, description and, muted, which plans include it. */
export function OfferingList({ items }: { items: { title: string; body: string; scope?: string }[] }) {
  return (
    <ul className="list-none border-b border-line">
      {items.map((item) => (
        <Reveal as="li" key={item.title} className="border-t border-line py-6 md:py-8">
          <h3 className="text-balance font-display text-subheading font-medium text-ink">{item.title}</h3>
          <p className="mt-3 max-w-measure text-body text-pretty text-ink-soft">{item.body}</p>
          {item.scope ? <p className="mt-3 text-small text-ink-muted">{item.scope}</p> : null}
        </Reveal>
      ))}
    </ul>
  );
}

/** Two titled lists side by side from sm (for example, what starts the work and what recurs). */
export function ListPair({ lists, note }: { lists: { title: string; items: string[] }[]; note?: ReactNode }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
        {lists.map((list, index) => (
          <Reveal key={list.title} delay={index * 60}>
            <h3 className="font-display text-subheading font-medium text-ink">{list.title}</h3>
            <ul className="mt-4 list-none border-b border-line">
              {list.items.map((item) => (
                <li key={item} className="border-t border-line py-3 text-body text-pretty text-ink-soft">
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
      {note ? <p className="mt-8 max-w-measure text-small text-pretty text-ink-muted">{note}</p> : null}
    </>
  );
}

/** Questions and answers, all open: the answers are part of the page, not hidden behind a toggle. */
export function FaqList({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="border-b border-line">
      {items.map((item) => (
        <Reveal key={item.question} className="border-t border-line py-6 md:py-8">
          <h3 className="text-balance font-display text-subheading font-medium text-ink">{item.question}</h3>
          <p className="mt-3 max-w-measure text-body text-pretty text-ink-soft">{item.answer}</p>
        </Reveal>
      ))}
    </div>
  );
}

/** Links as hairline rows, each with a line on why it is worth following. */
export function LinkList({ items }: { items: { href: string; title: string; reason: string }[] }) {
  return (
    <ul className="list-none border-b border-line">
      {items.map((item) => (
        <li key={item.href} className="border-t border-line">
          <RowLink href={item.href} title={item.title} meta={item.reason} />
        </li>
      ))}
    </ul>
  );
}
