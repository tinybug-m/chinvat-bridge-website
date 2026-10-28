import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionMarker } from "@/components/system/SectionMarker";
import { BridgeSeam } from "./BridgeSeam";

/*
 * 02 Approach: today -> what's next, made interactive. The heading and lede
 * are server-rendered; the stage, the seam control and the five comparison
 * rows share one small client island because they all follow the seam.
 */
export function Bridge() {
  return (
    <Section id="approach" labelledBy="approach-title" ruled className="bg-paper-raised">
      <Container>
        <SectionMarker index="02" label="Approach" />
        <div className="mt-8 grid gap-y-6 lg:grid-cols-12 lg:items-end lg:gap-x-6">
          <h2
            id="approach-title"
            className="max-w-[18ch] font-display text-title font-medium text-balance [font-stretch:100%] lg:col-span-6 lg:[font-stretch:112%]"
          >
            From today to what’s next.
          </h2>
          <p className="max-w-measure text-lede text-pretty text-ink-soft lg:col-span-5 lg:col-start-8">
            Technology creates the most value when it solves a real constraint. We help identify the gap, design the
            right solution and build it.
          </p>
        </div>
        <BridgeSeam className="mt-12 md:mt-16" />
      </Container>
    </Section>
  );
}
