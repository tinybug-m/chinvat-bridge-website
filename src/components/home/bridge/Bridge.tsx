import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionHeading } from "@/components/system/SectionHeading";
import { BridgeSeam } from "./BridgeSeam";

/*
 * Approach: today -> what's next, made interactive. The heading and lede
 * are server-rendered; the stage, the seam control and the five comparison
 * rows share one small client island because they all follow the seam. The
 * stage runs edge to edge; the raised ground sets the section apart without
 * a rule.
 */
export function Bridge() {
  return (
    <Section id="approach" labelledBy="approach-title" className="bg-paper-raised">
      <Container>
        <div className="grid gap-y-6 lg:grid-cols-12 lg:items-end lg:gap-x-6">
          <SectionHeading id="approach-title" measure="max-w-[16ch]" className="lg:col-span-7">
            From today to what’s next.
          </SectionHeading>
          <p className="max-w-measure text-lede text-pretty text-ink-soft lg:col-span-4 lg:col-start-9">
            Technology creates the most value when it solves a real constraint. We help identify the gap, design the
            right solution and build it.
          </p>
        </div>
      </Container>
      <BridgeSeam className="mt-10 md:mt-14" />
    </Section>
  );
}
