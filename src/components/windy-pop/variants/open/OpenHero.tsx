"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { DuoHero, type DuoHeroContent } from "../duo/DuoHero";
import styles from "./open.module.css";

/*
 * Variation F, "Open": variation D's hero (DuoHero, untouched) without its window box, on the main
 * hero's dotted orbits. The box's frame, crop marks and captions are hidden from here (CSS on the
 * window's data attributes); its ground line stays under the dog's feet. With no box to cross, the
 * dog turns from ink to colour where it enters the page's container, as it does at contact.
 *
 * The orbits are CrossingHero's, in its own chart coordinates (viewBox 0 -34 540 934, centred on
 * x 320, y 405), placed so that centre sits where it does on the main hero: at the container's
 * left edge, on the line under the headline. Faint over the copy, strongest on the dog's side.
 */
export function OpenHero({ content }: { content: DuoHeroContent }) {
  const root = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);

  // The dog is in colour inside the page's container (before DuoDog first measures).
  useLayoutEffect(() => {
    const container = root.current?.querySelector<HTMLElement>("section[data-hero] > div");
    if (!container) return;
    container.dataset.duoColour = "";
    return () => {
      delete container.dataset.duoColour;
    };
  }, []);

  // Where the orbits' centre goes: the container's content edge, on the line under the headline.
  useEffect(() => {
    const wrap = root.current;
    const container = wrap?.querySelector<HTMLElement>("section[data-hero] > div");
    const head = wrap?.querySelector<HTMLElement>("#hero-title")?.parentElement;
    if (!wrap || !container || !head) return;
    const measure = () => {
      const w = wrap.getBoundingClientRect();
      const c = container.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(container).paddingLeft) || 0;
      const h = head.getBoundingClientRect();
      setAt({ x: Math.round(c.left - w.left + pad), y: Math.round(h.bottom - w.top) });
    };
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(wrap);
    watch.observe(head);
    return () => watch.disconnect();
  }, []);

  // The orbits rest while the hero is out of view (the dog's stages are drawing elsewhere).
  const [seen, setSeen] = useState(true);
  useEffect(() => {
    const wrap = root.current;
    if (!wrap) return;
    const watch = new IntersectionObserver(([entry]) => setSeen(entry.isIntersecting));
    watch.observe(wrap);
    return () => watch.disconnect();
  }, []);

  return (
    <div ref={root} className={styles.wrap} data-paused={seen ? undefined : ""} style={at ? ({ "--ox": `${at.x}px`, "--oy": `${at.y}px` } as CSSProperties) : undefined}>
      {at ? <Orbits /> : null}
      <DuoHero content={content} />
    </div>
  );
}

/* CrossingHero's orbits (copied: they are not exported there). */
const CX = 320;
const WAIST_Y = 405;
const ORBITS = [430, 560, 700, 850, 1010, 1180, 1360, 1550];
const POINTS = [
  { ring: 0, period: 34, at: 0.35, color: "var(--color-saffron-500)" },
  { ring: 1, period: 40, at: 0.62, color: "var(--color-azure-400)" },
  { ring: 2, period: 48, at: 0.1, color: "var(--color-ink)" },
  { ring: 3, period: 56, at: 0.6, color: "var(--color-saffron-500)" },
  { ring: 3, period: 56, at: 0.15, color: "var(--color-ink)" },
  { ring: 4, period: 64, at: 0.62, color: "var(--color-azure-400)" },
  { ring: 4, period: 64, at: 0.2, color: "var(--color-saffron-500)" },
  { ring: 5, period: 72, at: 0.28, color: "var(--color-saffron-500)" },
  { ring: 5, period: 72, at: 0.78, color: "var(--color-azure-400)" },
  { ring: 6, period: 80, at: 0.66, color: "var(--color-ink)" },
  { ring: 6, period: 80, at: 0.12, color: "var(--color-azure-400)" },
  { ring: 7, period: 88, at: 0.45, color: "var(--color-saffron-500)" },
  { ring: 7, period: 88, at: 0.9, color: "var(--color-azure-400)" },
] as const;

function Orbits() {
  return (
    <svg viewBox="0 -34 540 934" aria-hidden="true" className={styles.orbits}>
      <defs>
        <linearGradient id="of-fade-y" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="-34" y2="900">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.16" stopColor="#fff" />
          <stop offset="0.84" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="of-fade-x" gradientUnits="userSpaceOnUse" x1="560" x2="1250" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <mask id="of-orbits-y" maskUnits="userSpaceOnUse" x="-2000" y="-34" width="6000" height="934">
          <rect x="-2000" y="-34" width="6000" height="934" fill="url(#of-fade-y)" />
        </mask>
        <mask id="of-orbits-x" maskUnits="userSpaceOnUse" x="-2000" y="-34" width="6000" height="934">
          <rect x="-2000" y="-34" width="6000" height="934" fill="url(#of-fade-x)" />
        </mask>
      </defs>
      <g className={styles.in} mask="url(#of-orbits-y)">
        <g mask="url(#of-orbits-x)">
          {ORBITS.map((r, i) => (
            <circle key={r} cx={CX} cy={WAIST_Y} r={r} fill="none" stroke="var(--color-ink)" strokeOpacity={0.4 + i * 0.03} strokeWidth={1.5} strokeDasharray="3 5" />
          ))}
          {POINTS.map((point, i) => {
            const r = ORBITS[point.ring];
            return (
              <g
                key={i}
                className={styles.point}
                data-crossed={point.at >= 0.5 ? "" : undefined}
                style={{ "--period": `${point.period}s`, "--at": `${-point.at * point.period}s`, "--rest": `${(point.at - 0.5) * 150}deg` } as CSSProperties}
              >
                <circle className={styles.open} cx={CX + r} cy={WAIST_Y} r={6} fill="none" stroke="var(--color-ink)" strokeOpacity={0.6} strokeWidth={1.4} />
                <g className={styles.solid} fill={point.color}>
                  <circle cx={CX + r} cy={WAIST_Y} r={14} fillOpacity={0.14} />
                  <circle cx={CX + r} cy={WAIST_Y} r={5.5} />
                </g>
              </g>
            );
          })}
        </g>
      </g>
    </svg>
  );
}
