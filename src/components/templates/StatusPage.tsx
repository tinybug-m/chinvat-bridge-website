import type { ReactNode } from "react";

type StatusPageTone = "neutral" | "celebratory";

const TONE_CLASSES: Record<StatusPageTone, { container: string; eyebrow: string; description: string }> = {
  neutral: {
    container: "border border-stone-border bg-obsidian-900/60",
    eyebrow: "text-gold-500",
    description: "text-parchment-muted",
  },
  celebratory: {
    container: "border-2 border-gold-500/70 bg-obsidian-850",
    eyebrow: "text-gold-400",
    description: "text-parchment-200",
  },
};

interface StatusPageProps {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  actions: ReactNode;
  contactNote?: ReactNode;
  tone?: StatusPageTone;
}

/**
 * Shared shell for one-off confirmation/error pages (subscribe success, cancelled,
 * checkout error, and the app-level error boundary) — a centered card with an
 * eyebrow label, heading, message, optional contact line and action buttons.
 */
export function StatusPage({ eyebrow, title, description, actions, contactNote, tone = "neutral" }: StatusPageProps) {
  const toneClasses = TONE_CLASSES[tone];

  return (
    <main className="grow flex items-center justify-center bg-obsidian-950 fine-grid py-24 px-6">
      <div className={`max-w-lg w-full text-center space-y-6 p-10 sm:p-14 rounded-sm ${toneClasses.container}`}>
        <span className={`font-mono text-[10px] tracking-technical uppercase block font-semibold ${toneClasses.eyebrow}`}>
          {eyebrow}
        </span>
        <h1 className="font-serif-monument text-3xl sm:text-4xl text-parchment-50 uppercase tracking-tight">
          {title}
        </h1>
        <p className={`font-serif-monument text-base leading-relaxed ${toneClasses.description}`}>{description}</p>
        {contactNote ? <p className="font-mono text-xs text-parchment-dim">{contactNote}</p> : null}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">{actions}</div>
      </div>
    </main>
  );
}
