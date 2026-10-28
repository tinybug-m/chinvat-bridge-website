import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionMarker } from "@/components/system/SectionMarker";

// Placeholder: replaced by the capabilities section build.
export function Capabilities() {
  return (
    <Section id="capabilities" labelledBy="capabilities-title" ruled>
      <Container>
        <span id="machines" aria-hidden="true" className="block scroll-mt-20" />
        <SectionMarker index="04" label="Capabilities" />
        <h2 id="capabilities-title" className="mt-8 max-w-[18ch] font-display text-title font-medium [font-stretch:112%]">
          What we build with.
        </h2>
      </Container>
    </Section>
  );
}
