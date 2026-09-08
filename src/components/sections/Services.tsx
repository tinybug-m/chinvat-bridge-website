import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { SERVICES, SUPPORTING_CAPABILITIES } from "@/data/services";

export function Services() {
  return (
    <section className="border-b border-stone-border bg-obsidian-900 py-20" id="services">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <SectionIntro
          eyebrow="§ 03.00 // The Core Disciplines"
          heading="What We Do"
          description="Practical technology solutions built around real business problems."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map((service) => (
            <ServiceCard key={service.title} service={service} />
          ))}

          <div className="col-span-1 md:col-span-2 lg:col-span-4 p-4 bg-obsidian-950/80 border border-stone-border rounded-sm flex flex-col md:flex-row items-center justify-between text-xs font-mono tracking-technical text-parchment-dim gap-3">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-gold-400" />
              <span className="text-gold-400 font-semibold uppercase">Supporting Capabilities:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-parchment-200">
              {SUPPORTING_CAPABILITIES.map((capability, index) => (
                <span key={capability} className="flex items-center gap-3">
                  {index > 0 ? (
                    <span aria-hidden="true" className="text-gold-500">
                      &bull;
                    </span>
                  ) : null}
                  {capability}
                </span>
              ))}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-4 p-6 sm:p-8 bg-linear-to-r from-obsidian-850 via-obsidian-900 to-obsidian-850 border border-gold-500/40 rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 card-border-glow">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 font-mono text-[10px] text-gold-400 tracking-technical uppercase font-semibold">
                <Icon name="helpOutline" className="text-sm" />
                <span>Not Sure Where to Start?</span>
              </div>
              <h4 className="font-serif-monument text-xl sm:text-2xl text-parchment-50 uppercase">
                Every business has different constraints and opportunities.
              </h4>
              <p className="font-serif-monument text-sm text-parchment-muted leading-relaxed">
                Tell us what you&rsquo;re trying to improve, automate or build. We&rsquo;ll help you work out
                the most practical place to start.
              </p>
            </div>
            <Button href="#contact" icon="arrowForward" size="md" className="rounded-xs">
              Start a Conversation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
