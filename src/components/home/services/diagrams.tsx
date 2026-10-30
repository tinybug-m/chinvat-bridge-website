import type { CSSProperties, ReactNode } from "react";
import { drawProps } from "@/components/motion/draw";
import { cn } from "@/lib/utils";
import "./diagrams.css";
import "./loop-ai.css";
import "./loop-automation.css";
import "./loop-seo.css";
import "./loop-software.css";

/*
 * Four diagrams on a 400 x 300 board. Left of x = 200 is drawn (hairlines,
 * dashes, unfilled), right of it is built (solid ink, fills): the same
 * subject before and after. `svc-*` classes are animated by services.css.
 *
 * A group that carries per-node motion (grow, pop, draw) is `noclip`, so the
 * group wipe does not cut its children. Per-node delays below are in ms on the
 * plate clock: built 700, fill 1100, accent 1700 (the --svc-t-* tokens), and
 * every plate ends with its saffron accent.
 */

export const PAPER = "var(--color-paper)";
export const SAFFRON = "var(--color-saffron-500)";

interface GroupProps {
  /** Drop the wipe, for a group whose children move on their own. */
  noclip?: boolean;
  className?: string;
  children: ReactNode;
}

/** CSS custom properties on an SVG node. */
const vars = (v: Record<string, string | number>) => v as CSSProperties;

export function Drawn({ noclip, className, children }: GroupProps) {
  return (
    <g className={cn("svc-drawn text-control", noclip && "svc-noclip", className)} fill="none" stroke="currentColor" strokeWidth="1">
      {children}
    </g>
  );
}

export function Built({ noclip, className, children }: GroupProps) {
  return (
    <g className={cn("svc-built text-ink", noclip && "svc-noclip", className)} fill="none" stroke="currentColor" strokeWidth="1.5">
      {children}
    </g>
  );
}

export function Fill({ delay = 0, children }: { delay?: number; children: ReactNode }) {
  return (
    <g className="svc-fill" style={{ "--d": `${delay}ms` } as React.CSSProperties}>
      {children}
    </g>
  );
}

export const DASH = "4 4";

/* ---------------------------------------------------------------- AI */

/*
 * One composition, two states of the same nodes. The SVG is authored in its
 * END state (the settled graph), so reduced motion and no-JS show the
 * finished design; the loop (loop-ai.css) starts each node at its START
 * offset, scattered loose guesses, and morphs it into place.
 */
const GUESS = "2 5";

/** The settled graph: hub, then the ring of nodes around it. */
const AI_HUB: [number, number, number] = [230, 155, 18];
const AI_GRAPH: [number, number, number][] = [
  [136, 126, 7],
  [175, 59, 8],
  [274, 41, 7],
  [318, 116, 7],
  [308, 225, 8],
  [225, 280, 7],
  [144, 225, 7],
];
const AI_RIM: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 0],
];

/**
 * The loose guesses: where each starts (x, y, r) and where it lands, a graph
 * node index or "hub". Three guesses converge on the hub; only the first of
 * them becomes it, the other two merge in and fade.
 */
const AI_LOOSE: { at: [number, number, number]; to: number | "hub"; merge?: boolean }[] = [
  { at: [108, 152, 8], to: "hub" },
  { at: [46, 96, 7], to: 0 },
  { at: [181, 66, 5], to: 1 },
  { at: [368, 74, 6], to: 2 },
  { at: [285, 112, 6], to: 3 },
  { at: [342, 198, 7], to: 4 },
  { at: [269, 258, 5], to: 5 },
  { at: [160, 236, 5], to: 6 },
  { at: [34, 208, 6], to: "hub", merge: true },
  { at: [373, 148, 6], to: "hub", merge: true },
];
/** Dashed guesses between loose circles (indices into AI_LOOSE), drawn at the start positions. */
const AI_GUESSES: [number, number][] = [
  [1, 0],
  [0, 8],
  [7, 6],
  [4, 9],
  [5, 9],
  [2, 4],
];

export function AiDiagram() {
  const [hx, hy, hr] = AI_HUB;
  const target = (to: number | "hub") => (to === "hub" ? AI_HUB : AI_GRAPH[to]);
  return (
    <g className="ai-morph">
      <g className="text-line-strong" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray={GUESS}>
        {AI_GUESSES.map(([a, b]) => (
          <line
            key={`g${a}${b}`}
            className="ai-guess loop"
            x1={AI_LOOSE[a].at[0]}
            y1={AI_LOOSE[a].at[1]}
            x2={AI_LOOSE[b].at[0]}
            y2={AI_LOOSE[b].at[1]}
            opacity="0"
          />
        ))}
      </g>
      {/* Links of the settled graph: the rim fades in, the spokes grow out of the hub. */}
      <g className="text-ink" fill="none" stroke="currentColor">
        <g strokeWidth="1" opacity="0.55">
          {AI_RIM.map(([a, b], i) => (
            <path
              key={`r${a}${b}`}
              className="ai-rim loop"
              style={vars({ "--loop-d": `${i * 0.06}s` })}
              d={`M${AI_GRAPH[a][0]} ${AI_GRAPH[a][1]} L${AI_GRAPH[b][0]} ${AI_GRAPH[b][1]}`}
            />
          ))}
        </g>
        <g strokeWidth="1.5">
          {AI_GRAPH.map(([x, y], i) => (
            <path
              key={`s${x}${y}`}
              className="ai-spoke loop"
              // Grow from the hub end: the corner of the spoke's own box that the hub sits on.
              style={vars({ "--loop-d": `${i * 0.06}s`, "--o": `${x < hx ? 100 : 0}% ${y < hy ? 100 : 0}%` })}
              d={`M${hx} ${hy} L${x} ${y}`}
            />
          ))}
        </g>
      </g>
      {/* Each guess travels from its start to its node, its hairline face giving way to the solid one. */}
      {AI_LOOSE.map(({ at: [sx, sy, sr], to, merge }, i) => {
        const [ex, ey, er] = target(to);
        return (
          <g
            key={`n${sx}${sy}`}
            className="ai-travel loop"
            style={vars({ "--sx": `${sx - ex}px`, "--sy": `${sy - ey}px`, "--loop-d": `${(i % 4) * 0.08}s` })}
          >
            <circle
              className={cn(merge ? "ai-merge" : "ai-face-start", "loop text-control")}
              cx={ex}
              cy={ey}
              r={sr}
              fill={PAPER}
              stroke="currentColor"
              strokeWidth="1"
              opacity="0"
            />
            {merge ? null : (
              <circle
                className="ai-face-end loop text-ink"
                cx={ex}
                cy={ey}
                r={er}
                fill="currentColor"
              />
            )}
          </g>
        );
      })}
      <circle className="ai-ring loop" cx={hx} cy={hy} r={hr + 9} fill="none" stroke={SAFFRON} strokeWidth="1.5" />
    </g>
  );
}

/* -------------------------------------------------------- Automation */

const AUTO_ZIGZAG: [number, number][] = [
  [28, 236],
  [124, 214],
  [40, 184],
  [150, 166],
  [56, 128],
  [166, 104],
];
const AUTO_BOXES = [214, 274, 334];
/** When the pulse (diagrams.css, 1.4s from the accent time) reaches each box, in ms from the reveal. */
const AUTO_BOX_HIT = [1914, 2125, 2940];

export function AutomationDiagram() {
  return (
    <>
      <Drawn>
        <polyline points={[...AUTO_ZIGZAG, [200, 150]].map((p) => p.join(" ")).join(" ")} strokeDasharray={DASH} />
        {AUTO_ZIGZAG.map(([x, y]) => (
          <rect key={`${x}${y}`} x={x - 5} y={y - 5} width="10" height="10" fill={PAPER} />
        ))}
        <g className="text-line-strong" strokeDasharray={DASH}>
          <line x1="24" y1="272" x2="196" y2="272" />
          <line x1="24" y1="60" x2="196" y2="60" />
        </g>
      </Drawn>
      <Built>
        <path d="M200 150 H212 M210 145 L215 150 L210 155" />
        {AUTO_BOXES.slice(0, 2).map((x) => (
          <path key={x} d={`M${x + 36} 150 H${x + 58} M${x + 53} 145 L${x + 58} 150 L${x + 53} 155`} />
        ))}
        {AUTO_BOXES.map((x) => (
          <g key={`s${x}`} strokeWidth="1" opacity="0.55">
            <line x1={x + 18} y1="82" x2={x + 18} y2="132" />
            <line x1={x + 18} y1="168" x2={x + 18} y2="226" />
          </g>
        ))}
        {AUTO_BOXES.map((x) => (
          <rect key={`t${x}`} x={x + 11} y="68" width="14" height="14" fill={PAPER} strokeWidth="1.2" />
        ))}
      </Built>
      <Fill>
        <g className="text-ink" fill="currentColor" stroke="none">
          {AUTO_BOXES.map((x, i) => (
            <g
              key={`b${x}`}
              className="loop auto-box-loop"
              style={vars({ "--loop-d": `${i * 0.88}s` })}
            >
              <rect
                className="auto-box"
                style={vars({ "--pd": `${AUTO_BOX_HIT[i]}ms` })}
                x={x}
                y="132"
                width="36"
                height="36"
              />
            </g>
          ))}
          {AUTO_BOXES.map((x) => (
            <circle key={`d${x}`} cx={x + 18} cy="230" r="4" />
          ))}
        </g>
        <g stroke={PAPER} strokeWidth="1.5" fill="none">
          <circle cx="232" cy="150" r="4" />
          <path d="M283 145 H301 M283 155 H301" />
        </g>
      </Fill>
      {/* The ring lands as the pulse arrives. The wrapper carries the loop's pulse. */}
      <g className="loop auto-ring-loop">
        <circle
          className="pop"
          style={vars({ "--delay": "2800ms" })}
          cx="352"
          cy="150"
          r="8"
          fill="none"
          stroke={SAFFRON}
          strokeWidth="2"
        />
      </g>
      {/* One saffron dot runs the pipeline once, seam to ring (diagrams.css). */}
      <circle className="auto-pulse" cx="200" cy="150" r="3.5" fill={SAFFRON} />
      {/* Loop marker (loop-automation.css): wanders the zigzag, crosses the seam, runs the pipeline. Hidden at rest. */}
      <circle className="loop auto-loop-dot" cx="28" cy="236" r="3.5" fill={SAFFRON} />
    </>
  );
}

/* ---------------------------------------------------------- Software */

const BARS = [24, 40, 32, 54, 44];

/** One interface layout, drawn at x = 24 and built at x = 216. */
function Wire({ ox, built }: { ox: number; built: boolean }) {
  const content = ox + 52;
  return (
    <>
      <rect x={ox} y="48" width="160" height="216" fill={built ? "var(--color-paper-raised)" : "none"} />
      <line x1={ox} y1="76" x2={ox + 160} y2="76" />
      <rect x={ox} y="76" width="40" height="188" fill={built ? "var(--color-haze)" : "none"} />
      {[92, 104, 116, 128].map((y) => (
        <line key={y} x1={ox + 8} y1={y} x2={ox + 32} y2={y} />
      ))}
      <rect x={content} y="92" width="64" height="8" />
      <line x1={content} y1="112" x2={content + 96} y2="112" />
      <line x1={content} y1="122" x2={content + 78} y2="122" />
      <rect x={content} y="136" width="46" height="46" />
      <rect x={content + 54} y="136" width="46" height="46" />
      {built ? null : (
        <path className="sw-x loop" d={`M${content} 136 L${content + 46} 182 M${content + 46} 136 L${content} 182`} strokeWidth="0.75" />
      )}
      <line x1={content} y1="252" x2={content + 100} y2="252" />
      {BARS.map((h, i) => (
        <rect key={h} x={content + 2 + i * 20} y={252 - h} width="12" height={h} />
      ))}
    </>
  );
}

export function SoftwareDiagram() {
  const ox = 216;
  const content = ox + 52;
  return (
    <>
      <Drawn>
        <g className="sw-wire loop" strokeDasharray={DASH}>
          <Wire ox={24} built={false} />
        </g>
      </Drawn>
      <Built>
        <Wire ox={ox} built />
      </Built>
      <Fill>
        <g className="text-ink t-fill" fill="currentColor" stroke="none">
          <rect x={ox} y="48" width="160" height="28" />
          <rect x={content} y="92" width="64" height="8" />
          <rect x={content} y="110" width="96" height="4" opacity="0.45" />
          <rect x={content} y="120" width="78" height="4" opacity="0.45" />
          <rect className="sw-tile loop" x={content} y="136" width="46" height="46" />
          {BARS.map((h, i) => (
            <rect
              key={h}
              className="grow-y grow-base sw-bar loop"
              style={vars({ "--i": i, "--loop-d": `${i * 0.1}s` })}
              x={content + 2 + i * 20}
              y={252 - h}
              width="12"
              height={h}
            />
          ))}
          {[92, 104, 116, 128].map((y, i) => (
            <rect key={y} x={ox + 8} y={y - 1.5} width={i === 0 ? 24 : 18} height="3" opacity="0.7" />
          ))}
        </g>
        <g fill={PAPER} stroke="none">
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={ox + 12 + i * 10} cy="62" r="2.5" />
          ))}
        </g>
        <circle
          className="pop sw-ring loop"
          style={vars({ "--delay": "1900ms" })}
          cx={content + 77}
          cy="159"
          r="7"
          fill="none"
          stroke={SAFFRON}
          strokeWidth="1.5"
        />
      </Fill>
      <circle className="sw-marker loop" cx={76 + 23} cy="159" r="4" fill={SAFFRON} opacity="0" />
    </>
  );
}

/* --------------------------------------------------------------- SEO */

/** Small deterministic generator, so server and client always agree. */
function rng(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const NOISE = (() => {
  const next = rng(7);
  return Array.from({ length: 44 }, () => {
    const x = 28 + next() * 150;
    const y = 62 + next() * 186;
    const angle = next() * Math.PI;
    const half = 4 + next() * 5;
    const dx = Math.cos(angle) * half;
    const dy = Math.sin(angle) * half;
    return [x - dx, y - dy, x + dx, y + dy].map((n) => Math.round(n * 10) / 10) as [number, number, number, number];
  });
})();

const BASE_Y = 256;
const SIGNAL = Array.from({ length: 15 }, (_, i) => {
  const t = i / 14;
  const wobble = [0, 6, -4, 5, -3, 4, -5, 3, -2, 3, -1, 2, 0, 1, 0][i];
  return {
    x: 218 + i * 11.5,
    top: Math.round(BASE_Y - (14 + 168 * t ** 1.6 + wobble)),
  };
});
const HIGHLIGHT = 11;

export function SeoDiagram() {
  const pick = SIGNAL[HIGHLIGHT];
  return (
    <>
      <Drawn>
        <g className="text-line-strong" strokeDasharray={DASH}>
          {[96, 156, 216].map((y) => (
            <line key={y} x1="24" y1={y} x2="196" y2={y} />
          ))}
          <line x1="24" y1={BASE_Y} x2="196" y2={BASE_Y} />
        </g>
        <g className="seo-noise loop">
          {NOISE.map(([x1, y1, x2, y2]) => (
            <line key={`${x1}${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </g>
      </Drawn>
      <Built>
        {/* The baseline runs to the edge of the board, which the plate bleeds to the edge of the viewport. */}
        <line x1="204" y1={BASE_Y} x2="400" y2={BASE_Y} />
      </Built>
      {/*
        The signal rises out of the noise: stems grow from the baseline, left to
        right, the trace follows and the dots ride up with their stems (same
        timing, so each dot stays on its stem top). Only vertical motion, so the
        plate never widens past the viewport. The noise itself stays still.
      */}
      <Built noclip className="t-built">
        {SIGNAL.map(({ x, top }, i) => (
          <line
            key={x}
            className="grow-y grow-base seo-stem loop"
            style={vars({ "--i": i, "--loop-d": `${i * 100}ms` })}
            x1={x}
            y1={BASE_Y}
            x2={x}
            y2={top}
            strokeWidth="1.25"
            opacity="0.5"
          />
        ))}
        <path
          d={`M${SIGNAL.map(({ x, top }) => `${x} ${top}`).join(" L")}`}
          {...drawProps(1.5, { delay: 900, duration: 1000 })}
          className="draw seo-trace loop"
        />
        <line
          className="grow-y grow-base"
          style={vars({ "--i": HIGHLIGHT })}
          x1={pick.x}
          y1={pick.top}
          x2={pick.x}
          y2={BASE_Y}
          strokeDasharray={DASH}
        />
      </Built>
      <g className="text-ink t-built" fill="currentColor" stroke="none">
        {SIGNAL.map(({ x, top }, i) => (
          <circle
            key={x}
            className="rise-in seo-dot loop"
            style={vars({ "--i": i, "--rise-y": `${BASE_Y - top}px`, "--loop-d": `${i * 100}ms` })}
            cx={x}
            cy={top}
            r="2.5"
          />
        ))}
        <circle
          className="rise-in seo-dot loop"
          style={vars({ "--i": HIGHLIGHT, "--rise-y": `${BASE_Y - pick.top}px`, "--loop-d": `${HIGHLIGHT * 100}ms` })}
          cx={pick.x}
          cy={pick.top}
          r="5.5"
        />
      </g>
      <circle
        className="pop seo-ring loop"
        style={vars({ "--delay": "1900ms", "--rise-y": `${BASE_Y - pick.top}px`, "--loop-d": `${HIGHLIGHT * 100}ms` })}
        cx={pick.x}
        cy={pick.top}
        r="11"
        fill="none"
        stroke={SAFFRON}
        strokeWidth="1.5"
      />
      <circle className="seo-marker loop" cx="150" cy="176" r="3.5" fill={SAFFRON} stroke="none" opacity="0" />
    </>
  );
}
