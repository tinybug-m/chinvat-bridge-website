import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionMarker } from "@/components/system/SectionMarker";

// Placeholder: replaced by the services section build.
export function Services() {
  return (
    <Section id="services" labelledBy="services-title" ruled>
      <Container>
        <SectionMarker index="01" label="Services" />
        <h2 id="services-title" className="mt-8 max-w-[18ch] font-display text-title font-medium [font-stretch:112%]">
          Four disciplines, one way of working.
        </h2>
      </Container>
    </Section>
  );
}
