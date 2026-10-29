import { Mark } from "@/components/brand/Mark";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionHeading } from "@/components/system/SectionHeading";

const PILLARS = ["Strategy", "Engineering", "Automation", "Measurable Outcomes"];

/*
 * The page's one dark band and its one specific story, so it gets the most
 * room: the quote and the origin text are set large, and the mark bleeds off
 * the right edge on wide screens. Body text is paper at 80% or more on ink,
 * well past 4.5:1.
 */
export function About() {
  return (
    <Section id="about" labelledBy="about-title" className="overflow-hidden bg-ink py-24 text-paper md:py-32 lg:py-40">
      <Container className="grid gap-x-6 gap-y-14 lg:grid-cols-12 lg:gap-y-20">
        <div className="lg:col-span-7">
          <Reveal>
            <SectionHeading id="about-title" measure="max-w-[16ch]">
              The right technology connects the pieces.
            </SectionHeading>
          </Reveal>

          <Reveal delay={80} className="mt-12 lg:mt-16">
            <blockquote>
              <p className="max-w-[24ch] text-balance font-display text-heading font-medium lg:text-[clamp(2rem,1.3rem+1.6vw,2.75rem)] lg:leading-[1.08]">
                &ldquo;Most businesses don&rsquo;t need more software. They need their people, processes and systems
                to work better together.&rdquo;
              </p>
            </blockquote>
            <p className="mt-8 max-w-measure text-pretty text-lede text-paper/80">
              Chinvat Bridge helps identify where technology can remove friction, automate repetitive work and create
              better digital experiences.
            </p>
          </Reveal>
        </div>

        <Reveal delay={160} className="lg:col-span-5 lg:row-span-2 lg:self-center">
          <figure aria-hidden="true" className="-mr-6 ml-auto w-72 max-w-full sm:w-96 lg:-mr-0 lg:ml-0 lg:w-[145%] lg:max-w-none lg:-translate-x-[6%]">
            <Mark variant="glass-paper" className="w-full" />
          </figure>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-7 lg:col-start-1">
          <h3 className="text-small font-medium text-paper/70">The Name &amp; Origin</h3>
          <p className="mt-4 max-w-[34ch] text-pretty font-display text-subheading font-medium lg:text-[clamp(1.5rem,1.1rem+0.9vw,2rem)] lg:leading-[1.25]">
            Chinvat Bridge is inspired by the ancient Persian concept of a bridge &mdash; a passage between one state
            and another. For us, it represents the transition from how a business works today to how it could work
            tomorrow.
          </p>
          <p className="mt-6 max-w-measure text-pretty text-lede text-paper/80">
            In the Gathas, the oldest Zoroastrian texts, the bridge is where a person&rsquo;s own conscience meets them.
            Later Middle Persian writings add Rashn, who weighs deeds on a balance that favours no one. We borrow the
            idea, not the religion: look honestly at where things stand, then build the way across.
          </p>
          <p className="mt-4 font-label text-label uppercase text-paper/70">
            Sources: Yasna 46.10&ndash;11, 51.13; Mainyo-i Khrad 2
          </p>
        </Reveal>

        <Reveal delay={120} className="lg:col-span-12">
          <ul className="grid list-none grid-cols-2 gap-x-8 gap-y-4 text-lede font-medium text-paper/80 sm:flex sm:flex-wrap sm:gap-x-12">
            {PILLARS.map((pillar, index) => (
              <li key={pillar} className={index === PILLARS.length - 1 ? "text-paper" : undefined}>
                {pillar}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}
