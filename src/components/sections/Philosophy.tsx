import { CornerFrame } from "@/components/ui/CornerFrame";
import { Eyebrow } from "@/components/ui/Eyebrow";

const PILLARS = ["Strategy", "Engineering", "Automation"];

export function Philosophy() {
  return (
    <section className="border-b border-stone-border bg-obsidian-950 py-20 relative" id="about">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <CornerFrame className="border border-stone-border bg-obsidian-900/60 p-8 sm:p-14 rounded-sm">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <Eyebrow centered>&sect; 02.00 // The Philosophy</Eyebrow>
            <h2 className="font-serif-monument text-3xl sm:text-4xl text-parchment-50 font-normal uppercase tracking-tight">
              The right technology <br />
              <span className="italic text-gold-300">connects the pieces.</span>
            </h2>
            <blockquote className="font-serif-monument text-xl sm:text-2xl text-parchment-100 italic leading-relaxed font-light py-2">
              &ldquo;Most businesses don&rsquo;t need more software. They need their people, processes and
              systems to work better together.&rdquo;
            </blockquote>
            <p className="font-serif-monument text-sm text-parchment-muted max-w-2xl mx-auto leading-relaxed">
              Chinvat Bridge helps identify where technology can remove friction, automate repetitive work
              and create better digital experiences.
            </p>
            <div aria-hidden="true" className="w-24 h-px gold-divider-glow mx-auto" />
            <div className="max-w-2xl mx-auto text-left pt-3">
              <div className="p-6 bg-obsidian-950/70 border border-stone-border rounded-sm">
                <span className="font-mono text-[9px] text-gold-500 tracking-technical uppercase block mb-1.5 font-semibold">
                  The Name &amp; Origin
                </span>
                <p className="font-serif-monument text-sm text-parchment-muted leading-relaxed">
                  Chinvat Bridge is inspired by the ancient Persian concept of a bridge &mdash; a passage
                  between one state and another. For us, it represents the transition from how a business
                  works today to how it could work tomorrow.
                </p>
              </div>
            </div>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 font-mono text-[10px] tracking-technical text-parchment-dim uppercase">
              {PILLARS.map((pillar) => (
                <span key={pillar} className="flex items-center gap-6">
                  {pillar}
                  <span aria-hidden="true" className="text-gold-500">
                    &bull;
                  </span>
                </span>
              ))}
              <span className="text-gold-400 font-semibold">Measurable Outcomes</span>
            </div>
          </div>
        </CornerFrame>
      </div>
    </section>
  );
}
