import Image from "next/image";
import { Button } from "@/components/atoms/Button";
import { Container } from "@/components/atoms/Container";

const QUICK_FACTS = [
  { label: "AI & Automation", description: "Practical ways to use AI." },
  { label: "Software", description: "Tools built around your business." },
  { label: "SEO", description: "Help the right customers find you." },
];

export function Hero() {
  return (
    <section className="relative border-b border-stone-border bg-obsidian-900 fine-grid overflow-hidden py-16 lg:py-24">
      <Container className="relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-border/80 pb-4 mb-12 text-[11px] font-mono tracking-technical text-parchment-dim gap-3">
          <div className="flex items-center space-x-2.5">
            <span
              aria-hidden="true"
              className="inline-block w-2 h-2 rounded-full bg-gold-400 motion-safe:animate-pulse"
            />
            <span className="text-gold-400 font-medium">UK Based // Working Globally</span>
          </div>
          <div className="flex items-center space-x-4 text-[10px]">
            <span className="text-gold-500/90 font-semibold tracking-widest">
              AI &bull; AUTOMATION &bull; SOFTWARE &bull; SEO
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          <div className="lg:col-span-7 space-y-7">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full border border-gold-500/30 bg-obsidian-850/90 text-gold-300 text-[10px] font-mono tracking-technical uppercase">
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-gold-400" />
              <span>AI &bull; Automation &bull; Software &bull; SEO</span>
            </div>

            <div className="space-y-4">
              <h1 className="font-serif-monument text-4xl sm:text-6xl lg:text-[68px] text-parchment-50 font-normal tracking-tight uppercase leading-[1.06]">
                Build a <span className="italic font-light gold-gradient-text">better way</span> forward.
              </h1>
              <p className="font-serif-monument text-lg sm:text-xl text-parchment-muted max-w-xl leading-relaxed">
                Chinvat Bridge helps businesses use AI, automation and modern software to reduce manual
                work, improve digital performance and build better ways of working.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2 max-w-2xl">
              {QUICK_FACTS.map((fact) => (
                <div key={fact.label} className="p-3.5 bg-obsidian-850/80 border border-stone-border rounded-sm">
                  <span className="block font-mono text-[9px] text-gold-500 tracking-technical uppercase font-medium mb-1">
                    {fact.label}
                  </span>
                  <span className="font-serif-monument text-sm text-parchment-100 font-normal block leading-snug">
                    {fact.description}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button href="/#contact" icon="arrowForward" size="md">
                Start a Conversation
              </Button>
              <Button href="/#services" icon="unfoldMore" variant="outline" size="md">
                Explore Our Services
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-sm sm:max-w-md aspect-square p-8 rounded-full border border-gold-500/30 bg-obsidian-900/90 medallion-pedestal flex items-center justify-center">
              <div
                aria-hidden="true"
                className="absolute inset-2 rounded-full border border-gold-500/15 border-dashed pointer-events-none"
              />
              <div
                aria-hidden="true"
                className="absolute inset-5 rounded-full border border-stone-borderLight pointer-events-none"
              />
              <div
                aria-hidden="true"
                className="absolute inset-7 rounded-full border border-gold-500/20 pointer-events-none"
              />
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-gold-500/80 shadow-2xl bg-black group/medallion">
                <Image
                  src="/logo.jpg"
                  alt="Chinvat Bridge medallion emblem depicting a classical architectural bridge crossing toward the sun"
                  fill
                  sizes="(min-width: 640px) 28rem, 90vw"
                  className="object-cover object-[center_40%] scale-110 transition-transform duration-700 group-hover/medallion:scale-115"
                  priority
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-t from-obsidian-950/40 via-transparent to-transparent pointer-events-none"
                />
              </div>
              <div className="absolute -top-2.5 bg-obsidian-950 px-2.5 py-0.5 border border-gold-500/40 text-[9px] font-mono text-gold-400 tracking-technical uppercase rounded-xs shadow">
                The Bridge Concept
              </div>
              <div className="absolute -bottom-2.5 bg-obsidian-950 px-2.5 py-0.5 border border-gold-500/40 text-[9px] font-mono text-gold-400 tracking-technical uppercase rounded-xs shadow">
                Bridging Today &amp; Tomorrow
              </div>
            </div>
            <div className="mt-6 text-center space-y-1">
              <span className="font-cinzel text-xs tracking-regal text-gold-300 uppercase block font-semibold">
                Bridging Today &amp; Tomorrow
              </span>
              <p className="font-mono text-[10px] text-parchment-dim tracking-technical max-w-xs mx-auto">
                From manual constraints to reliable, modern digital systems.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
