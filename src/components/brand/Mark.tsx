import { useId } from "react";
import { preload } from "react-dom";
import { cn } from "@/lib/utils";
import "./logo-material.css";
import { MarkClassicGradient } from "./mark-classic";
import { MARK_LEFT_PATH, MARK_RIGHT_PATH } from "./mark-geometry";
import { MARK_TEXTURE } from "./mark-texture";

/**
 * - glass: ink drawing on the left, the material half on the right (primary, on light grounds)
 * - glass-paper: the same, with the flat half in paper, for dark grounds
 * - duo: flat ink and cerulean, for small sizes and favicons
 * - ink / paper: single colour, for print-like uses and dark grounds
 */
export type MarkVariant = "glass" | "glass-paper" | "duo" | "ink" | "paper";

const VIEWBOX = "318 325 615 598";

const FLAT_FILLS: Record<Exclude<MarkVariant, "glass" | "glass-paper">, [string, string]> = {
  duo: ["var(--color-ink)", "var(--color-cobalt-700)"],
  ink: ["var(--color-ink)", "var(--color-ink)"],
  paper: ["var(--color-paper)", "var(--color-paper)"],
};

interface MarkProps {
  variant?: MarkVariant;
  className?: string;
  /** Accessible name; omit when the mark sits next to visible brand text. */
  title?: string;
  /** "sm" (header, lockups) loads the 128px texture; "lg" the full 309px one. */
  size?: "sm" | "lg";
  /** Preload the texture: set where the mark is above the fold. */
  priority?: boolean;
  /** Adds the (hidden) specular band that MarkSheen sweeps once. */
  sheen?: boolean;
}

/**
 * Glass variants render both materials, chrome and the classic gradient; the
 * visitor's choice (<html data-logo-material>) shows one.
 */
export function Mark({ variant = "glass", className, title, size = "lg", priority = false, sheen = false }: MarkProps) {
  const uid = useId();
  const clipId = `${uid}-clip`;
  const bandId = `${uid}-band`;
  const classicId = `${uid}-classic`;
  const isGlass = variant === "glass" || variant === "glass-paper";
  const [left, right] = isGlass
    ? [variant === "glass-paper" ? "var(--color-paper)" : "var(--color-ink)", "none"]
    : FLAT_FILLS[variant];
  const src = size === "sm" ? MARK_TEXTURE.smSrc : MARK_TEXTURE.src;
  if (isGlass && priority) preload(src, { as: "image", fetchPriority: "high" });

  return (
    <svg
      viewBox={VIEWBOX}
      className={cn("block h-auto", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path data-part="left" d={MARK_LEFT_PATH} fill={left} fillRule="evenodd" />
      {isGlass ? (
        <>
          <clipPath id={clipId}>
            <path d={MARK_RIGHT_PATH} clipRule="evenodd" />
          </clipPath>
          {/* Outer group carries the CSS wipe (a clip-path there would replace a clipPath attribute on the same element), inner group the shape clip. */}
          <g data-part="right">
            {/* Both materials are server-rendered; <html data-logo-material> picks one (logo-material.css). */}
            <g data-material="chrome" clipPath={`url(#${clipId})`}>
              {/* The real liquid-chrome pixels from the brand photo. */}
              <image
                href={src}
                x={MARK_TEXTURE.x}
                y={MARK_TEXTURE.y}
                width={MARK_TEXTURE.width}
                height={MARK_TEXTURE.height}
                preserveAspectRatio="none"
              />
            </g>
            <g data-material="classic">
              <MarkClassicGradient id={classicId} />
              <path d={MARK_RIGHT_PATH} fill={`url(#${classicId})`} fillRule="evenodd" />
            </g>
          </g>
          {sheen ? (
            <g clipPath={`url(#${clipId})`}>
                <linearGradient id={bandId} gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#fff" stopOpacity="0" />
                  <stop offset="0.5" stopColor="#fff" stopOpacity="0.38" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <rect
                  data-sheen=""
                  x={MARK_TEXTURE.x - 190}
                  y={MARK_TEXTURE.y - 40}
                  width="150"
                  height={MARK_TEXTURE.height + 80}
                  fill={`url(#${bandId})`}
                  opacity="0"
                  transform="skewX(-14)"
                />
            </g>
          ) : null}
          {variant === "glass" ? (
            <path d={MARK_RIGHT_PATH} fill={right} fillRule="evenodd" stroke="var(--color-ink)" strokeOpacity="0.45" strokeWidth="1.2" />
          ) : null}
        </>
      ) : (
        <path data-part="right" d={MARK_RIGHT_PATH} fill={right} fillRule="evenodd" />
      )}
    </svg>
  );
}
