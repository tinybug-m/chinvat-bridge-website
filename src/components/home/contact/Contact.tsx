import { Reveal } from "@/components/motion/Reveal";
import { Annotation } from "@/components/system/Annotation";
import { Container } from "@/components/system/Container";
import { Rule } from "@/components/system/Rule";
import { Section } from "@/components/system/Section";
import { SectionMarker } from "@/components/system/SectionMarker";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/constants";
import { ContactBrief } from "./ContactBrief";

const CORNERS = ["left-0 top-0", "right-0 top-0", "bottom-0 left-0", "bottom-0 right-0"];

/** Registration "+" mark, 8px arms, centred on a frame corner. */
function RegistrationMark({ position }: { position: string }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 ${position}`}>
      <span className="absolute inset-x-0 top-1/2 h-px bg-control" />
      <span className="absolute inset-y-0 left-1/2 w-px bg-control" />
    </span>
  );
}

export function Contact() {
  return (
    <Section id="contact" labelledBy="contact-title" ruled>
      <Container className="grid gap-x-6 gap-y-16 lg:grid-cols-12">
        <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <SectionMarker index="07" label="Contact" />
            <h2
              id="contact-title"
              className="mt-8 max-w-[18ch] text-balance font-display text-title font-medium [font-stretch:100%] lg:[font-stretch:112%]"
            >
              Build a better way forward.
            </h2>
            <p className="mt-6 max-w-measure text-pretty text-lede text-ink-soft">
              Have a business problem worth solving? Tell us what&rsquo;s slowing your business down, where you&rsquo;re
              trying to grow, or what you&rsquo;d like to build. We&rsquo;ll help you identify the most practical next
              step.
            </p>
          </Reveal>

          <Reveal delay={80} className="mt-12 lg:mt-16">
            <Rule node={4} />
            <div className="pt-8">
              <Annotation leader="start" leaderLength="2rem">
                Prefer email? Write to
              </Annotation>
              <a
                href={CONTACT_MAILTO}
                className="mt-4 block break-words text-heading font-medium leading-tight text-ink underline decoration-line-strong decoration-1 underline-offset-[0.2em] transition-[color,text-decoration-color] duration-200 hover:text-cobalt-700 hover:decoration-cobalt-700 sm:text-[clamp(1.5rem,1.1rem+1.2vw,2rem)] [overflow-wrap:anywhere]"
              >
                {CONTACT_EMAIL}
              </a>
              <p className="mt-8 font-label text-label uppercase text-ink-muted">UK Based // Working Globally</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120} className="lg:col-span-6 lg:col-start-7">
          <div className="relative border border-line bg-paper-raised p-5 sm:p-8 lg:p-10">
            {CORNERS.map((position) => (
              <RegistrationMark key={position} position={position} />
            ))}
            <div className="mb-8 flex items-center border-b border-line pb-5">
              <Annotation>Project brief</Annotation>
            </div>
            <ContactBrief />
            <noscript>
              <p className="mt-6 text-small text-ink-soft">
                The brief needs JavaScript. Please write to{" "}
                <a className="text-cobalt-700 underline" href={CONTACT_MAILTO}>
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </noscript>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
