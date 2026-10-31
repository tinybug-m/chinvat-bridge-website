import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./diagrams.css";
import "./loop-ai.css";
import "./loop-morph.css";
import "./explore.css";

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
      {/* Explore: signal flows from every node into the hub; a hovered node lights its own spoke. */}
      <g fill="none" stroke={SAFFRON} strokeLinecap="round">
        {AI_GRAPH.map(([x, y, r], i) => {
          // Run edge to edge: from the node's rim to the hub's.
          const len = Math.hypot(x - hx, y - hy);
          const at = (k: number) => `${round(hx + (x - hx) * k)} ${round(hy + (y - hy) * k)}`;
          const d = `M${at(1 - (r + 2) / len)} L${at((hr + 2) / len)}`;
          return (
            <g key={`p${x}${y}`} className="pick">
              <path
                className="xp-flow"
                style={vars({ "--xp-d": `${i * 0.32}s` })}
                d={d}
                pathLength="100"
                strokeWidth="2.5"
                strokeDasharray="10 100"
              />
              <g className="pick-hl">
                <path d={d} strokeWidth="1.5" />
                <circle cx={x} cy={y} r={r + 6} strokeWidth="1.5" />
              </g>
              <circle className="pick-hit" cx={x} cy={y} r="22" />
            </g>
          );
        })}
      </g>
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

/*
 * A workflow on a dotted canvas: trigger, step, a branch, two paths that
 * merge into one result. At START the same six nodes are loose manual tasks
 * scattered over the board, joined by a dashed hand-off trail.
 */
const AUTO_Y = 150;
const CARD = "var(--color-paper-raised)";
/** Node centres at END. */
const AUTO = {
  trigger: [52, AUTO_Y],
  step: [134, AUTO_Y],
  branch: [200, AUTO_Y],
  top: [281, 98],
  bottom: [281, 202],
  done: [354, AUTO_Y],
} as const;
type AutoNode = keyof typeof AUTO;
/** Where each node starts as a manual task (centre and tilt), in hand-off order. */
const AUTO_LOOSE: { node: AutoNode; at: [number, number]; r: number }[] = [
  { node: "trigger", at: [60, 212], r: -10 },
  { node: "branch", at: [96, 104], r: 8 },
  { node: "bottom", at: [172, 218], r: 6 },
  { node: "done", at: [234, 92], r: -8 },
  { node: "step", at: [300, 206], r: 12 },
  { node: "top", at: [344, 126], r: -14 },
];

/** Connectors, port to port; rounded orthogonal elbows at the split and the merge. */
const elbow = (x1: number, y1: number, xm: number, x2: number, y2: number) => {
  const s = Math.sign(y2 - y1) * 6;
  return `M${x1} ${y1} H${xm - 6} Q${xm} ${y1} ${xm} ${y1 + s} V${y2 - s} Q${xm} ${y2} ${xm + 6} ${y2} H${x2}`;
};
/** Connectors; `branch` marks the two either side of a branch card (explore.css swaps which is idle). */
const AUTO_LINKS: { d: string; branch?: "a" | "b" }[] = [
  { d: `M79 ${AUTO_Y} H101` },
  { d: `M167 ${AUTO_Y} H186` },
  { d: elbow(214, AUTO_Y, 232, 248, 98), branch: "a" },
  { d: elbow(214, AUTO_Y, 232, 248, 202), branch: "b" },
  { d: elbow(314, 98, 328, 341, AUTO_Y), branch: "a" },
  { d: elbow(314, 202, 328, 341, AUTO_Y), branch: "b" },
];
/** The route a run takes from the trigger to the result, through the branch card at y. */
const route = (y: number) =>
  `M76 ${AUTO_Y} H214 ${elbow(214, AUTO_Y, 232, 314, y).slice(`M214 ${AUTO_Y}`.length)} ${elbow(314, y, 328, 341, AUTO_Y).slice(`M314 ${y}`.length)}`;
const AUTO_RUN = route(98);
/** Ports on the card edges. */
const AUTO_PORTS: [number, number][] = [
  [76, AUTO_Y],
  [104, AUTO_Y],
  [164, AUTO_Y],
  [251, 98],
  [311, 98],
  [251, 202],
  [311, 202],
];

/** A step card (60 x 32 or 36), with an icon and two lines of label. */
function StepCard({ cx, cy, h = 32, icon }: { cx: number; cy: number; h?: number; icon: ReactNode }) {
  const x = cx - 30;
  return (
    <g className="text-ink">
      <rect x={x} y={cy - h / 2} width="60" height={h} rx="4" fill={CARD} stroke="currentColor" strokeWidth="1.25" />
      <g fill="currentColor">
        {icon}
        <rect x={x + 26} y={cy - 4.5} width="26" height="3" rx="1.5" />
        <rect x={x + 26} y={cy + 1.5} width="18" height="3" rx="1.5" opacity="0.4" />
      </g>
    </g>
  );
}

const AUTO_FACES: Record<AutoNode, ReactNode> = {
  trigger: (
    <g className="text-ink">
      <rect x="28" y={AUTO_Y - 18} width="48" height="36" rx="18" fill="currentColor" />
      <path d={`M54 ${AUTO_Y - 10} L45 ${AUTO_Y + 1} H51 L49 ${AUTO_Y + 10} L58 ${AUTO_Y - 2} H52 Z`} fill={PAPER} />
    </g>
  ),
  step: <StepCard cx={134} cy={AUTO_Y} h={36} icon={<rect x="112" y={AUTO_Y - 7} width="14" height="14" rx="2" />} />,
  branch: (
    <g className="text-ink">
      <path
        d={`M200 ${AUTO_Y - 14} L214 ${AUTO_Y} L200 ${AUTO_Y + 14} L186 ${AUTO_Y} Z`}
        fill={CARD}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d={`M200 ${AUTO_Y - 4} L204 ${AUTO_Y} L200 ${AUTO_Y + 4} L196 ${AUTO_Y} Z`} fill="currentColor" />
    </g>
  ),
  top: (
    <g className="auto-a">
      <StepCard cx={281} cy={98} icon={<circle cx="265" cy="98" r="7" />} />
    </g>
  ),
  bottom: (
    <g className="auto-b">
      <StepCard
        cx={281}
        cy={202}
        icon={<rect x="258.5" y="195.5" width="13" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.25" />}
      />
    </g>
  ),
  done: (
    <g className="text-ink">
      <circle cx="354" cy={AUTO_Y} r="13" fill="currentColor" />
      <path
        d={`M348 ${AUTO_Y} L352 ${AUTO_Y + 4} L360 ${AUTO_Y - 4}`}
        fill="none"
        stroke={PAPER}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  ),
};

export function AutomationDiagram() {
  return (
    <g className="mx">
      <defs>
        <pattern id="auto-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="0.8" fill="currentColor" />
        </pattern>
        <radialGradient id="auto-fade">
          <stop offset="0.55" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="auto-canvas">
          <rect x="12" y="62" width="376" height="176" fill="url(#auto-fade)" />
        </mask>
      </defs>
      {/* The canvas the workflow is laid out on; it holds through the loop. */}
      <rect
        className="text-line-strong"
        x="12"
        y="62"
        width="376"
        height="176"
        fill="url(#auto-dots)"
        mask="url(#auto-canvas)"
        opacity="0.6"
      />
      <g className="mx-guess loop text-control" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray={DASH} opacity="0">
        <polyline points={AUTO_LOOSE.map(({ at }) => at.join(" ")).join(" ")} />
      </g>
      {/* The connectors arrive once the nodes have landed; the branch not taken stays quiet. */}
      <g className="text-ink" fill="none" stroke="currentColor" strokeWidth="1.25">
        {AUTO_LINKS.map(({ d, branch }, i) => (
          <g key={d} className={branch && `auto-${branch}-link`}>
            <path className="mx-in loop" style={vars({ "--loop-d": `${(i >> 1) * 0.1}s` })} d={d} />
          </g>
        ))}
      </g>
      {/* A run travels the taken route, behind the cards, and arrives with the ring. */}
      <path
        className="auto-pulse loop"
        d={AUTO_RUN}
        pathLength="100"
        fill="none"
        stroke={SAFFRON}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="8 100"
        opacity="0"
      />
      {/* Explore: runs keep flowing; hovering the other branch card sends them that way. */}
      <g fill="none" stroke={SAFFRON} strokeWidth="3" strokeLinecap="round" strokeDasharray="8 100">
        {[98, 202].map((y) => (
          <g key={y} className={y === 98 ? "auto-run-a" : "auto-run-b"}>
            {[0, 1].map((n) => (
              <path key={n} className="xp-flow" style={vars({ "--xp-d": `${n * 1.1}s`, "--xp-t": "2.2s" })} d={route(y)} pathLength="100" />
            ))}
          </g>
        ))}
      </g>
      {AUTO_LOOSE.map(({ node, at: [sx, sy], r }) => {
        const [cx, cy] = AUTO[node];
        return (
          <Node
            key={node}
            from={travel(sx - cx, sy - cy, r)}
            start={<rect x={cx - 8} y={cy - 6} width="16" height="12" rx="1" />}
            end={AUTO_FACES[node]}
          />
        );
      })}
      <g className="mx-in loop text-ink" fill={CARD} stroke="currentColor" strokeWidth="1.25">
        {AUTO_PORTS.map(([x, y]) => (
          <circle key={`${x}${y}`} className={y > AUTO_Y ? "auto-b-port" : undefined} cx={x} cy={y} r="2.5" />
        ))}
      </g>
      <circle className="mx-accent loop" cx={AUTO.done[0]} cy={AUTO_Y} r="20" fill="none" stroke={SAFFRON} strokeWidth="1.5" />
      {/* Hovering a card outlines it; the bottom card also takes the run. */}
      <g fill="none" stroke={SAFFRON} strokeWidth="1.5">
        {[
          { x: 24, y: AUTO_Y - 22, w: 56, h: 44, rx: 22 },
          { x: 100, y: AUTO_Y - 22, w: 68, h: 44, rx: 7 },
          { x: 247, y: 78, w: 68, h: 40, rx: 7 },
          { x: 247, y: 182, w: 68, h: 40, rx: 7, b: true },
        ].map(({ x, y, w, h, rx, b }) => (
          <g key={x + y} className={cn("pick", b && "auto-b-hit")}>
            <rect className="pick-hl" x={x} y={y} width={w} height={h} rx={rx} />
            <rect className="pick-hit" x={x} y={y} width={w} height={h} />
          </g>
        ))}
      </g>
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
        {/* Built, the nav and the text are the fills that arrive after (mx-in). */}
        {built ? null : SW_NAV.map((y) => <line key={y} x1={SW_X + 8} y1={y} x2={SW_X + 32} y2={y} />)}
      </>
    ),
  },
  { from: [120, -30, 8], draw: () => <rect x={SW_C} y="92" width="64" height="8" fill="none" /> },
  {
    from: [110, 10, -5],
    draw: (built) =>
      built ? null : (
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
      {/* Explore: the metric pings; a hovered bar reads off against the axis, a hovered row lights up. */}
      <circle className="xp-ping" cx={SW_C + 77} cy="159" r="7" fill="none" stroke={SAFFRON} strokeWidth="1.5" />
      {SW_NAV.map((y) => (
        <g key={y} className="pick">
          <rect className="pick-hl" x={SW_X + 4} y={y - 5} width="32" height="10" rx="2" fill={SAFFRON} fillOpacity="0.25" />
          <rect className="pick-hit" x={SW_X} y={y - 6} width="40" height="12" />
        </g>
      ))}
      {BARS.map((h, i) => {
        const x = SW_C + 2 + i * 20;
        return (
          <g key={h} className="pick">
            <g className="pick-hl" fill={SAFFRON} stroke={SAFFRON}>
              <line x1={SW_C} y1={252 - h} x2={SW_C + 100} y2={252 - h} strokeWidth="1" strokeDasharray="2 3" />
              <rect x={x} y={252 - h} width="12" height={h} stroke="none" />
            </g>
            <rect className="pick-hit" x={x - 4} y="190" width="20" height="62" />
          </g>
        );
      })}
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
const TRACE = `M${SIGNAL.map(({ x, top }) => `${x} ${top}`).join(" L")}`;

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
              style={{
                ...travel(n.x - x, n.y - (BASE_Y + top) / 2, n.angle - 90, n.length / h),
                ...vars({ "--loop-d": `${i * 0.04}s` }),
              }}
              x1={x}
              y1={BASE_Y}
              x2={x}
              y2={top}
              opacity="0.5"
            />
          );
        })}
      </g>
      <path className="mx-in loop text-ink" d={TRACE} fill="none" stroke="currentColor" strokeWidth="1.5" />
      <g className="text-ink" fill="currentColor" stroke="none">
        {SIGNAL.map(({ x, top }, i) => (
          <circle key={x} className="mx-in loop" style={vars({ "--loop-d": `${i * 0.03}s` })} cx={x} cy={top} r="2.5" />
        ))}
      </g>
      {/* Explore: a run climbs the trace. */}
      <path
        className="xp-flow"
        style={vars({ "--xp-t": "3s" })}
        d={TRACE}
        pathLength="100"
        fill="none"
        stroke={SAFFRON}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="6 100"
      />
      {/* The highlighted result; it steps back while another point is read off. */}
      <g className="seo-pick">
        <line
          className="mx-in loop text-ink"
          style={vars({ "--loop-d": "0.3s" })}
          x1={pick.x}
          y1={pick.top}
          x2={pick.x}
          y2={BASE_Y}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray={DASH}
        />
        <circle
          className="mx-in loop text-ink"
          style={vars({ "--loop-d": "0.3s" })}
          cx={pick.x}
          cy={pick.top}
          r="5.5"
          fill="currentColor"
        />
        <circle className="mx-accent loop" cx={pick.x} cy={pick.top} r="11" fill="none" stroke={SAFFRON} strokeWidth="1.5" />
      </g>
      {/* Hovering a column reads its point off against both axes. */}
      {SIGNAL.map(({ x, top }, i) =>
        i === HIGHLIGHT ? null : (
          <g key={x} className="pick seo-col">
            <g className="pick-hl" fill="none" stroke={SAFFRON} strokeWidth="1.5">
              <line x1="24" y1={top} x2={x} y2={top} strokeWidth="1" strokeDasharray="2 3" />
              <line x1={x} y1={top} x2={x} y2={BASE_Y} />
              <circle cx={x} cy={top} r="5.5" fill={SAFFRON} stroke="none" />
              <circle cx={x} cy={top} r="11" />
            </g>
            <rect className="pick-hit" x={x - 9} y={top - 24} width="18" height={BASE_Y - top + 24} />
          </g>
        ),
      )}
    </g>
  );
}
