import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionMarker } from "@/components/system/SectionMarker";

// Placeholder: replaced by the method section build.
export function Method() {
  return (
    <Section id="method" labelledBy="method-title" ruled>
      <Container>
        <SectionMarker index="03" label="Method" />
        <h2 id="method-title" className="mt-8 max-w-[18ch] font-display text-title font-medium [font-stretch:112%]">
          How we work.
        </h2>
      </Container>
    </Section>
  );
}
