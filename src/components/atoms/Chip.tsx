interface ChipProps {
  children: string;
  emphasized?: boolean;
}

export function Chip({ children, emphasized = false }: ChipProps) {
  return (
    <span
      className={`px-2 py-0.5 bg-obsidian-950/80 border border-stone-border text-[9px] font-mono ${
        emphasized ? "text-gold-400/90" : "text-parchment-dim"
      }`}
    >
      {children}
    </span>
  );
}
