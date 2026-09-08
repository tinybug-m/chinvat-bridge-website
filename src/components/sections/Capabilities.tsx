import { SectionIntro } from "@/components/ui/SectionIntro";
import { CAPABILITIES } from "@/data/capabilities";

export function Capabilities() {
  return (
    <section className="border-b border-stone-border bg-obsidian-900 py-20" id="machines">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <SectionIntro
          eyebrow="§ 05.00 // The Capabilities"
          heading={
            <>
              Ancient Principles. <br />
              <span className="italic text-gold-300">Modern Machines.</span>
            </>
          }
          description="Modern businesses have more tools than ever. The challenge is knowing which ones actually create value."
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {CAPABILITIES.map((capability) => (
            <div
              key={capability.title}
              className="p-4 bg-obsidian-850 border border-stone-border rounded-sm hover:border-gold-500/60 transition-colors"
            >
              <span className="font-mono text-[9px] text-gold-500 block mb-1 font-semibold">
                {`${capability.index} // ${capability.category}`}
              </span>
              <h3 className="font-mono text-sm text-parchment-100 font-semibold mb-1">{capability.title}</h3>
              <p className="font-serif-monument text-xs text-parchment-dim leading-snug">{capability.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
