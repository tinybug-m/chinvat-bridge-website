import { Icon } from "@/components/atoms/icons";
import { Section } from "@/components/molecules/Section";
import { SectionIntro } from "@/components/molecules/SectionIntro";
import { INSIGHT_TOPICS } from "@/data/insights";

export function Insights() {
  return (
    <Section id="insights">
      <SectionIntro
        eyebrow="Insights"
        heading="Ideas & Observations"
        note="Practical thinking about AI, software, automation and digital growth."
        className="mb-10"
        right={
          <span className="font-mono text-[10px] text-gold-400 tracking-technical uppercase font-medium bg-obsidian-900 border border-stone-border px-3 py-1 rounded-xs">
            Forthcoming Topics // Editorial Inquiries
          </span>
        }
      />

      <div className="divide-y divide-stone-border border-t border-b border-stone-border">
        {INSIGHT_TOPICS.map((topic) => (
          <div
            key={topic.index}
            className="py-6 flex flex-col md:flex-row md:items-center justify-between group hover:bg-obsidian-900/60 px-4 transition-colors"
          >
            <div className="flex items-start md:items-center gap-6">
              <span className="font-mono text-xs text-gold-500 font-semibold">{topic.index}</span>
              <div>
                <h3 className="font-serif-monument text-lg sm:text-xl text-parchment-100 group-hover:text-gold-300 transition-colors">
                  {topic.title}
                </h3>
                <span className="font-mono text-[10px] text-parchment-dim tracking-technical uppercase">
                  Category: {topic.category}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3 md:mt-0 font-mono text-[10px] tracking-technical">
              <span className="px-2.5 py-1 rounded-xs bg-obsidian-900 border border-stone-borderLight text-parchment-dim uppercase">
                {topic.status}
              </span>
              <Icon name="article" className="text-gold-500/70 text-sm" />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
