import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionHeading } from "@/components/system/SectionHeading";
import type { HomePage, WorkProjectsCollection } from "@/lib/content/schema";
import { WorkIndex, type Project } from "./WorkIndex";
import "./work.css";

/*
 * Recent work as an index of names, not a wall of screenshots. The names are
 * the content; each screenshot only appears while its name is hovered or
 * focused (see WorkIndex), or inline on touch screens and without JavaScript.
 */
type WorkContent = HomePage["blocks"][2];

/*
 * Concepts are always labelled as concepts in plain text, so they are never read as commissioned
 * work (the label comes from the block, chosen by each project's kind).
 */
const toProject = (labels: WorkContent["labels"]) => (p: WorkProjectsCollection["items"][number]): Project => ({
  key: p.key,
  name: p.name,
  context: p.context,
  label: p.kind === "client" ? labels.client : labels.concept,
  href: p.href,
  src: p.image.src,
  width: p.image.width,
  height: p.image.height,
  alt: p.image.alt,
});

export function Work({ content, projects }: { content: WorkContent; projects: WorkProjectsCollection["items"] }) {
  return (
    <Section id="work" labelledBy="work-title" className="pt-10 pb-16 md:pt-12 md:pb-20 lg:pt-14 lg:pb-24">
      <Container>
        <Reveal>
          <SectionHeading id="work-title" measure="max-w-[12ch]">
            {content.heading}
          </SectionHeading>
        </Reveal>
        <Reveal delay={80} className="mt-10 lg:mt-14">
          <WorkIndex projects={projects.map(toProject(content.labels))} />
        </Reveal>
      </Container>
    </Section>
  );
}
