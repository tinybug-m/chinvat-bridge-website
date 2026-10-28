import { ButtonLink } from "@/components/system/Button";
import { Container } from "@/components/system/Container";

// Placeholder: replaced by the hero build (3D stage, seam, discipline index).
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative pt-28 pb-section lg:pt-40">
      <Container>
        <p className="font-label text-label uppercase text-ink-muted">UK Based // Working Globally</p>
        <h1
          id="hero-title"
          className="mt-6 font-display text-display font-medium [font-stretch:100%] lg:[font-stretch:112%]"
        >
          <span className="block text-ink-muted">Same business.</span>
          <span className="block">Better systems.</span>
        </h1>
        <p className="mt-8 max-w-measure text-lede text-ink-soft">
          Chinvat Bridge helps businesses use AI, automation and modern software to reduce manual work, improve
          digital performance and build better ways of working.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/#contact" size="lg" arrow="right">
            Start a conversation
          </ButtonLink>
          <ButtonLink href="/#services" size="lg" variant="secondary" arrow="down">
            Explore services
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
