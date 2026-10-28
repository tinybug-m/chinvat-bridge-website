import type { ReactNode } from "react";

/*
 * Four diagrams on a 400 x 300 board. The seam is x = 200: everything left of
 * it is drawn (hairlines, dashes, unfilled), everything right of it is built
 * (solid ink, fills). `svc-*` classes are animated by services.css.
 */

const PAPER = "var(--color-paper)";
const SAFFRON = "var(--color-saffron-500)";

function Drawn({ children }: { children: ReactNode }) {
  return (
    <g className="svc-drawn text-control" fill="none" stroke="currentColor" strokeWidth="1">
      {children}
    </g>
  );
}

function Built({ children }: { children: ReactNode }) {
  return (
    <g className="svc-built text-ink" fill="none" stroke="currentColor" strokeWidth="1.5">
      {children}
    </g>
  );
}

function Fill({ delay = 0, children }: { delay?: number; children: ReactNode }) {
  return (
    <g className="svc-fill" style={{ "--d": `${delay}ms` } as React.CSSProperties}>
      {children}
    </g>
  );
}

const DASH = "4 4";
const GUESS = "2 5";

/* ---------------------------------------------------------------- AI */

const AI_LOOSE: [number, number, number][] = [
  [46, 96, 7],
  [98, 66, 5],
  [70, 152, 8],
  [138, 112, 6],
  [160, 198, 7],
  [90, 236, 5],
  [40, 208, 6],
  [172, 148, 6],
  [132, 258, 5],
  [170, 74, 6],
];
const AI_GUESSES: [number, number, number, number][] = [
  [46, 96, 98, 66],
  [138, 112, 172, 148],
  [70, 152, 40, 208],
  [90, 236, 132, 258],
  [160, 198, 172, 148],
];
const AI_GRAPH: [number, number, number][] = [
  [234, 138, 6],
  [264, 86, 7],
  [340, 72, 6],
  [374, 130, 6],
  [366, 214, 7],
  [302, 256, 6],
  [240, 214, 6],
];
const AI_HUB: [number, number] = [306, 160];
const AI_RIM: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 0],
];

export function AiDiagram() {
  return (
    <>
      <Drawn>
        <g strokeDasharray={GUESS} className="text-line-strong">
          <path d="M172 148 L200 142" className="text-control" strokeDasharray={DASH} />
          {AI_GUESSES.map(([x1, y1, x2, y2]) => (
            <line key={`${x1}${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </g>
        {AI_LOOSE.map(([x, y, r]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill={PAPER} />
        ))}
      </Drawn>
      <Built>
        <path d="M200 142 L234 138" />
        {AI_GRAPH.map(([x, y]) => (
          <line key={`h${x}${y}`} x1={AI_HUB[0]} y1={AI_HUB[1]} x2={x} y2={y} />
        ))}
        <g strokeWidth="1" opacity="0.55">
          {AI_RIM.map(([a, b]) => (
            <line key={`r${a}${b}`} x1={AI_GRAPH[a][0]} y1={AI_GRAPH[a][1]} x2={AI_GRAPH[b][0]} y2={AI_GRAPH[b][1]} />
          ))}
        </g>
      </Built>
      <Fill>
        <g fill="currentColor" className="text-ink" stroke="none">
          {AI_GRAPH.map(([x, y, r]) => (
            <circle key={`n${x}${y}`} cx={x} cy={y} r={r} />
          ))}
          <circle cx={AI_HUB[0]} cy={AI_HUB[1]} r="15" />
        </g>
        <circle cx={AI_HUB[0]} cy={AI_HUB[1]} r="23" fill="none" stroke={SAFFRON} strokeWidth="1.5" />
      </Fill>
    </>
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
          {AUTO_BOXES.map((x) => (
            <rect key={`b${x}`} x={x} y="132" width="36" height="36" />
          ))}
          {AUTO_BOXES.map((x) => (
            <circle key={`d${x}`} cx={x + 18} cy="230" r="4" />
          ))}
        </g>
        <g stroke={PAPER} strokeWidth="1.5" fill="none">
          <circle cx="232" cy="150" r="4" />
          <path d="M283 145 H301 M283 155 H301" />
        </g>
        <circle cx="352" cy="150" r="8" fill="none" stroke={SAFFRON} strokeWidth="2" />
      </Fill>
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
        <path d={`M${content} 136 L${content + 46} 182 M${content + 46} 136 L${content} 182`} strokeWidth="0.75" />
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
        <g strokeDasharray={DASH}>
          <Wire ox={24} built={false} />
        </g>
      </Drawn>
      <Built>
        <Wire ox={ox} built />
      </Built>
      <Fill>
        <g className="text-ink" fill="currentColor" stroke="none">
          <rect x={ox} y="48" width="160" height="28" />
          <rect x={content} y="92" width="64" height="8" />
          <rect x={content} y="110" width="96" height="4" opacity="0.45" />
          <rect x={content} y="120" width="78" height="4" opacity="0.45" />
          <rect x={content} y="136" width="46" height="46" />
          {BARS.map((h, i) => (
            <rect key={h} x={content + 2 + i * 20} y={252 - h} width="12" height={h} />
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
        <circle cx={content + 77} cy="159" r="7" fill="none" stroke={SAFFRON} strokeWidth="1.5" />
      </Fill>
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
        {NOISE.map(([x1, y1, x2, y2]) => (
          <line key={`${x1}${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </Drawn>
      <Built>
        <line x1="204" y1={BASE_Y} x2="388" y2={BASE_Y} />
        {SIGNAL.map(({ x, top }) => (
          <line key={x} x1={x} y1={BASE_Y} x2={x} y2={top} strokeWidth="1.25" opacity="0.5" />
        ))}
        <polyline points={SIGNAL.map(({ x, top }) => `${x} ${top}`).join(" ")} />
        <line x1={pick.x} y1={pick.top} x2={pick.x} y2={BASE_Y} strokeDasharray={DASH} />
      </Built>
      <Fill>
        <g className="text-ink" fill="currentColor" stroke="none">
          {SIGNAL.map(({ x, top }) => (
            <circle key={x} cx={x} cy={top} r="2.5" />
          ))}
          <circle cx={pick.x} cy={pick.top} r="5.5" />
        </g>
        <circle cx={pick.x} cy={pick.top} r="11" fill="none" stroke={SAFFRON} strokeWidth="1.5" />
      </Fill>
    </>
  );
}
