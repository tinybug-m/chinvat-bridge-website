import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionMarker } from "@/components/system/SectionMarker";
import { Reveal } from "@/components/motion/Reveal";
import { SERVICES, SUPPORTING_CAPABILITIES } from "@/data/services";
import { AiDiagram, AutomationDiagram, SeoDiagram, SoftwareDiagram } from "./diagrams";
import { ServicePlate, type PlateProps } from "./ServicePlate";

/** One entry per service, in the same order as SERVICES. */
const PLATES: Pick<PlateProps, "slug" | "Diagram" | "node">[] = [
  { slug: "ai", Diagram: AiDiagram, node: 47 },
  { slug: "automation", Diagram: AutomationDiagram, node: 50 },
  { slug: "software", Diagram: SoftwareDiagram, node: 26 },
  { slug: "seo", Diagram: SeoDiagram, node: 85 },
];

export function Services() {
  return (
    <Section id="services" labelledBy="services-title" ruled>
      <Container>
        <Reveal>
          <SectionMarker index="01" label="Services" />
          <h2
            id="services-title"
            className="mt-8 max-w-[18ch] text-balance font-display text-title font-medium [font-stretch:100%] lg:[font-stretch:112%]"
          >
            Four disciplines, one way of working.
          </h2>
        </Reveal>
        <ol className="mt-12 list-none lg:mt-16">
          {SERVICES.map((service, position) => (
            <ServicePlate
              key={service.title}
              service={service}
              position={position}
              {...PLATES[position]}
            />
          ))}
        </ol>
        <p className="border-t border-line pt-6 font-label text-label uppercase text-ink-muted">
          Also: {SUPPORTING_CAPABILITIES.join(" · ")}
        </p>
      </Container>
    </Section>
  );
}
