"use client";

import { useEffect, useRef } from "react";
import { readLogoMaterial, subscribeLogoMaterial } from "@/components/brand/logo-material";
import { MARK_RIGHT_PATH } from "@/components/brand/mark-geometry";
import { MARK_TEXTURE } from "@/components/brand/mark-texture";
import { SEAM_FRAME } from "@/components/three/scenes/seam/config";

/*
 * The chrome of the line drawing's built half, painted into a <canvas> by
 * script instead of an SVG <image>.
 *
 * Why a canvas: the texture is a large image, and an <image> (or a CSS
 * background) that big becomes the Largest Contentful Paint candidate the
 * moment it fades in, ahead of the headline. A canvas is never an LCP
 * candidate, so the headline stays the LCP. The drawing is decoration under
 * the ink lines, and the poster or the 3D scene replaces it anyway.
 *
 * Why script: the texture is only fetched when it is actually wanted. Nothing
 * is preloaded, a saved "classic" choice never requests it (it is fetched if
 * the visitor switches to chrome later), and reduced motion (which shows the
 * poster instead of this drawing) skips it too.
 *
 * The paint waits until ~0.7s after navigation start, when the rings have
 * drawn on (hero.css), then fades in. Before that, and without JS, the drawing
 * is just the ink lines.
 */

const { x, y, width, height } = SEAM_FRAME;
/** Paint no earlier than this (ms since navigation start): the draw-on is ~1s. */
const PAINT_AFTER_MS = 700;

export function MarkChromeCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let started = false;
    let cancelled = false;
    let timer = 0;

    const paint = (image: HTMLImageElement) => {
      const context = canvas.getContext("2d");
      if (!context || cancelled) return;
      // Frame units to canvas pixels; one unit is about one CSS pixel at the largest size.
      const scale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, -x * scale, -y * scale);
      context.clip(new Path2D(MARK_RIGHT_PATH), "evenodd");
      context.drawImage(image, MARK_TEXTURE.x, MARK_TEXTURE.y, MARK_TEXTURE.width, MARK_TEXTURE.height);
      canvas.dataset.drawn = "true";
    };

    const start = () => {
      if (started || reduce.matches || readLogoMaterial() !== "chrome") return;
      started = true;
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        const wait = Math.max(0, PAINT_AFTER_MS - performance.now());
        timer = window.setTimeout(() => paint(image), wait);
      };
      // On failure the drawing simply stays the ink lines.
      image.src = MARK_TEXTURE.src;
    };

    start();
    const unsubscribe = subscribeLogoMaterial(start);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      data-material="chrome"
      className={className}
      width={Math.round(width)}
      height={Math.round(height)}
    />
  );
}
