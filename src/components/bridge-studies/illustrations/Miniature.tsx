"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import { type Point, mix, quad, r, random, smooth, widening } from "./geometry";

/*
 * Nine Spears as a Persian manuscript illumination. A lapis night sky with
 * gold stars and a rayed sun, two massifs of the lobed, striated rock that
 * miniature painters use for mountains, cloud scrolls in the abyss and a
 * band of gold waves at its floor. The bridge is the story's: a single gold
 * hairline (the razor's edge) that opens into nine gilded spears, heads
 * toward the far peak, laid on a strip of night.
 *
 * Flat SVG, drawn at 1600 x 900 and cropped like object-cover; everything
 * that matters sits inside the middle 1200 x 800, so phones (4:3) and wide
 * stages (2:1) both keep it. The frame is CSS, so it always fits the stage.
 */

const A: Point = [430, 456];
const C: Point = [800, 318];
const B: Point = [1170, 368];
const GAP = 7.2;

const INK = "#0b1a26";
const BROWN = "#7a4e12";
const GOLD = "#ebc26b";
const ROCKS = ["#ebc26b", "#f2e8c4", "#d9a85a", "#fbf3dd", "#cf9c48"];

interface Rock {
  d: string;
  fill: string;
  lines: string[];
}

/** A massif of lobed rocks, rows from the summit down; `lean` pushes the summit toward the gap. */
function massif(cx: number, top: number, width: number, rows: number, lean: number, seed: number): Rock[] {
  const rand = random(seed);
  const rowHeight = 92;
  const rocks: Rock[] = [];
  for (let row = 0; row < rows; row++) {
    const count = 1 + row;
    const rowWidth = width * (0.26 + (0.74 * row) / (rows - 1));
    const centre = cx + ((rows - 1 - row) / (rows - 1)) * lean;
    const base = top + (row + 1) * rowHeight;
    for (let k = 0; k < count; k++) {
      const x = centre - rowWidth / 2 + ((k + 0.5) * rowWidth) / count + (rand() - 0.5) * 18;
      const w = (rowWidth / count) * (1.15 + rand() * 0.25);
      const h = rowHeight * (1.75 + rand() * 0.4);
      const tilt = (rand() - 0.5) * w * 0.4 + lean * 0.12;
      const l = x - w / 2;
      const rr = x + w / 2;
      const t = base - h;
      rocks.push({
        d:
          `M${r(l)} ${r(base)}C${r(l)} ${r(base - h * 0.72)} ${r(x - w * 0.34 + tilt)} ${r(t)} ${r(x + tilt)} ${r(t)}` +
          `C${r(x + w * 0.34 + tilt)} ${r(t)} ${r(rr)} ${r(base - h * 0.72)} ${r(rr)} ${r(base)}Z`,
        fill: ROCKS[Math.floor(rand() * ROCKS.length)],
        // Striations following the rock's left flank, as miniature rocks are modelled.
        lines: [0.18, 0.34].map(
          (f) =>
            `M${r(l + w * f)} ${r(base)}Q${r(l + w * (f - 0.06))} ${r(base - h * 0.5)} ${r(x - w * (0.3 - f) + tilt)} ${r(t + h * (0.14 + f * 0.3))}`,
        ),
      });
    }
  }
  return rocks;
}

const LEFT = massif(250, 470, 620, 6, 110, 11);
const RIGHT = massif(1340, 380, 620, 7, -110, 23);

const STARS = (() => {
  const rand = random(7);
  return Array.from({ length: 110 }, () => ({ x: r(rand() * 1600), y: r(rand() * 560), size: r(0.7 + rand() * 1.8), big: rand() > 0.9 }));
})();

/** Cloud scroll: three bumps along the top, a flat belly and a curl at the tail. */
function cloud(x: number, y: number, s: number) {
  return (
    `M${x} ${y}a${s} ${s} 0 0 1 ${1.6 * s} ${-0.6 * s}a${1.1 * s} ${1.1 * s} 0 0 1 ${2 * s} ${0.2 * s}` +
    `a${0.8 * s} ${0.8 * s} 0 0 1 ${1.4 * s} ${0.6 * s}q${-2.5 * s} ${0.55 * s} ${-5 * s} 0` +
    `a${0.32 * s} ${0.32 * s} 0 1 1 ${0.45 * s} ${-0.5 * s}`
  );
}

function curve(dy: number) {
  return `M${A[0]} ${r(A[1] + dy)}Q${C[0]} ${r(C[1] + dy)} ${B[0]} ${r(B[1] + dy)}`;
}

/** A leaf-shaped spearhead at the far end, along the curve's end tangent. */
function head(dy: number) {
  const angle = Math.atan2(B[1] - C[1], B[0] - C[0]);
  const at = (x: number, y: number): string => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return `${r(B[0] + x * c - y * s)} ${r(B[1] + dy + x * s + y * c)}`;
  };
  return `M${at(-2, 0)}L${at(12, -5.5)}L${at(36, 0)}L${at(12, 5.5)}Z`;
}

export function Miniature({ built, className }: { built: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const spears = widening(built);
  const open = spears.reduce((sum, { p }) => sum + p, 0) / spears.length;
  const edge = (rank: number) => {
    const p = spears[rank + 4].p;
    return Array.from({ length: 33 }, (_, i) => quad([A[0], A[1] + rank * GAP * p], [C[0], C[1] + rank * GAP * p], [B[0], B[1] + rank * GAP * p], i / 32));
  };
  const band = [...edge(-4), ...edge(4).reverse()].map(([x, y], i) => `${i ? "L" : "M"}${r(x)} ${r(y)}`).join("") + "Z";
  const glint = 1 - smooth(built / 0.3);
  const mid = quad(A, C, B, 0.5);

  return (
    <div className={cn("relative size-full overflow-hidden bg-[#0b263c]", className)}>
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
        role="img"
        aria-label={`A Persian miniature: the bridge between two gold peaks under a night sky, ${Math.round(built * 100)}% of the way from a razor's edge to nine spears wide.`}
      >
        <defs>
          <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#061626" />
            <stop offset="0.55" stopColor="#0b263c" />
            <stop offset="1" stopColor="#0f3c5e" />
          </linearGradient>
          <radialGradient id={`${id}-sun`}>
            <stop offset="0" stopColor="#fff4d0" />
            <stop offset="0.6" stopColor={GOLD} />
            <stop offset="1" stopColor="#cf9c48" />
          </radialGradient>
          <pattern id={`${id}-waves`} width="56" height="28" patternUnits="userSpaceOnUse">
            <rect width="56" height="28" fill="#061626" />
            <path d="M0 28a28 28 0 0 1 56 0M9 28a19 19 0 0 1 38 0M18 28a10 10 0 0 1 20 0" fill="none" stroke={GOLD} strokeOpacity="0.55" strokeWidth="1.4" />
          </pattern>
        </defs>

        <rect width="1600" height="900" fill={`url(#${id}-sky)`} />
        {STARS.map((star, i) =>
          star.big ? (
            <path
              key={i}
              d={`M${star.x} ${r(star.y - star.size * 3)}L${r(star.x + star.size)} ${star.y}L${star.x} ${r(star.y + star.size * 3)}L${r(star.x - star.size)} ${star.y}Z`}
              fill={GOLD}
            />
          ) : (
            <circle key={i} cx={star.x} cy={star.y} r={star.size} fill={GOLD} opacity="0.8" />
          ),
        )}

        {/* The sun over the far peak: a gold disc with alternating rays. */}
        <g transform="translate(1180 168)">
          {Array.from({ length: 32 }, (_, i) => {
            const a = (i / 32) * Math.PI * 2;
            const long = i % 2 === 0;
            const inner = 64;
            const outer = long ? 104 : 84;
            const w = 0.05;
            return (
              <path
                key={i}
                d={`M${r(inner * Math.cos(a - w))} ${r(inner * Math.sin(a - w))}L${r(outer * Math.cos(a))} ${r(outer * Math.sin(a))}L${r(inner * Math.cos(a + w))} ${r(inner * Math.sin(a + w))}Z`}
                fill={long ? GOLD : "#cf9c48"}
              />
            );
          })}
          <circle r="58" fill={`url(#${id}-sun)`} stroke={BROWN} strokeWidth="2" />
          <circle r="44" fill="none" stroke={BROWN} strokeOpacity="0.5" strokeWidth="1.2" />
        </g>

        {/* The abyss: cloud scrolls drifting between the peaks, gold waves at the floor. */}
        <rect x="0" y="760" width="1600" height="140" fill={`url(#${id}-waves)`} />
        {[
          [560, 560, 34],
          [880, 640, 28],
          [690, 720, 22],
          [1010, 520, 20],
        ].map(([x, y, s], i) => (
          <path key={i} d={cloud(x, y, s)} fill="#123f63" stroke={GOLD} strokeOpacity="0.7" strokeWidth="1.6" strokeLinejoin="round" />
        ))}

        {[LEFT, RIGHT].map((rocks, m) => (
          <g key={m} stroke={BROWN} strokeWidth="1.6" strokeLinejoin="round">
            {rocks.map((rock, i) => (
              <g key={i}>
                <path d={rock.d} fill={rock.fill} />
                {rock.lines.map((line, j) => (
                  <path key={j} d={line} fill="none" strokeOpacity="0.5" strokeWidth="1.2" />
                ))}
              </g>
            ))}
          </g>
        ))}

        {/* The bridge: a strip of night under the spears as they open, then the nine gilded spears. */}
        <path d={band} fill="#061626" opacity={r(0.9 * open)} />
        {spears.map(({ rank, p }) => {
          const dy = rank * GAP * p;
          return (
            <g key={rank}>
              <path d={curve(dy)} fill="none" stroke={BROWN} strokeWidth="5.5" strokeLinecap="round" />
              <path d={curve(dy)} fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round" />
              <path d={head(dy)} fill={GOLD} stroke={BROWN} strokeWidth="1.4" />
              <circle cx={A[0]} cy={r(A[1] + dy)} r="4" fill={GOLD} stroke={BROWN} strokeWidth="1.2" />
            </g>
          );
        })}
        {/* The razor's glint, only while the bridge is still an edge. */}
        {glint > 0.01 ? (
          <path
            d={`M${r(mid[0])} ${r(mid[1] - 26)}L${r(mid[0] + 4)} ${r(mid[1] - 4)}L${r(mid[0] + 26)} ${r(mid[1])}L${r(mid[0] + 4)} ${r(mid[1] + 4)}L${r(mid[0])} ${r(mid[1] + 26)}L${r(mid[0] - 4)} ${r(mid[1] + 4)}L${r(mid[0] - 26)} ${r(mid[1])}L${r(mid[0] - 4)} ${r(mid[1] - 4)}Z`}
            fill="#fff8e6"
            opacity={r(glint)}
          />
        ) : null}

        {/* Cartouche, as a painting's title panel. */}
        <g transform="translate(800 132)">
          <rect x="-250" y="-30" width="500" height="60" rx="30" fill="#f2e8c4" stroke={GOLD} strokeWidth="3" />
          <rect x="-242" y="-22" width="484" height="44" rx="22" fill="none" stroke={BROWN} strokeOpacity="0.6" strokeWidth="1" />
          <text textAnchor="middle" y="6" fill={INK} className="font-label" fontSize="16" letterSpacing="4">
            {built < 0.5 ? "AS NARROW AS A RAZOR’S EDGE" : "NINE SPEARS’ LENGTH WIDE"}
          </text>
          <text textAnchor="middle" y="58" fill={GOLD} fillOpacity={r(mix(0.55, 0.95, open))} className="font-label" fontSize="12" letterSpacing="6">
            CHINVAT · THE BRIDGE OF THE SEPARATOR
          </text>
        </g>
      </svg>
      <div aria-hidden="true" className="pointer-events-none absolute inset-2 border-2 border-saffron-500 sm:inset-3" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-3.5 border border-saffron-300/50 sm:inset-5" />
    </div>
  );
}
