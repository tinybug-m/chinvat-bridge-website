import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionHeading } from "@/components/system/SectionHeading";
import { BalanceDiagram } from "@/components/home/services/diagrams";
import { PlateDiagram } from "@/components/home/services/PlateDiagram";
import { BridgeSeam } from "./BridgeSeam";

/*
 * Approach: today -> what's next, made interactive. The heading and lede
 * are server-rendered; the stage, the seam control and the five comparison
 * rows share one small client island because they all follow the seam. The
 * stage runs edge to edge; the raised ground sets the section apart without
 * a rule. Under the lede sits the section's one nod to the name: Rashn's
 * balance from the Middle Persian texts, drawn level, with its source.
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
          <div className="mt-4 flex items-start gap-5 lg:col-span-4 lg:col-start-9 lg:mt-6">
            <PlateDiagram viewBox="110 80 180 110" className="w-28 shrink-0 text-ink">
              <BalanceDiagram />
            </PlateDiagram>
            <div>
              <p className="max-w-[30ch] text-pretty text-body text-ink-soft">
                In the Middle Persian texts, Rashn&rsquo;s balance &ldquo;renders no favour.&rdquo; We begin the same
                way, by weighing where things really stand.
              </p>
              <p className="mt-2 font-label text-label uppercase text-ink-muted">Mainyo-i Khrad 2</p>
            </div>
          </div>
        </div>
      </Container>
      <BridgeSeam className="mt-10 md:mt-14" />
    </Section>
  );
}
