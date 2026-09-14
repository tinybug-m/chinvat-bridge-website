import type { ReactNode } from "react";

interface BayProps {
  numeral: string;
  title: string;
  meta?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

/** A bordered panel with a Roman-numeral architrave header — the repeating "bay" pattern in the dashboard. */
export function Bay({ numeral, title, meta, footer, children }: BayProps) {
  return (
    <div className="border border-stone-border bg-obsidian-900">
      <div className="px-6 py-4 border-b border-stone-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-cinzel text-gold-500 text-sm">{numeral}</span>
          <h2 className="font-serif-monument text-lg text-parchment-50 uppercase tracking-wide">{title}</h2>
        </div>
        {meta}
      </div>
      <div>{children}</div>
      {footer ? (
        <div className="px-6 py-2.5 bg-obsidian-950 border-t border-stone-border flex flex-wrap justify-between items-center gap-2 font-mono text-[10px] text-parchment-dim uppercase tracking-technical">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
