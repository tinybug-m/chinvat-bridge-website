import type { ReactNode } from "react";

/**
 * Wraps routes that still use the original dark design. The new design owns
 * <body>, so the old body styling and font variables live on this wrapper
 * until each route is migrated. Callers pass the font variables: the route
 * group preloads them, the 404 and error boundaries (part of every route's
 * graph) use non-preloading copies so the homepage never fetches old fonts.
 */
export function LegacyFrame({ fonts, children }: { fonts: string; children: ReactNode }) {
  return (
    <div
      data-theme="legacy"
      className={`${fonts} flex min-h-dvh grow flex-col bg-obsidian-950 text-parchment-200 font-sans selection:bg-gold-500 selection:text-obsidian-950`}
    >
      {children}
    </div>
  );
}
