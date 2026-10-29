import { Mark } from "@/components/brand/Mark";
import { Reveal } from "@/components/motion/Reveal";
import { Annotation } from "@/components/system/Annotation";
import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionMarker } from "@/components/system/SectionMarker";
import { Seam } from "@/components/system/Seam";

const PILLARS = ["Strategy", "Engineering", "Automation", "Measurable Outcomes"];

export function About() {
  return (
    <Section id="about" labelledBy="about-title" ruled className="bg-paper-raised">
      <Container className="grid gap-x-6 gap-y-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal>
            <SectionMarker index="05" label="About" />
            <h2
              id="about-title"
              className="mt-8 max-w-[20ch] text-balance font-display text-title font-medium [font-stretch:100%] lg:[font-stretch:112%]"
            >
              The right technology connects the pieces.
            </h2>
          </Reveal>

          <Reveal delay={80}>
            <blockquote className="mt-12 border-l-2 border-ink pl-6 lg:mt-16">
              <p className="max-w-[26ch] text-balance font-display text-heading font-medium">
                &ldquo;Most businesses don&rsquo;t need more software. They need their people, processes and systems
                to work better together.&rdquo;
              </p>
            </blockquote>
            <p className="mt-8 max-w-measure text-pretty text-body text-ink-soft">
              Chinvat Bridge helps identify where technology can remove friction, automate repetitive work and create
              better digital experiences.
            </p>
            <ul className="mt-10 flex list-none flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6 font-label text-label uppercase text-ink-muted">
              {PILLARS.map((pillar, index) => (
                <li key={pillar} className="flex items-center gap-3">
                  <span aria-hidden="true" className="size-1.5 rounded-full border border-saffron-600" />
                  <span className={index === PILLARS.length - 1 ? "text-ink" : undefined}>{pillar}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={160} className="lg:col-span-5 lg:col-start-8">
          <figure className="mx-auto w-full max-w-[26rem] lg:max-w-none">
            <div aria-hidden="true" className="relative pb-6">
              <Seam className="absolute inset-y-0 left-1/2 border-l border-dashed border-line-strong bg-transparent" node={50} />
              <Mark variant="glass" className="relative mx-auto w-60 sm:w-70" />
            </div>
            <figcaption className="grid grid-cols-2">
              <div className="pr-5 text-right">
                <Annotation leader="end" leaderLength="1.5rem" className="text-ink">
                  Drawn
                </Annotation>
                <p className="mt-2 text-pretty text-small text-ink-soft">The way it works today</p>
              </div>
              <div className="pl-5">
                <Annotation leader="start" leaderLength="1.5rem" className="text-ink">
                  Built
                </Annotation>
                <p className="mt-2 text-pretty text-small text-ink-soft">The system it becomes</p>
              </div>
            </figcaption>
          </figure>

          <div className="mt-12 border-t border-line pt-6">
            <h3 className="font-label text-label uppercase text-ink-muted">The Name &amp; Origin</h3>
            <p className="mt-3 max-w-measure text-pretty text-body text-ink-soft">
              Chinvat Bridge is inspired by the ancient Persian concept of a bridge &mdash; a passage between one
              state and another. For us, it represents the transition from how a business works today to how it
              could work tomorrow.
            </p>
            <p className="mt-4 max-w-measure text-pretty text-body text-ink-soft">
              In the Gathas, the oldest Zoroastrian texts, the bridge is where a person&rsquo;s own conscience meets
              them. Later Middle Persian writings add Rashn, who weighs deeds on a balance that favours no one. We
              borrow the idea, not the religion: look honestly at where things stand, then build the way across.
            </p>
            <p className="mt-3 font-label text-label uppercase text-ink-muted">
              Sources: Yasna 46.10&ndash;11, 51.13; Mainyo-i Khrad 2
            </p>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
