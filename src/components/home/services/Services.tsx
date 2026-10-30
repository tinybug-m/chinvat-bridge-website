import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionHeading } from "@/components/system/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { SERVICES } from "@/data/services";
import { AiDiagram, AutomationDiagram, SeoDiagram, SoftwareDiagram } from "./diagrams";
import { ServicePlate, type PlateProps } from "./ServicePlate";

/*
 * One entry per service, in the same order as SERVICES. The plates differ on
 * purpose: AI is large and bleeds off the left edge, Automation is compact and
 * dropped below its text, Software sits wide on the left on a full-bleed haze
 * band, SEO bleeds off the right edge. `svc-bleed-*` run to the viewport edge
 * on purpose: the section clips the overhang. `tone` varies the text: scale,
 * tag layout, where the outcome sits and how the link looks.
 */
const PLATES: Pick<PlateProps, "slug" | "Diagram" | "viewBox" | "draw" | "tone" | "layout">[] = [
  {
    slug: "ai",
    Diagram: AiDiagram,
    viewBox: "0 30 400 250",
    draw: true,
    tone: { title: "heading", tags: "row", outcome: "inline", link: "text" },
    layout: {
      article: "mt-16 lg:mt-24",
      grid: "lg:items-end",
      text: "lg:col-span-4 lg:col-start-9 lg:pb-8",
      figure: "svc-bleed-l lg:col-span-8 lg:col-start-1",
    },
  },
  {
    slug: "automation",
    Diagram: AutomationDiagram,
    viewBox: "0 50 400 230",
    tone: { title: "title", tags: "row", outcome: "lead", link: "text" },
    layout: {
      article: "mt-24 lg:mt-36",
      grid: "lg:items-start",
      text: "lg:col-span-5 lg:col-start-1",
      figure: "w-[85%] justify-self-end lg:col-span-4 lg:col-start-8 lg:mt-40 lg:w-auto lg:justify-self-auto",
    },
  },
  {
    slug: "software",
    Diagram: SoftwareDiagram,
    viewBox: "0 36 400 244",
    tone: { title: "heading", lede: true, tags: "row", outcome: "closing", link: "button", band: true },
    layout: {
      article: "mt-20 lg:mt-40",
      grid: "lg:items-center",
      text: "lg:col-span-4 lg:col-start-8",
      figure: "lg:col-span-6 lg:col-start-1",
    },
  },
  {
    slug: "seo",
    Diagram: SeoDiagram,
    viewBox: "0 40 400 240",
    draw: true,
    tone: { title: "heading", tags: "stack", outcome: "inline", link: "text" },
    layout: {
      article: "mt-24 lg:mt-36",
      grid: "lg:items-start",
      text: "lg:col-span-4 lg:col-start-1 lg:pt-12",
      figure: "svc-bleed-r lg:col-span-7 lg:col-start-6",
    },
  },
];

export function Services() {
  return (
    <Section id="services" labelledBy="services-title" className="overflow-x-clip">
      <Container>
        <Reveal>
          <SectionHeading id="services-title" measure="max-w-[20ch]">
            Four disciplines, one way of working.
          </SectionHeading>
        </Reveal>
        <ol className="list-none">
          {SERVICES.map((service, position) => (
            <ServicePlate key={service.title} service={service} {...PLATES[position]} />
          ))}
        </ol>
      </Container>
    </Section>
  );
}
