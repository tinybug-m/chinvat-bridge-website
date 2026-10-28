import type { ReactNode } from "react";
import { legacyFontVariables } from "@/styles/legacy-fonts";

/**
 * Wraps routes that still use the original dark design. The new design owns
 * <body>, so the old body styling and font variables live on this wrapper
 * until each route is migrated.
 */
export function LegacyFrame({ children }: { children: ReactNode }) {
  return (
    <div
      data-theme="legacy"
      className={`${legacyFontVariables} flex min-h-dvh grow flex-col bg-obsidian-950 text-parchment-200 font-sans selection:bg-gold-500 selection:text-obsidian-950`}
    >
      {children}
    </div>
  );
}
