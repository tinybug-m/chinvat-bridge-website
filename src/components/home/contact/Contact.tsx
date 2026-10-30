import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionHeading } from "@/components/system/SectionHeading";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/constants";
import { ContactBrief } from "./ContactBrief";

/*
 * The closing section: no card or frame, the brief sits straight on the ground.
 * One sentence of lede says what to send; the brief and the address do the rest.
 */
export function Contact() {
  return (
    <Section id="contact" labelledBy="contact-title" className="bg-haze">
      <Container className="grid grid-cols-1 gap-x-6 gap-y-14 lg:grid-cols-12">
        <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <SectionHeading id="contact-title">Build a better way forward.</SectionHeading>
            <p className="mt-6 max-w-measure text-pretty text-lede text-ink-soft">
              Tell us what&rsquo;s slowing your business down, where you&rsquo;re trying to grow, or what you&rsquo;d
              like to build.
            </p>
          </Reveal>

          <Reveal delay={80} className="mt-12 lg:mt-16">
            <a
              href={CONTACT_MAILTO}
              className="block min-h-11 break-words text-heading font-medium leading-tight text-ink underline decoration-line-strong decoration-1 underline-offset-[0.2em] transition-[color,text-decoration-color] duration-200 hover:text-cobalt-700 hover:decoration-cobalt-700 sm:text-[clamp(1.5rem,1.1rem+1.2vw,2rem)] [overflow-wrap:anywhere]"
            >
              {CONTACT_EMAIL}
            </a>
          </Reveal>
        </div>

        <Reveal delay={120} className="lg:col-span-6 lg:col-start-7">
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
        </Reveal>
      </Container>
    </Section>
  );
}
