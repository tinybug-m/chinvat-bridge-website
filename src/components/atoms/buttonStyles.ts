export type ButtonVariant = "solid" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  solid:
    "bg-linear-to-r from-gold-600 via-gold-500 to-gold-400 text-obsidian-950 border border-gold-300/40 hover:brightness-110 shadow-md shadow-gold-500/10",
  outline:
    "border border-stone-borderLight bg-obsidian-850/80 text-parchment-200 hover:border-gold-500/70 hover:text-gold-300",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-5 py-2.5 text-[11px] gap-2",
  md: "px-6 py-3.5 text-xs gap-2.5",
  lg: "px-8 py-4 text-xs gap-2",
};

export function buttonClassName(variant: ButtonVariant, size: ButtonSize, className = ""): string {
  return `inline-flex items-center justify-center font-mono font-semibold tracking-monumental uppercase rounded-sm transition-all disabled:opacity-60 disabled:pointer-events-none ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`;
}
