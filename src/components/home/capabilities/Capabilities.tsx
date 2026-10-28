import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionMarker } from "@/components/system/SectionMarker";
import { CAPABILITIES } from "@/data/capabilities";
import { SUPPORTING_CAPABILITIES } from "@/data/services";
import { Lattice } from "./Lattice";
import "./capabilities.css";

const CORNERS = [
  "-left-1 -top-1",
  "-right-1 -top-1",
  "-bottom-1 -left-1",
  "-bottom-1 -right-1",
] as const;

export function Capabilities() {
  return (
    <Section id="capabilities" labelledBy="capabilities-title" ruled>
      <Container className="cap grid gap-x-6 gap-y-12 xl:grid-cols-12 xl:grid-rows-[auto_1fr]">
        <span id="machines" aria-hidden="true" className="absolute -top-px block scroll-mt-20" />

        <Reveal className="order-1 xl:col-span-4 xl:row-start-1">
          <SectionMarker index="04" label="Capabilities" />
          <h2
            id="capabilities-title"
            className="mt-8 max-w-[18ch] text-balance font-display text-title font-medium [font-stretch:100%] lg:[font-stretch:112%]"
          >
            What we build with.
          </h2>
          <p className="mt-6 max-w-measure text-pretty text-lede text-ink-soft">
            Modern businesses have more tools than ever. The challenge is knowing which ones actually create value.
          </p>
        </Reveal>

        {/* Diagram: decorative, so it is hidden from assistive tech. */}
        <Reveal
          delay={80}
          className="cap-fig relative order-2 w-full max-w-[45rem] border border-line p-2 sm:p-6 xl:sticky xl:top-28 xl:col-span-7 xl:col-start-6 xl:row-span-2 xl:row-start-1 xl:max-w-none xl:self-start"
        >
          <div aria-hidden="true" className="cap-draw">
            <Lattice variant="narrow" />
            <Lattice variant="wide" />
            {CORNERS.map((position) => (
              <span key={position} className={`absolute size-2 ${position}`}>
                <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-control" />
                <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-control" />
              </span>
            ))}
          </div>
        </Reveal>

        <div className="order-3 xl:col-span-4 xl:row-start-2">
          <ul className="list-none border-b border-line">
            {CAPABILITIES.map((capability, index) => (
              <li
                key={capability.title}
                data-i={index}
                // Focusable on purpose: keyboard focus drives the same highlight as hover.
                tabIndex={0}
                className="cap-item group relative border-t border-line py-6 pl-5 transition-colors duration-200 hover:bg-paper-raised focus:bg-paper-raised"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-ink transition-transform duration-200 group-hover:scale-y-100 group-focus:scale-y-100"
                />
                <p className="font-label text-label uppercase text-ink-muted">
                  <span className="text-ink">{capability.index}</span>
                  <span aria-hidden="true"> · </span>
                  {capability.category}
                </p>
                <h3 className="mt-2 font-display text-subheading font-medium">{capability.title}</h3>
                <p className="mt-2 max-w-measure text-pretty text-body text-ink-soft">{capability.description}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 font-label text-label uppercase text-ink-muted">
            Also: {SUPPORTING_CAPABILITIES.join(" · ")}
          </p>
        </div>
      </Container>
    </Section>
  );
}
