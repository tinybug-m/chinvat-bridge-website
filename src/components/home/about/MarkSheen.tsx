"use client";

import { type ReactNode, useEffect, useRef } from "react";

/*
 * The About mark's one-time sheen: once the mark is on screen and the wipe has
 * revealed the chrome, a translucent white band (the Mark's [data-sheen] rect,
 * clipped to the chrome half) crosses it once, slowly. The resting state is the
 * plain texture (the band is invisible), so reduced motion and no JS show the
 * static chrome. Wide screens and full motion only. Web Animations on a
 * transform: no filter, no loop.
 */

/** Reveal delay of the figure (160) + rise (--motion-slow) + 600 into the wipe. */
const START_DELAY = 160 + 600 + 600;
const DURATION = 2200;
const TRAVEL = 700;

export function MarkSheen({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    const band = element?.querySelector<SVGRectElement>("[data-sheen]");
    if (!element || !band) return;
    if (!window.matchMedia("(min-width: 64rem) and (prefers-reduced-motion: no-preference)").matches) return;

    let timer = 0;
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        timer = window.setTimeout(() => {
          animation = band.animate(
            [
              { transform: "translateX(0px) skewX(-14deg)", opacity: 0 },
              { opacity: 1, offset: 0.2 },
              { opacity: 1, offset: 0.8 },
              { transform: `translateX(${TRAVEL}px) skewX(-14deg)`, opacity: 0 },
            ],
            { duration: DURATION, easing: "cubic-bezier(0.45, 0, 0.25, 1)" },
          );
        }, START_DELAY);
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      animation?.cancel();
    };
  }, []);

  return <div ref={root}>{children}</div>;
}
