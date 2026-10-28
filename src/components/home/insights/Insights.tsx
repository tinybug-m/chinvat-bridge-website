import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionMarker } from "@/components/system/SectionMarker";

// Placeholder: replaced by the insights section build.
export function Insights() {
  return (
    <Section id="insights" labelledBy="insights-title" ruled>
      <Container>
        <SectionMarker index="06" label="Insights" />
        <h2 id="insights-title" className="mt-8 max-w-[18ch] font-display text-title font-medium [font-stretch:112%]">
          Ideas and observations.
        </h2>
      </Container>
    </Section>
  );
}
