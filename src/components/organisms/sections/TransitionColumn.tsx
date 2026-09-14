import { Icon, type IconName } from "@/components/atoms/icons";
import type { TransitionItem } from "@/data/transition";

interface TransitionColumnProps {
  tone: "current" | "future";
  eyebrow: string;
  statusLabel: string;
  title: string;
  description: string;
  items: TransitionItem[];
  footerLabel: string;
  footerIcon: IconName;
}

const TONE = {
  current: {
    card: "border border-red-950/60 bg-obsidian-900/90 shadow-none",
    topBar: "h-1 bg-red-900/70",
    dot: "bg-red-500",
    eyebrow: "text-red-400",
    title: "text-parchment-100",
    description: "text-parchment-muted",
    itemCard: "bg-obsidian-950/80 border-stone-border/80",
    itemLabel: "text-parchment-dim",
    itemStatus: "text-red-400",
    footerBorder: "border-stone-border",
    footerText: "text-parchment-dim",
    footerIcon: "text-red-400",
  },
  future: {
    card: "border-2 border-gold-500/70 bg-obsidian-900 shadow-xl shadow-gold-500/5",
    topBar: "h-1.5 bg-linear-to-r from-gold-600 via-gold-400 to-gold-600",
    dot: "bg-gold-400 motion-safe:animate-pulse",
    eyebrow: "text-gold-300",
    title: "text-parchment-50",
    description: "text-parchment-200",
    itemCard: "bg-obsidian-850 border-gold-500/30",
    itemLabel: "text-parchment-300",
    itemStatus: "text-gold-300",
    footerBorder: "border-gold-500/30",
    footerText: "text-gold-400",
    footerIcon: "text-gold-400",
  },
} as const;

export function TransitionColumn({
  tone,
  eyebrow,
  statusLabel,
  title,
  description,
  items,
  footerLabel,
  footerIcon,
}: TransitionColumnProps) {
  const t = TONE[tone];

  return (
    <div className={`rounded-sm p-6 sm:p-8 flex flex-col justify-between relative ${t.card}`}>
      <div aria-hidden="true" className={`absolute top-0 left-0 right-0 rounded-t-sm ${t.topBar}`} />
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-stone-border mb-6">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className={`w-2 h-2 rounded-full ${t.dot}`} />
            <span className={`font-mono text-[11px] tracking-technical uppercase font-medium ${t.eyebrow}`}>
              {eyebrow}
            </span>
          </div>
          <span className={`font-mono text-[10px] uppercase font-semibold ${t.eyebrow}`}>{statusLabel}</span>
        </div>
        <h3 className={`font-serif-monument text-2xl uppercase mb-2 ${t.title}`}>{title}</h3>
        <p className={`font-serif-monument text-sm mb-6 ${t.description}`}>{description}</p>
        <div className="space-y-2.5 font-mono text-xs">
          {items.map((item) => (
            <div
              key={item.label}
              className={`p-3 border flex items-center justify-between rounded-xs ${t.itemCard}`}
            >
              <span className={t.itemLabel}>{item.label}</span>
              <span className={`font-semibold ${t.itemStatus}`}>{item.status}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={`pt-6 mt-6 border-t flex items-center justify-between text-[10px] font-mono ${t.footerBorder} ${t.footerText}`}>
        <span className="uppercase">{footerLabel}</span>
        <Icon name={footerIcon} className={`text-sm ${t.footerIcon}`} />
      </div>
    </div>
  );
}
