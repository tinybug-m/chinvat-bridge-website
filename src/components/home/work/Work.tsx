import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionHeading } from "@/components/system/SectionHeading";
import { PROJECTS } from "./projects";
import { WorkIndex } from "./WorkIndex";
import "./work.css";

/*
 * Recent work as an index of names, not a wall of screenshots. The names are
 * the content; each screenshot only appears while its name is hovered or
 * focused (see WorkIndex), or inline on touch screens and without JavaScript.
 */
export function Work() {
  return (
    <Section id="work" labelledBy="work-title" className="pt-10 pb-16 md:pt-12 md:pb-20 lg:pt-14 lg:pb-24">
      <Container>
        <Reveal>
          <SectionHeading id="work-title" measure="max-w-[12ch]">
            Recent work.
          </SectionHeading>
        </Reveal>
        <Reveal delay={80} className="mt-10 lg:mt-14">
          <WorkIndex projects={PROJECTS} />
        </Reveal>
      </Container>
    </Section>
  );
}
