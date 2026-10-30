import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionHeading } from "@/components/system/SectionHeading";
import { CAPABILITIES } from "@/data/capabilities";

/*
 * A type specimen, not a list of pitches. Services already says what each
 * thing does, so here the six are just names: a small category over a large
 * title, set in a grid that a hairline above each cell holds together (two
 * columns from sm, three from lg). The rules carry the structure, so there
 * are no boxes and no descriptions. On a phone each cell turns into one index
 * line, title left and category right on a shared baseline, so the six stay
 * short.
 */
export function Capabilities() {
  return (
    <Section id="capabilities" labelledBy="capabilities-title" className="pt-12 lg:pt-16">
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

        <ul className="mt-12 grid list-none border-b border-line sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {CAPABILITIES.map((capability, index) => (
            <Reveal
              as="li"
              key={capability.title}
              delay={(index % 3) * 60}
              className="flex flex-row-reverse items-baseline justify-between gap-x-4 border-t border-line py-4 sm:block sm:pt-5 sm:pr-6 sm:pb-12"
            >
              <p className="text-small text-ink-muted">{capability.category}</p>
              <h3 className="text-balance sm:mt-1 font-display text-[length:clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-medium leading-[1.04] tracking-[-0.015em]">
                {capability.title}
              </h3>
            </Reveal>
          ))}
        </ul>

      </Container>
    </Section>
  );
}
