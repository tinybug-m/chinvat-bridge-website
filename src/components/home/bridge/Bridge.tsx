import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionMarker } from "@/components/system/SectionMarker";

// Placeholder: replaced by the approach section build.
export function Bridge() {
  return (
    <Section id="approach" labelledBy="approach-title" ruled>
      <Container>
        <SectionMarker index="02" label="Approach" />
        <h2 id="approach-title" className="mt-8 max-w-[18ch] font-display text-title font-medium [font-stretch:112%]">
          From today to what’s next.
        </h2>
      </Container>
    </Section>
  );
}
