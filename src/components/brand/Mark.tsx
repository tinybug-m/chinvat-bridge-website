import { useId } from "react";
import { cn } from "@/lib/utils";
import { MARK_LEFT_PATH, MARK_RIGHT_PATH } from "./mark-geometry";

/**
 * - glass: ink drawing on the left, the material half on the right (primary, on light grounds)
 * - duo: flat ink and cerulean, for small sizes and favicons
 * - ink / paper: single colour, for print-like uses and dark grounds
 */
export type MarkVariant = "glass" | "duo" | "ink" | "paper";

const VIEWBOX = "318 325 615 598";

const FLAT_FILLS: Record<Exclude<MarkVariant, "glass">, [string, string]> = {
  duo: ["var(--color-ink)", "var(--color-cobalt-700)"],
  ink: ["var(--color-ink)", "var(--color-ink)"],
  paper: ["var(--color-paper)", "var(--color-paper)"],
};

interface MarkProps {
  variant?: MarkVariant;
  className?: string;
  /** Accessible name; omit when the mark sits next to visible brand text. */
  title?: string;
}

export function Mark({ variant = "glass", className, title }: MarkProps) {
  const gradientId = useId();
  const [left, right] =
    variant === "glass" ? ["var(--color-ink)", `url(#${gradientId})`] : FLAT_FILLS[variant];

  return (
    <svg
      viewBox={VIEWBOX}
      className={cn("block h-auto", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {variant === "glass" ? (
        // A static stand-in for the 3D glass: deep cerulean body, azure sheen, saffron light.
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="640" y1="340" x2="900" y2="900">
          <stop offset="0" stopColor="#0b263c" />
          <stop offset="0.22" stopColor="#0f557d" />
          <stop offset="0.36" stopColor="#1c8ec3" />
          <stop offset="0.46" stopColor="#ebc26b" />
          <stop offset="0.55" stopColor="#be8c3f" />
          <stop offset="0.68" stopColor="#0f557d" />
          <stop offset="0.86" stopColor="#0b263c" />
          <stop offset="1" stopColor="#1d75a3" />
        </linearGradient>
      ) : null}
      <path d={MARK_LEFT_PATH} fill={left} fillRule="evenodd" />
      <path d={MARK_RIGHT_PATH} fill={right} fillRule="evenodd" />
    </svg>
  );
}
