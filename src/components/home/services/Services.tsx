import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionHeading } from "@/components/system/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { SERVICES } from "@/data/services";
import { AiDiagram, AutomationDiagram, SeoDiagram, SoftwareDiagram } from "./diagrams";
import { ServicePlate, type PlateProps } from "./ServicePlate";
import { EnergyFlow } from "./energy/EnergyFlow";

/*
 * One entry per service, in the same order as SERVICES. The plates vary
 * their placement (AI and Software on the left, Automation dropped below its
 * title on the right, SEO bleeding off the right edge; the section clips the
 * overhang) but every diagram draws at one scale: six columns on desktop
 * and a crop about 368 units wide (SEO's 400 includes its bleed), at most
 * 40rem below lg. `tone` varies the text: title scale, description size and
 * how the link looks.
 *
 * `energy` is where the wire from the hero (EnergyFlow) meets each diagram,
 * on its END artwork: the AI graph's top or leftmost node, the automation
 * trigger and result, the browser window's edge, the SEO baseline, which the
 * energy runs along and leaves at the page edge, on its way down to the
 * Approach seam. The keepout is the artwork the wire must route around.
 */
const PLATES: Pick<PlateProps, "slug" | "Diagram" | "viewBox" | "draw" | "tone" | "energy" | "layout">[] = [
  {
    slug: "ai",
    Diagram: AiDiagram,
    viewBox: "16 24 368 270",
    tone: { title: "heading", link: "text" },
    energy: {
      ins: [
        { x: 274, y: 34, dir: "down" },
        { x: 129, y: 126, dir: "right", penalty: 60 },
      ],
      outs: [{ x: 225, y: 287, dir: "down" }],
      keepout: [129, 34, 325, 287],
    },
    layout: {
      article: "mt-10 lg:mt-12",
      grid: "lg:items-end",
      text: "lg:col-span-4 lg:col-start-9 lg:pb-8",
      figure: "max-w-[40rem] lg:col-span-6 lg:col-start-2 lg:max-w-none",
    },
  },
  {
    slug: "automation",
    Diagram: AutomationDiagram,
    viewBox: "16 66 368 168",
    tone: { title: "title", link: "text" },
    energy: {
      ins: [{ x: 28, y: 150, dir: "right" }],
      outs: [{ x: 354, y: 172, dir: "down" }],
      keepout: [28, 80, 376, 220],
    },
    layout: {
      article: "mt-24 lg:mt-36",
      grid: "lg:items-start",
      text: "lg:col-span-5 lg:col-start-1",
      figure: "max-w-[40rem] lg:col-span-6 lg:col-start-7 lg:mt-32 lg:max-w-none",
    },
  },
  {
    slug: "software",
    Diagram: SoftwareDiagram,
    viewBox: "16 40 368 232",
    tone: { title: "heading", lede: true, link: "button", band: true },
    energy: {
      ins: [
        { x: 200, y: 48, dir: "down" },
        { x: 120, y: 160, dir: "right", penalty: 60 },
      ],
      outs: [{ x: 200, y: 264, dir: "down" }],
      keepout: [120, 48, 280, 264],
    },
    layout: {
      article: "mt-20 lg:mt-40",
      grid: "lg:items-center",
      text: "lg:col-span-4 lg:col-start-8",
      figure: "max-w-[40rem] lg:col-span-6 lg:col-start-1 lg:max-w-none",
    },
  },
  {
    slug: "seo",
    Diagram: SeoDiagram,
    viewBox: "0 40 400 240",
    tone: { title: "heading", link: "text" },
    energy: {
      ins: [{ x: 24, y: 256, dir: "right" }],
      outs: [{ x: 396, y: 256, dir: "down" }],
      keepout: [24, 70, 400, 258],
    },
    layout: {
      article: "mt-24 lg:mt-36",
      grid: "lg:items-start",
      text: "lg:col-span-4 lg:col-start-1 lg:pt-12",
      figure: "svc-bleed-r lg:col-span-6 lg:col-start-7",
    },
  },
];

export function Services() {
  return (
    <Section id="services" labelledBy="services-title" className="overflow-x-clip">
      <EnergyFlow />
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
