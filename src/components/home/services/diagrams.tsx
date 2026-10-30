import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./diagrams.css";
import "./loop-ai.css";
import "./loop-morph.css";

/*
 * Four diagrams on a 400 x 300 board. Each is one composition that morphs
 * from a START state (drawn: hairlines, dashes, loose and unfilled) into an
 * END state (built: solid ink, fills, the saffron accent last) and back, on
 * the Services loop (loop.css). Nodes are authored at END, so reduced
 * motion and no-JS show the finished design.
 *
 * Drawn / Built / Fill are shared with the Method plates, which still wipe
 * in on reveal (services.css).
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

/* ----------------------------------------------------- Shared morph */

/*
 * Automation, Software and SEO morph START -> END the same way, on the
 * shared clock in loop-morph.css. Every node is authored at its END place;
 * the loop poses it at START:
 *   .mx-travel  a group that travels from START (--sx, --sy, --sr, --ssy) to END
 *   .mx-start   the START face of a node (authored hidden)
 *   .mx-end     its END face
 *   .mx-guess   START-only scaffolding (authored hidden)
 *   .mx-in      END-only detail that arrives once the nodes have landed
 *   .mx-grow    END-only bar or line growing from --o (default its base)
 *   .mx-accent  the saffron accent, which lands last
 */

/** A travelling group: CSS start offset, rotation and vertical stretch. */
function travel(sx: number, sy: number, sr = 0, ssy = 1) {
  return vars({ "--sx": `${sx}px`, "--sy": `${sy}px`, "--sr": `${sr}deg`, "--ssy": ssy });
}

/** A node with a drawn START face and a built END face, travelling as one. */
function Node({ from, start, end }: { from: CSSProperties; start: ReactNode; end: ReactNode }) {
  return (
    <g className="mx-travel loop" style={from}>
      <g className="mx-start loop text-control" fill={PAPER} stroke="currentColor" strokeWidth="1" opacity="0">
        {start}
      </g>
      <g className="mx-end loop">{end}</g>
    </g>
  );
}

/* -------------------------------------------------------- Automation */

/** The pipeline: three boxes (x of the left edge), triggers above, outputs below. */
const AUTO_BOXES = [122, 182, 242];
const AUTO_Y = 150;
/** The manual steps: a zigzag over the board, each landing on a trigger (t) or a box (b). */
const AUTO_STEPS: { at: [number, number]; to: ["t" | "b", number]; r: number }[] = [
  { at: [48, 236], to: ["b", 0], r: -10 },
  { at: [300, 214], to: ["b", 2], r: 12 },
  { at: [76, 184], to: ["t", 0], r: 8 },
  { at: [332, 166], to: ["t", 2], r: -14 },
  { at: [104, 128], to: ["b", 1], r: 6 },
  { at: [316, 100], to: ["t", 1], r: -8 },
];
const arrow = (x1: number, x2: number) => `M${x1} ${AUTO_Y} H${x2} M${x2 - 5} ${AUTO_Y - 5} L${x2} ${AUTO_Y} L${x2 - 5} ${AUTO_Y + 5}`;

export function AutomationDiagram() {
  const last = AUTO_BOXES[2] + 18;
  return (
    <g className="mx">
      <g className="mx-guess loop text-control" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray={DASH} opacity="0">
        <polyline points={AUTO_STEPS.map(({ at }) => at.join(" ")).join(" ")} />
        <g className="text-line-strong">
          <line x1="24" y1="272" x2="376" y2="272" />
          <line x1="24" y1="60" x2="376" y2="60" />
        </g>
      </g>
      {/* The wiring arrives once the steps have landed. */}
      <g className="text-ink" fill="none" stroke="currentColor" strokeWidth="1.5">
        {[[96, AUTO_BOXES[0] - 2], ...AUTO_BOXES.slice(0, 2).map((x) => [x + 38, x + 58])].map(([x1, x2], i) => (
          <path key={x1} className="mx-in loop" style={vars({ "--loop-d": `${i * 0.1}s` })} d={arrow(x1, x2)} />
        ))}
        {AUTO_BOXES.map((x, i) => (
          <g key={`s${x}`} className="mx-in loop" style={vars({ "--loop-d": `${i * 0.1}s` })} strokeWidth="1" opacity="0.55">
            <line x1={x + 18} y1="82" x2={x + 18} y2="132" />
            <line x1={x + 18} y1="168" x2={x + 18} y2="226" />
          </g>
        ))}
      </g>
      {AUTO_STEPS.map(({ at: [sx, sy], to: [kind, i], r }) => {
        const cx = AUTO_BOXES[i] + 18;
        const cy = kind === "b" ? AUTO_Y : 75;
        return (
          <Node
            key={`${sx}${sy}`}
            from={travel(sx - cx, sy - cy, r)}
            start={<rect x={cx - 5} y={cy - 5} width="10" height="10" />}
            end={
              kind === "b" ? (
                <rect className="text-ink" x={cx - 18} y={cy - 18} width="36" height="36" fill="currentColor" />
              ) : (
                <rect className="text-ink" x={cx - 7} y={cy - 7} width="14" height="14" fill={PAPER} stroke="currentColor" strokeWidth="1.2" />
              )
            }
          />
        );
      })}
      <g className="text-ink" fill="currentColor" stroke="none">
        {AUTO_BOXES.map((x, i) => (
          <circle key={`d${x}`} className="mx-in loop" style={vars({ "--loop-d": `${i * 0.1}s` })} cx={x + 18} cy="230" r="4" />
        ))}
      </g>
      <g className="mx-in loop" stroke={PAPER} strokeWidth="1.5" fill="none">
        <circle cx={AUTO_BOXES[0] + 18} cy={AUTO_Y} r="4" />
        <path d={`M${AUTO_BOXES[1] + 9} 145 H${AUTO_BOXES[1] + 27} M${AUTO_BOXES[1] + 9} 155 H${AUTO_BOXES[1] + 27}`} />
      </g>
      {/* A saffron pulse runs the finished pipeline; the ring lands as it arrives. */}
      <circle
        className="auto-pulse loop"
        style={vars({ "--run": `${last - 96}px` })}
        cx="96"
        cy={AUTO_Y}
        r="3.5"
        fill={SAFFRON}
        opacity="0"
      />
      <circle className="mx-accent loop" cx={last} cy={AUTO_Y} r="8" fill="none" stroke={SAFFRON} strokeWidth="2" />
    </g>
  );
}

/* ---------------------------------------------------------- Software */

/** One interface, x 120 to 280: frame, sidebar (40 wide) and a content column. */
const SW_X = 120;
const SW_C = SW_X + 52;
const BARS = [24, 40, 32, 54, 44];
const SW_NAV = [92, 104, 116, 128];

/**
 * The interface in pieces, each scattered at START (dx, dy, rotation) and
 * assembled at END. `draw` renders the piece; `built` is false for the
 * dashed START face.
 */
const SW_PIECES: { from: [number, number, number]; draw: (built: boolean) => ReactNode }[] = [
  {
    from: [-6, 6, -2],
    draw: (built) => (
      <rect x={SW_X} y="48" width="160" height="216" fill={built ? "var(--color-paper-raised)" : "none"} />
    ),
  },
  { from: [-40, -6, -6], draw: () => <rect x={SW_X} y="48" width="160" height="28" fill="none" /> },
  {
    from: [-84, 8, 5],
    draw: (built) => (
      <>
        <rect x={SW_X} y="76" width="40" height="188" fill={built ? "var(--color-haze)" : "none"} />
        {SW_NAV.map((y) => (
          <line key={y} x1={SW_X + 8} y1={y} x2={SW_X + 32} y2={y} />
        ))}
      </>
    ),
  },
  { from: [120, -30, 8], draw: () => <rect x={SW_C} y="92" width="64" height="8" fill="none" /> },
  {
    from: [110, 10, -5],
    draw: () => (
      <>
        <line x1={SW_C} y1="112" x2={SW_C + 96} y2="112" />
        <line x1={SW_C} y1="122" x2={SW_C + 78} y2="122" />
      </>
    ),
  },
  {
    from: [-120, 40, -10],
    draw: (built) => (
      <>
        <rect x={SW_C} y="136" width="46" height="46" fill="none" />
        {built ? null : (
          <path d={`M${SW_C} 136 L${SW_C + 46} 182 M${SW_C + 46} 136 L${SW_C} 182`} strokeWidth="0.75" />
        )}
      </>
    ),
  },
  { from: [100, 60, 9], draw: () => <rect x={SW_C + 54} y="136" width="46" height="46" fill="none" /> },
  {
    from: [-110, 6, 6],
    draw: () => (
      <>
        <line x1={SW_C} y1="252" x2={SW_C + 100} y2="252" />
        {BARS.map((h, i) => (
          <rect key={h} x={SW_C + 2 + i * 20} y={252 - h} width="12" height={h} fill="none" />
        ))}
      </>
    ),
  },
];

export function SoftwareDiagram() {
  return (
    <g className="mx">
      {SW_PIECES.map(({ from: [dx, dy, r], draw }, i) => (
        <g key={i} className="mx-travel loop" style={{ ...travel(dx, dy, r), ...vars({ "--loop-d": `${(i % 3) * 0.08}s` }) }}>
          <g className="mx-start loop text-control" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray={DASH} opacity="0">
            {draw(false)}
          </g>
          <g className="mx-end loop text-ink" fill="none" stroke="currentColor" strokeWidth="1.5">
            {draw(true)}
          </g>
        </g>
      ))}
      {/* Fills arrive once the pieces have assembled; the bars grow last. */}
      <g className="text-ink" fill="currentColor" stroke="none">
        <g className="mx-in loop">
          <rect x={SW_X} y="48" width="160" height="28" />
          <g fill={PAPER}>
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={SW_X + 12 + i * 10} cy="62" r="2.5" />
            ))}
          </g>
        </g>
        <g className="mx-in loop" style={vars({ "--loop-d": "0.1s" })}>
          <rect x={SW_C} y="92" width="64" height="8" />
          <rect x={SW_C} y="110" width="96" height="4" opacity="0.45" />
          <rect x={SW_C} y="120" width="78" height="4" opacity="0.45" />
          {SW_NAV.map((y, i) => (
            <rect key={y} x={SW_X + 8} y={y - 1.5} width={i === 0 ? 24 : 18} height="3" opacity="0.7" />
          ))}
        </g>
        <rect className="mx-in loop" style={vars({ "--loop-d": "0.2s" })} x={SW_C} y="136" width="46" height="46" />
        {BARS.map((h, i) => (
          <rect
            key={h}
            className="mx-grow loop"
            style={vars({ "--loop-d": `${0.2 + i * 0.08}s` })}
            x={SW_C + 2 + i * 20}
            y={252 - h}
            width="12"
            height={h}
          />
        ))}
      </g>
      <circle className="mx-accent loop" cx={SW_C + 77} cy="159" r="7" fill="none" stroke={SAFFRON} strokeWidth="1.5" />
    </g>
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

const round = (n: number) => Math.round(n * 10) / 10;

/** Noise strokes over the whole board: centre, angle (deg) and length. */
const NOISE = (() => {
  const next = rng(7);
  return Array.from({ length: 44 }, () => ({
    x: round(28 + next() * 344),
    y: round(62 + next() * 186),
    angle: round(next() * 180),
    length: round(8 + next() * 10),
  }));
})();

const BASE_Y = 256;
const SIGNAL = Array.from({ length: 15 }, (_, i) => {
  const t = i / 14;
  const wobble = [0, 6, -4, 5, -3, 4, -5, 3, -2, 3, -1, 2, 0, 1, 0][i];
  return {
    x: 74 + i * 18,
    top: Math.round(BASE_Y - (14 + 168 * t ** 1.6 + wobble)),
  };
});
const HIGHLIGHT = 11;

export function SeoDiagram() {
  const pick = SIGNAL[HIGHLIGHT];
  const rest = NOISE.slice(SIGNAL.length);
  return (
    <g className="mx">
      <g className="mx-guess loop text-control" fill="none" stroke="currentColor" strokeWidth="1" opacity="0">
        <g className="text-line-strong" strokeDasharray={DASH}>
          {[96, 156, 216, BASE_Y].map((y) => (
            <line key={y} x1="24" y1={y} x2="376" y2={y} />
          ))}
        </g>
        {/* The noise that is not picked up fades as ONE group. */}
        {rest.map(({ x, y, angle, length }) => {
          const dx = round((Math.cos((angle * Math.PI) / 180) * length) / 2);
          const dy = round((Math.sin((angle * Math.PI) / 180) * length) / 2);
          return <line key={`${x}${y}`} x1={x - dx} y1={y - dy} x2={x + dx} y2={y + dy} />;
        })}
      </g>
      {/* The baseline runs to the edge of the board, which the plate bleeds to the edge of the viewport. */}
      <Built noclip>
        <line className="mx-in loop" x1="24" y1={BASE_Y} x2="400" y2={BASE_Y} />
      </Built>
      {/* Each stem starts as a noise stroke: it travels, turns upright and stretches to its height. */}
      <g className="text-ink" stroke="currentColor" strokeWidth="1.25">
        {SIGNAL.map(({ x, top }, i) => {
          const n = NOISE[i];
          const h = BASE_Y - top;
          return (
            <line
              key={x}
              className="seo-stem mx-travel loop"
              style={{ ...travel(n.x - x, n.y - (BASE_Y + top) / 2, n.angle - 90, n.length / h), ...vars({ "--loop-d": `${i * 0.04}s` }) }}
              x1={x}
              y1={BASE_Y}
              x2={x}
              y2={top}
              opacity="0.5"
            />
          );
        })}
      </g>
      <g className="text-ink" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path className="mx-in loop" d={`M${SIGNAL.map(({ x, top }) => `${x} ${top}`).join(" L")}`} />
        <line
          className="mx-in loop"
          style={vars({ "--loop-d": "0.3s" })}
          x1={pick.x}
          y1={pick.top}
          x2={pick.x}
          y2={BASE_Y}
          strokeDasharray={DASH}
        />
      </g>
      <g className="text-ink" fill="currentColor" stroke="none">
        {SIGNAL.map(({ x, top }, i) => (
          <circle key={x} className="mx-in loop" style={vars({ "--loop-d": `${i * 0.03}s` })} cx={x} cy={top} r="2.5" />
        ))}
        <circle className="mx-in loop" style={vars({ "--loop-d": "0.3s" })} cx={pick.x} cy={pick.top} r="5.5" />
      </g>
      <circle className="mx-accent loop" cx={pick.x} cy={pick.top} r="11" fill="none" stroke={SAFFRON} strokeWidth="1.5" />
    </g>
  );
}
