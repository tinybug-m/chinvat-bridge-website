import { SectionIntro } from "@/components/ui/SectionIntro";
import { PROCESS_STEPS } from "@/data/process";

export function Process() {
  return (
    <section className="border-b border-stone-border bg-obsidian-950 py-20 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <SectionIntro
          eyebrow="The Method"
          heading="A Clear, Disciplined Process"
          description="No unnecessary complexity. No technology for technology's sake."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROCESS_STEPS.map((step) => (
            <div key={step.title} className="p-6 bg-obsidian-900 border border-stone-border rounded-sm">
              <span className="font-cinzel text-lg text-gold-400 font-semibold block mb-2 uppercase">
                {step.index} {step.title}
              </span>
              <p className="font-serif-monument text-sm text-parchment-muted leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
