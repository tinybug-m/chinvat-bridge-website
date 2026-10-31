"use client";

import { cn } from "@/lib/utils";
import { type Point, polyline, r, widening } from "./geometry";

/*
 * Nine Spears as a modernist poster: ink ground, a saffron sun, one hard
 * diagonal and big type. Today the diagonal is a single hairline and the
 * headline says it is a razor's edge; built, nine heavy bars fan out along
 * it (the centre one cerulean) and the headline turns to "Nine spears
 * wide." A ruler at the foot counts the spears as they land.
 *
 * Flat SVG, 1600 x 900, cropped like object-cover; type and ruler stay in
 * the middle 1160 x 800.
 */

const PAPER = "#f6f4ef";
const INK = "#0b1a26";
const SAFFRON = "#cf9c48";
const AZURE = "#1c8ec3";

const FROM: Point = [100, 700];
const TO: Point = [1500, 130];
const length = Math.hypot(TO[0] - FROM[0], TO[1] - FROM[1]);
const along: Point = [(TO[0] - FROM[0]) / length, (TO[1] - FROM[1]) / length];
const normal: Point = [along[1], -along[0]];
const GAP = 24;

function bar(offset: number, thick: number) {
  const corner = (t: number, side: number): Point => [
    FROM[0] + along[0] * t * length + normal[0] * (offset + (side * thick) / 2),
    FROM[1] + along[1] * t * length + normal[1] * (offset + (side * thick) / 2),
  ];
  return polyline([corner(0, -1), corner(1, -1), corner(1, 1), corner(0, 1)], true);
}

export function Poster({ built, className }: { built: number; className?: string }) {
  const spears = widening(built);
  const landed = spears.filter(({ p }) => p > 0.5).length;
  const wide = built >= 0.5;

  return (
    <div className={cn("relative size-full overflow-hidden", className)} style={{ background: INK }}>
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
        role="img"
        aria-label={`A poster: ${wide ? "nine bars fanned out along a diagonal, Nine spears wide" : "a single hairline on a diagonal, As narrow as a razor"}.`}
      >
        <rect width="1600" height="900" fill={INK} />
        <circle cx="1090" cy="330" r="250" fill={SAFFRON} />

        {/* Bars, outermost first so the centre lands on top. */}
        {[...spears]
          .sort((a, b) => Math.abs(b.rank) - Math.abs(a.rank))
          .map(({ rank, p }) => (
            <path
              key={rank}
              d={bar(rank * GAP * p, 2 + 16 * p)}
              fill={rank === 0 ? AZURE : PAPER}
              opacity={rank === 0 ? 1 : r(0.25 + 0.75 * p)}
            />
          ))}

        <g fill={PAPER}>
          <text x="240" y="140" className="font-label" fontSize="15" letterSpacing="5">
            CHINVAT BRIDGE
          </text>
          <text x="1360" y="140" textAnchor="end" className="font-label" fontSize="15" letterSpacing="5">
            N° 09
          </text>
          <text className="font-display" fontSize="118" fontWeight="600" letterSpacing="-3" style={{ fontStretch: "112%" }}>
            <tspan x="236" y="290">{wide ? "Nine spears" : "As narrow as"}</tspan>
            <tspan x="236" y="404" fill={wide ? AZURE : SAFFRON}>
              {wide ? "wide." : "a razor."}
            </tspan>
          </text>
        </g>

        {/* The ruler: one tick per spear, saffron once it has landed. */}
        <g transform="translate(240 806)">
          <path d="M0 0H1120" stroke={PAPER} strokeOpacity="0.5" />
          {spears.map(({ rank }, i) => (
            <g key={rank} transform={`translate(${r((i * 1120) / 8)} 0)`}>
              <path d="M0 -14V0" stroke={i < landed ? SAFFRON : PAPER} strokeWidth={i < landed ? 4 : 1.5} strokeOpacity={i < landed ? 1 : 0.5} />
              <text y="26" textAnchor="middle" fill={PAPER} fillOpacity="0.7" className="font-label" fontSize="12">
                {i + 1}
              </text>
            </g>
          ))}
          <text x="1120" y="-26" textAnchor="end" fill={PAPER} fillOpacity="0.7" className="font-label" fontSize="12" letterSpacing="3">
            {landed} / 9 SPEARS
          </text>
        </g>
      </svg>
    </div>
  );
}
