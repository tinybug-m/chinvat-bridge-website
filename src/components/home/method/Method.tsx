import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/system/Button";
import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionHeading } from "@/components/system/SectionHeading";
import { PlateDiagram } from "@/components/home/services/PlateDiagram";
import { PROCESS_STEPS } from "@/data/process";
import { METHOD_PLATES } from "./MethodDiagrams";
import { STONE_BOARD } from "./stonePlates";

/*
 * Method. One crossing in four steps: the gap is measured, the span is drawn,
 * raised from the near bank, and measured again once it stands. Each step is
 * a plate of the same stone path as the Approach stage. Nothing moves with scroll; the plates draw in
 * once, like the Services diagrams, and are finished from the start without
 * JavaScript or under reduced motion.
 */
export function Method() {
  return (
    <Section id="method" labelledBy="method-title">
      <Container>
        <Reveal>
          <SectionHeading id="method-title" size="display">
            How we work.
          </SectionHeading>
          <p className="mt-6 max-w-measure text-lede text-pretty text-ink-soft">
            No unnecessary complexity. No technology for technology’s sake.
          </p>
        </Reveal>

        <ol className="mt-12 grid gap-x-10 gap-y-14 md:mt-16 lg:grid-cols-2">
          {PROCESS_STEPS.map((step, index) => {
            const Plate = METHOD_PLATES[index];
            return (
              <li key={step.title} data-method-step={index}>
                <PlateDiagram viewBox={STONE_BOARD.viewBox} className="w-full max-w-[40rem] text-ink">
                  <Plate uid={`method-plate-${index}`} />
                </PlateDiagram>
                <Reveal delay={80} className="mt-6">
                  <p className="font-label text-label uppercase text-ink-muted">{step.index}</p>
                  <h3 className="mt-2 font-display text-heading font-medium text-ink">{step.title}</h3>
                  <p className="mt-4 max-w-measure text-body text-pretty text-ink-soft">{step.description}</p>
                </Reveal>
              </li>
            );
          })}
        </ol>

        <div className="mt-12 md:mt-16">
          <ButtonLink href="/#contact" variant="secondary" arrow="right" className="w-full sm:w-auto">
            Start a conversation
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
