import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/system/Button";
import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionHeading } from "@/components/system/SectionHeading";
import { METHOD_FRAME_ASPECT, METHOD_STATES } from "@/components/three/scenes/method/config";
import { PROCESS_STEPS } from "@/data/process";
import { cn } from "@/lib/utils";
import { MethodStage } from "./MethodStage";
import "./method.css";

/*
 * Method. One space-frame cell is surveyed, drawn, modelled and finally
 * built as the four steps scroll by.
 *
 * lg with motion: a large sticky stage fills the left of the section (CSS
 * sticky, nothing is pinned) and the heading, lede and four steps run down
 * the right. Below lg, and under reduced motion: no sticky stage; every step
 * carries its own still frame (a poster of that state) above or beside its
 * text. Everything is server-rendered; only the stage and its scroll reading
 * are a client island.
 */

/** The live stage and its posters (first paint, no WebGL, suspended). The state names live in each step as screen-reader text. */
function StickyStage() {
  return (
    <div className="sticky top-24">
      <div className="relative aspect-[4/3] max-h-[calc(100svh-8rem)] w-full">
        <MethodStage className="absolute inset-0">
          <div
            data-layer="posters"
            className="absolute inset-0 flex items-center transition-opacity duration-[400ms] ease-out-quart group-data-[stage-state=live]/stage:opacity-0"
          >
            <div className="relative w-full" style={{ aspectRatio: METHOD_FRAME_ASPECT }}>
              {METHOD_STATES.map((state, index) => (
                <Image
                  key={state.key}
                  data-method-poster={index}
                  src={state.poster}
                  alt=""
                  fill
                  sizes="(min-width: 90rem) 52rem, 56vw"
                  className="object-contain"
                />
              ))}
            </div>
          </div>
        </MethodStage>
      </div>
    </div>
  );
}

export function Method() {
  return (
    <Section id="method" labelledBy="method-title">
      <Container>
        <div data-method-root="" className="lg:grid lg:grid-cols-12 lg:gap-x-6">
          <div className="hidden lg:col-span-7 lg:motion-safe:block">
            <StickyStage />
          </div>

          <div className="lg:col-span-12 lg:motion-safe:col-span-5 lg:motion-safe:col-start-8">
            <SectionHeading id="method-title" size="display">
              How we work.
            </SectionHeading>
            <p className="mt-6 max-w-measure text-lede text-pretty text-ink-soft">
              No unnecessary complexity. No technology for technology’s sake.
            </p>

            <ol className="mt-10 md:mt-14 lg:motion-safe:mt-20">
              {PROCESS_STEPS.map((step, index) => {
                const state = METHOD_STATES[index];
                return (
                  <li
                    key={step.title}
                    data-method-step={index}
                    className={cn(
                      "py-6 first:pt-0 md:py-12",
                      "lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-6",
                      "lg:motion-safe:block lg:motion-safe:min-h-[56vh] lg:motion-safe:py-0 lg:motion-safe:last:min-h-[40vh]",
                    )}
                  >
                    <Reveal className="lg:col-span-5 lg:motion-safe:hidden">
                      {/* The poster frame has an empty margin; trim it below lg so steps are not separated by blank runs. */}
                      <div className="relative -my-3 w-full max-w-[34rem] md:my-0" style={{ aspectRatio: METHOD_FRAME_ASPECT }}>
                        <Image src={state.poster} alt="" fill sizes="(min-width: 64rem) 40vw, 92vw" className="object-contain" />
                      </div>
                    </Reveal>
                    <Reveal delay={80} className="mt-5 md:mt-6 lg:col-span-6 lg:col-start-7 lg:mt-0">
                      <h3 className="method-title font-display text-heading font-medium text-ink lg:motion-safe:text-title">
                        {step.title}
                      </h3>
                      <p className="sr-only">{state.caption}</p>
                      <p className="mt-4 max-w-measure text-lede text-pretty text-ink-soft">{step.description}</p>
                    </Reveal>
                  </li>
                );
              })}
            </ol>
            <div className="mt-10 md:mt-12">
              <ButtonLink href="/#contact" variant="secondary" arrow="right" className="w-full sm:w-auto">
                Start a conversation
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
