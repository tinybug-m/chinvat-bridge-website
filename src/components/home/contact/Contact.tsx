import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionMarker } from "@/components/system/SectionMarker";

// Placeholder: replaced by the contact section build.
export function Contact() {
  return (
    <Section id="contact" labelledBy="contact-title" ruled>
      <Container>
        <SectionMarker index="07" label="Contact" />
        <h2 id="contact-title" className="mt-8 max-w-[18ch] font-display text-title font-medium [font-stretch:112%]">
          Build a better way forward.
        </h2>
      </Container>
    </Section>
  );
}
