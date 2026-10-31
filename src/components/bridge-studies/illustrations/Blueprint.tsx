"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import { KNIFE, type Point, mix, polyline, r, smooth, widening } from "./geometry";

/*
 * Nine Spears as a cyanotype general arrangement: white linework on cobalt,
 * on a drafting grid. Elevation across the top (plinths hatched, span and
 * rise dimensioned, section mark at mid-span), section A–A and the plan
 * below, a title block in the corner. The section is where the story
 * happens: one blade on its edge (the razor) opening into nine knife
 * sections side by side, its overall width dimension counting up from
 * 120 to 3 200. Saffron is kept for the two notes that quote the story.
 *
 * Drawn at 1600 x 900, cropped like object-cover; the sheet sits inside the
 * middle 1180 x 800.
 */

const LINE = "#e8f1f8";
const FAINT = "rgba(232,241,248,0.55)";
const SAFFRON = "#ebc26b";

/** The deck's rising profile in elevation, left plinth to right plinth. */
const ELEVATION = { x0: 350, x1: 1250, y0: 384, rise: 132 };
const profile = (u: number) => ELEVATION.y0 - ELEVATION.rise * (0.6 * u + 0.4 * u * u * (3 - 2 * u));

/** Section: 1 m = 120 px; blades 340 wide and 120 thick (drawn to read, the knife exaggerated). */
const SECTION = { cx: 470, cy: 668, scale: 120, width: 0.34, thick: 0.12, pitch: 0.3575 };

/** Plan: length 600 px; across, 1 m = 20 px. */
const PLAN = { x0: 790, x1: 1330, cy: 568, scale: 20 };

const mm = (metres: number) => {
  const value = Math.round((metres * 1000) / 10) * 10;
  return value >= 1000 ? `${Math.floor(value / 1000)} ${String(value % 1000).padStart(3, "0")}` : String(value);
};

function Dimension({ from, to, y, label, vertical = false }: { from: number; to: number; y: number; label: string; vertical?: boolean }) {
  // Architectural ticks (45° slashes) and the figure centred above the line.
  const tick = (at: number) => (vertical ? `M${y - 6} ${at + 6}L${y + 6} ${at - 6}` : `M${at - 6} ${y + 6}L${at + 6} ${y - 6}`);
  return (
    <g stroke={LINE} strokeWidth="1.2" fill="none">
      <path d={vertical ? `M${y} ${from}V${to}` : `M${from} ${y}H${to}`} />
      <path d={tick(from) + tick(to)} strokeWidth="1.6" />
      <text
        x={vertical ? y - 10 : (from + to) / 2}
        y={vertical ? (from + to) / 2 : y - 8}
        transform={vertical ? `rotate(-90 ${y - 10} ${(from + to) / 2})` : undefined}
        textAnchor="middle"
        fill={LINE}
        stroke="none"
        className="font-label"
        fontSize="13"
        letterSpacing="1"
      >
        {label}
      </text>
    </g>
  );
}

export function Blueprint({ built, className }: { built: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const spears = widening(built);
  const { cx, cy, scale, width, thick, pitch } = SECTION;

  // Section A–A: each knife section turned by its roll and moved out by its rank.
  const sections = spears.map(({ rank, p }) => {
    const roll = (Math.PI / 2) * (1 - p) * (rank % 2 ? -1 : 1);
    const z = rank * pitch * p;
    const points = KNIFE.map(([s, u]): Point => {
      const across = s * width * Math.cos(roll) - u * thick * Math.sin(roll);
      const up = s * width * Math.sin(roll) + u * thick * Math.cos(roll);
      return [cx + (z + across) * scale, cy - up * scale];
    });
    return points;
  });
  const xs = sections.flat().map(([x]) => x);
  const ys = sections.flat().map(([, y]) => y);
  const [left, right, top, bottom] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const open = smooth(built);

  const deckTop = Array.from({ length: 41 }, (_, i): Point => [mix(ELEVATION.x0, ELEVATION.x1, i / 40), profile(i / 40)]);
  const deckBottom = deckTop.map(([x, y]): Point => [x, y + 14]).reverse();
  const cutX = mix(ELEVATION.x0, ELEVATION.x1, 0.5);
  const cutY = profile(0.5);

  return (
    <div className={cn("relative size-full overflow-hidden bg-[#0f4470]", className)}>
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
        role="img"
        aria-label={`A blueprint of the bridge in elevation, section and plan; the section shows it ${Math.round(built * 100)}% of the way from one blade on its edge to nine blades side by side.`}
      >
        <defs>
          <radialGradient id={`${id}-sheet`} cx="0.5" cy="0.45" r="0.75">
            <stop offset="0" stopColor="#15558a" />
            <stop offset="1" stopColor="#0b2f50" />
          </radialGradient>
          <pattern id={`${id}-grid`} width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M0 0H100M0 20H100M0 40H100M0 60H100M0 80H100M0 0V100M20 0V100M40 0V100M60 0V100M80 0V100" stroke={LINE} strokeOpacity="0.06" />
            <path d="M0 0H100M0 0V100" stroke={LINE} strokeOpacity="0.14" />
          </pattern>
          <pattern id={`${id}-hatch`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <path d="M0 0V8" stroke={LINE} strokeOpacity="0.7" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="1600" height="900" fill={`url(#${id}-sheet)`} />
        <rect width="1600" height="900" fill={`url(#${id}-grid)`} />
        <rect x="210" y="50" width="1180" height="800" fill="none" stroke={LINE} strokeOpacity="0.7" strokeWidth="1.5" />
        <rect x="220" y="60" width="1160" height="780" fill="none" stroke={LINE} strokeOpacity="0.35" />

        {/* Elevation */}
        <g stroke={LINE} fill="none" strokeWidth="1.6" strokeLinejoin="round">
          <path d={polyline([...deckTop, ...deckBottom], true)} fill={`url(#${id}-hatch)`} fillOpacity="0.35" />
          <rect x="250" y={ELEVATION.y0} width="100" height="58" fill={`url(#${id}-hatch)`} />
          <rect x="1250" y={ELEVATION.y0 - ELEVATION.rise} width="100" height="58" fill={`url(#${id}-hatch)`} />
          {/* Spearheads at the far end, collars at the near. */}
          <path d={`M1250 ${r(profile(1) + 2)}l-34 -5v14z`} fill={SAFFRON} stroke={SAFFRON} />
          <path d={`M1180 ${r(profile(1) - 26)}H1250`} stroke={FAINT} strokeDasharray="14 4 2 4" />
          {/* Section mark */}
          <path d={`M${cutX} ${r(cutY - 60)}V${r(cutY + 74)}`} stroke={SAFFRON} strokeDasharray="16 5 3 5" />
          <path d={`M${cutX - 14} ${r(cutY - 60)}h14M${cutX - 14} ${r(cutY + 74)}h14`} stroke={SAFFRON} strokeWidth="2.4" />
        </g>
        <text x={cutX - 22} y={r(cutY - 66)} fill={SAFFRON} className="font-label" fontSize="15" textAnchor="end">A</text>
        <text x={cutX - 22} y={r(cutY + 92)} fill={SAFFRON} className="font-label" fontSize="15" textAnchor="end">A</text>
        <Dimension from={350} to={1250} y={470} label="SPAN 26 000" />
        <Dimension from={ELEVATION.y0 - ELEVATION.rise} to={ELEVATION.y0} y={1376} label="RISE 4 400" vertical />
        <text x="250" y="110" fill={LINE} className="font-label" fontSize="14" letterSpacing="3">ELEVATION  1:200</text>

        {/* Section A–A */}
        <path d={`M${cx} ${cy - 120}V${cy + 96}`} stroke={FAINT} strokeDasharray="16 5 3 5" />
        <g stroke={LINE} strokeWidth="1.6" strokeLinejoin="round">
          {sections.map((points, i) => (
            <path key={i} d={polyline(points, true)} fill={`url(#${id}-hatch)`} />
          ))}
        </g>
        <Dimension from={r(left)} to={r(right)} y={r(bottom + 42)} label={mm((right - left) / scale)} />
        <Dimension from={r(top)} to={r(bottom)} y={r(right + 34)} label={mm((bottom - top) / scale)} vertical />
        <text x="250" y="545" fill={LINE} className="font-label" fontSize="14" letterSpacing="3">SECTION A–A  1:20</text>

        {/* The note quoting the story, crossfading with the state. */}
        <g className="font-label" fontSize="13" letterSpacing="1.5" fill={SAFFRON}>
          <text x="250" y="818" opacity={r(1 - open)}>NOTE 1 · AS NARROW AS A RAZOR’S EDGE</text>
          <text x="250" y="818" opacity={r(open)}>NOTE 1 · NINE SPEARS’ LENGTH WIDE</text>
        </g>

        {/* Plan */}
        <g stroke={LINE} strokeWidth="1.3">
          <rect x={PLAN.x0 - 44} y={PLAN.cy - 40} width="44" height="80" fill={`url(#${id}-hatch)`} />
          <rect x={PLAN.x1} y={PLAN.cy - 40} width="44" height="80" fill={`url(#${id}-hatch)`} />
          {spears.map(({ rank, p }) => {
            const y = PLAN.cy + rank * pitch * PLAN.scale * p;
            const h = mix(thick, width, p) * PLAN.scale;
            return (
              <g key={rank}>
                <rect x={PLAN.x0} y={r(y - h / 2)} width={PLAN.x1 - PLAN.x0 - 26} height={r(h)} fill="none" />
                <path d={`M${PLAN.x1 - 26} ${r(y - h / 2)}L${PLAN.x1} ${r(y)}L${PLAN.x1 - 26} ${r(y + h / 2)}`} fill={SAFFRON} stroke={SAFFRON} strokeWidth="1" />
              </g>
            );
          })}
        </g>
        <text x={PLAN.x0 - 44} y="510" fill={LINE} className="font-label" fontSize="14" letterSpacing="3">PLAN  1:200</text>

        {/* Title block */}
        <g transform="translate(960 690)">
          <rect width="420" height="140" fill="#0b2f50" fillOpacity="0.6" stroke={LINE} strokeWidth="1.4" />
          <path d="M0 52H420M0 92H420M140 92V140M280 92V140" stroke={LINE} strokeOpacity="0.6" />
          <text x="16" y="34" fill={LINE} className="font-display" fontSize="24" fontWeight="600" letterSpacing="0.5">Chinvat Bridge</text>
          <text x="16" y="78" fill={LINE} className="font-label" fontSize="12" letterSpacing="2">NINE SPEARS · GENERAL ARRANGEMENT</text>
          <text x="16" y="122" fill={FAINT} className="font-label" fontSize="11" letterSpacing="1.5">DRG CB-009</text>
          <text x="156" y="122" fill={FAINT} className="font-label" fontSize="11" letterSpacing="1.5">SCALE AS NOTED</text>
          <text x="296" y="122" fill={SAFFRON} className="font-label" fontSize="11" letterSpacing="1.5">
            {built < 0.5 ? "REV A · TODAY" : "REV B · FUTURE"}
          </text>
        </g>
      </svg>
    </div>
  );
}
