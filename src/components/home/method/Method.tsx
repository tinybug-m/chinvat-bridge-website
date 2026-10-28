import Image from "next/image";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Annotation } from "@/components/system/Annotation";
import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionMarker } from "@/components/system/SectionMarker";
import { METHOD_FRAME_ASPECT, METHOD_STATES } from "@/components/three/scenes/method/config";
import { PROCESS_STEPS } from "@/data/process";
import { cn } from "@/lib/utils";
import { MethodStage } from "./MethodStage";
import "./method.css";

/*
 * 03 Method. One space-frame cell is surveyed, drawn, modelled and finally
 * built as the four steps scroll by.
 *
 * lg with motion: a sticky square stage on the left (CSS sticky, nothing is
 * pinned) holds the live node; the steps are tall blocks on the right.
 * Below lg, and under reduced motion: no sticky stage; every step carries
 * its own still frame (a poster of that state) above or beside its text.
 * Everything is server-rendered; only the stage and its scroll reading are
 * a client island.
 */

const CORNERS = ["-left-1 -top-1", "-right-1 -top-1", "-bottom-1 -left-1", "-bottom-1 -right-1"] as const;

function Frame({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("relative border border-line", className)}>
      {children}
      <div aria-hidden="true">
        {CORNERS.map((position) => (
          <span key={position} className={`absolute size-2 ${position}`}>
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-control" />
            <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-control" />
          </span>
        ))}
      </div>
    </div>
  );
}

/** The live stage, its posters (first paint, no WebGL, suspended), caption and rail. */
function StickyStage() {
  return (
    <div className="sticky top-24 flex gap-5">
      <Frame className="aspect-square min-w-0 flex-1">
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
                  sizes="(min-width: 90rem) 34rem, 38vw"
                  className="object-contain"
                />
              ))}
            </div>
          </div>
        </MethodStage>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-3 top-3 flex justify-between gap-4">
          <Annotation>Fig. 03</Annotation>
          <span className="grid justify-items-end">
            {METHOD_STATES.map((state, index) => (
              <span key={state.key} data-method-caption={index} className="[grid-area:1/1]">
                <Annotation index={PROCESS_STEPS[index].index.replace(".", "")} className="whitespace-nowrap">
                  {state.caption}
                </Annotation>
              </span>
            ))}
          </span>
        </div>
      </Frame>
      <Rail />
    </div>
  );
}

/** Four ring nodes on a hairline beside the stage; the filled one is the active step. */
function Rail() {
  return (
    <div aria-hidden="true" className="relative flex w-12 flex-col justify-between py-[18%]">
      <span className="absolute inset-y-[calc(18%+0.5rem)] left-[0.3125rem] w-px bg-line" />
      <span className="method-rail-fill absolute inset-y-[calc(18%+0.5rem)] left-[0.3125rem] w-px bg-ink" />
      {PROCESS_STEPS.map((step, index) => (
        <span key={step.title} className="relative flex h-4 items-center gap-2.5">
          <span data-method-dot={index} className="method-dot size-2.5 shrink-0 rounded-full border border-saffron-600 bg-paper" />
          <span className="font-label text-label text-ink-muted">{step.index.replace(".", "")}</span>
        </span>
      ))}
    </div>
  );
}

export function Method() {
  return (
    <Section id="method" labelledBy="method-title" ruled>
      <Container>
        <SectionMarker index="03" label="Method" />
        <div className="mt-8 grid gap-y-6 lg:grid-cols-12 lg:items-end lg:gap-x-6">
          <h2
            id="method-title"
            className="max-w-[18ch] font-display text-title font-medium text-balance [font-stretch:100%] lg:col-span-6 lg:[font-stretch:112%]"
          >
            How we work.
          </h2>
          <p className="max-w-measure text-lede text-pretty text-ink-soft lg:col-span-5 lg:col-start-8">
            No unnecessary complexity. No technology for technology’s sake.
          </p>
        </div>

        <div data-method-root="" className="mt-12 md:mt-16 lg:grid lg:grid-cols-12 lg:gap-x-6">
          <div className="hidden lg:col-span-5 lg:motion-safe:block">
            <StickyStage />
          </div>

          <ol className="lg:col-span-12 lg:motion-safe:col-span-6 lg:motion-safe:col-start-7">
            {PROCESS_STEPS.map((step, index) => {
              const state = METHOD_STATES[index];
              return (
                <li
                  key={step.title}
                  data-method-step={index}
                  className={cn(
                    "border-t border-line py-10 first:border-t-0 first:pt-0 md:py-12",
                    "lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-6 lg:first:pt-0",
                    "lg:motion-safe:block lg:motion-safe:min-h-[68vh] lg:motion-safe:border-t-0 lg:motion-safe:py-0 lg:motion-safe:last:min-h-[56vh]",
                  )}
                >
                  <Reveal className="lg:col-span-5 lg:motion-safe:hidden">
                    <Frame className="w-full max-w-[34rem]">
                      <div className="relative" style={{ aspectRatio: METHOD_FRAME_ASPECT }}>
                        <Image src={state.poster} alt="" fill sizes="(min-width: 64rem) 40vw, 92vw" className="object-contain" />
                      </div>
                      <div aria-hidden="true" className="absolute inset-x-3 top-3 flex justify-between gap-4">
                        <Annotation>Fig. 03.{index + 1}</Annotation>
                        <Annotation>{state.caption}</Annotation>
                      </div>
                    </Frame>
                  </Reveal>
                  <Reveal
                    delay={80}
                    className="mt-8 lg:col-span-6 lg:col-start-7 lg:mt-0 lg:motion-safe:border-t lg:motion-safe:border-line lg:motion-safe:pt-6"
                  >
                    <p className="method-index flex items-center gap-3 font-label text-label uppercase text-ink-muted">
                      <span className="text-ink">{step.index}</span>
                      <span aria-hidden="true" className="h-px w-10 bg-line-strong" />
                      <span>{state.caption}</span>
                    </p>
                    <h3 className="method-title mt-5 font-display text-heading font-medium text-ink">{step.title}</h3>
                    <p className="mt-4 max-w-measure text-body text-pretty text-ink-soft">{step.description}</p>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
