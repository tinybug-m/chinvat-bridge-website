import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionHeading } from "@/components/system/SectionHeading";
import { CAPABILITIES } from "@/data/capabilities";
import { SUPPORTING_CAPABILITIES } from "@/data/services";

/*
 * One running list, no boxes. Titles are the loudest type in the section and
 * step across the left half of the grid; every description sits in the same
 * column to the right, so the eye reads the stagger once and the prose as a
 * single edge. The offsets only apply from lg up: below that every row is a
 * plain stack. Classes are spelled out in full so Tailwind can see them.
 */
const TITLE_STARTS = ["lg:col-start-1", "lg:col-start-3", "lg:col-start-2"];

export function Capabilities() {
  return (
    <Section id="capabilities" labelledBy="capabilities-title">
      <span id="machines" aria-hidden="true" className="absolute -top-px block scroll-mt-20" />
      <Container>
        <div className="grid gap-x-6 gap-y-6 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <SectionHeading id="capabilities-title">What we build with.</SectionHeading>
          </Reveal>
          <Reveal delay={80} className="lg:col-span-4 lg:col-start-9">
            <p className="max-w-measure text-pretty text-lede text-ink-soft">
              Modern businesses have more tools than ever. The challenge is knowing which ones actually create value.
            </p>
          </Reveal>
        </div>

        <ul className="mt-16 grid list-none gap-y-14 md:mt-24 lg:gap-x-6 lg:gap-y-20">
          {CAPABILITIES.map((capability, index) => {
            const titleStart = TITLE_STARTS[index % TITLE_STARTS.length];
            return (
              <li key={capability.title} className="grid gap-x-6 gap-y-4 lg:grid-cols-12 lg:items-end">
                <Reveal className={`lg:col-span-6 ${titleStart}`}>
                  <p className="text-small text-ink-muted">{capability.category}</p>
                  <h3 className="mt-1 text-balance font-display text-[length:clamp(1.875rem,1.2rem+2.9vw,3.25rem)] font-medium leading-[1.04] tracking-[-0.015em]">
                    {capability.title}
                  </h3>
                </Reveal>
                <Reveal delay={60} className={`lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:pb-1.5`}>
                  <p className="max-w-measure text-pretty text-body text-ink-soft">{capability.description}</p>
                </Reveal>
              </li>
            );
          })}
        </ul>

        <div className="mt-20 lg:grid lg:grid-cols-12 lg:gap-x-6">
          <p className="text-small text-ink-muted lg:col-span-4 lg:col-start-9">
            Also: {SUPPORTING_CAPABILITIES.join(" · ")}
          </p>
        </div>
      </Container>
    </Section>
  );
}
