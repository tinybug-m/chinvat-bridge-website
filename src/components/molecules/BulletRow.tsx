import type { ReactNode } from "react";

type BulletGap = "sm" | "md" | "wrap";
type BulletColor = "gold" | "subtle";

const GAP_CLASSES: Record<BulletGap, string> = {
  sm: "gap-3",
  md: "gap-6",
  wrap: "gap-x-6 gap-y-2",
};

const BULLET_COLOR_CLASSES: Record<BulletColor, string> = {
  gold: "text-gold-500",
  subtle: "text-stone-border",
};

interface BulletRowProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  gap?: BulletGap;
  bulletColor?: BulletColor;
  className?: string;
}

/** Renders items inline, separated by a bullet — the "A • B • C" pattern used across the site. */
export function BulletRow<T>({
  items,
  renderItem,
  gap = "md",
  bulletColor = "gold",
  className = "",
}: BulletRowProps<T>) {
  const gapClass = GAP_CLASSES[gap];

  return (
    <div className={`flex flex-wrap items-center ${gapClass} ${className}`}>
      {items.map((item, index) => (
        <span key={index} className={`flex items-center ${gapClass}`}>
          {renderItem(item, index)}
          {index < items.length - 1 ? (
            <span aria-hidden="true" className={BULLET_COLOR_CLASSES[bulletColor]}>
              &bull;
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}
