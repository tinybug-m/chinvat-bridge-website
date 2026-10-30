import { Mark } from "@/components/brand/Mark";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowIcon } from "@/components/system/ArrowIcon";
import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionHeading } from "@/components/system/SectionHeading";
import { TextLink } from "@/components/system/TextLink";
import { MarkSheen } from "./MarkSheen";
import "./about.css";

/*
 * The page's one dark band and its one specific story, kept to two things: the
 * quote, and the origin of the name in a single paragraph. The sourced story
 * (the Gathas, Rashn, the texts) lives in the article the quiet link points to,
 * not here. On wide screens the mark spans both rows and bleeds off the right
 * edge. Text is paper at 70% or more on ink, well past 4.5:1; the link is paper
 * with an underline (cobalt would vanish on ink), and so is its focus ring.
 */
export function About() {
  return (
    <Section id="about" labelledBy="about-title" className="overflow-hidden bg-ink py-20 text-paper md:py-28 lg:py-32">
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
          </Reveal>
        </div>

        <Reveal delay={160} className="lg:col-span-5 lg:row-span-2 lg:self-center">
          <figure aria-hidden="true" className="about-mark -mr-6 ml-auto w-72 max-w-full sm:w-96 lg:-mr-0 lg:ml-0 lg:w-[145%] lg:max-w-none lg:-translate-x-[6%]">
            <MarkSheen>
              <Mark variant="glass-paper" sheen className="w-full" />
            </MarkSheen>
          </figure>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-7 lg:col-start-1">
          <h3 className="text-small font-medium text-paper/70">The Name &amp; Origin</h3>
          <p className="mt-4 max-w-measure text-pretty text-lede text-paper">
            Chinvat Bridge is inspired by the ancient Persian concept of a bridge &mdash; a passage between one state
            and another. For us, it represents the transition from how a business works today to how it could work
            tomorrow.
          </p>
          <TextLink
            href="/insights/where-the-name-chinvat-bridge-comes-from"
            prefetch={false}
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-body text-paper decoration-paper/50 hover:decoration-paper focus-visible:outline-paper"
          >
            Where the name comes from
            <ArrowIcon />
          </TextLink>
        </Reveal>
      </Container>
    </Section>
  );
}
