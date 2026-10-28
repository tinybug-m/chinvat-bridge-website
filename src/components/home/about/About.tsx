import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionMarker } from "@/components/system/SectionMarker";

// Placeholder: replaced by the about section build.
export function About() {
  return (
    <Section id="about" labelledBy="about-title" ruled>
      <Container>
        <SectionMarker index="05" label="About" />
        <h2 id="about-title" className="mt-8 max-w-[18ch] font-display text-title font-medium [font-stretch:112%]">
          Practical technology, built with care.
        </h2>
      </Container>
    </Section>
  );
}
