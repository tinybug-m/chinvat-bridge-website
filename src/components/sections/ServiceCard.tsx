import { Icon } from "@/components/icons";
import { Chip } from "@/components/ui/Chip";
import type { Service } from "@/data/services";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="bg-obsidian-850 p-6 flex flex-col justify-between border border-stone-border rounded-sm card-border-glow group">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-stone-border/80 mb-4">
          <span className="font-cinzel text-lg text-gold-400 font-semibold">{service.index}</span>
          <Icon
            name={service.icon}
            className="text-gold-500 text-xl group-hover:scale-110 transition-transform"
          />
        </div>
        <h3 className="font-serif-monument text-xl text-parchment-100 uppercase group-hover:text-gold-300 transition-colors">
          {service.title}
        </h3>
        <span className="font-mono text-[9px] text-gold-500 tracking-technical uppercase block mt-1 mb-3">
          {service.strapline}
        </span>
        <p className="font-serif-monument text-sm text-parchment-muted leading-relaxed">{service.description}</p>
        <div className="flex flex-wrap gap-1.5 pt-4">
          {service.tags.map((tag, index) => (
            <Chip key={tag} emphasized={index === 0}>
              {tag}
            </Chip>
          ))}
        </div>
      </div>
      <div className="pt-5 mt-5 border-t border-stone-border/70 flex items-center justify-between font-mono text-[10px]">
        <span className="text-gold-500 bg-gold-500/10 px-2 py-0.5 border border-gold-500/30 rounded-xs uppercase">
          {service.outcome}
        </span>
        <Icon name="arrowOutward" className="text-sm text-parchment-dim group-hover:text-gold-400" />
      </div>
    </div>
  );
}
