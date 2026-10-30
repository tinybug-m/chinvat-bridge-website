import type { CSSProperties, ReactNode } from "react";
import { Built, DASH, Drawn, Fill, SAFFRON } from "@/components/home/services/diagrams";
import { deckOutline, GAUGE, inlayPath, RULER, slabPoint, STONE, type StoneFaces } from "./stonePlates";

/*
 * Four plates of one bridge: the stone path from the Approach stage, flattened
 * (see stonePlates.ts), with the same plinths in every plate and the same
 * span at each step. Discover shows the stones as they lie and measures the
 * gap, Define draws the span, Build raises it from the near bank, Improve
 * measures what stands. Hairlines and dashes are not yet built; stone with a
 * saffron inlay is.
 */

interface PlateProps {
  /** Unique per plate on the page: the plinth fades are gradients with ids. */
  uid: string;
}

/*
 * Motion (method.css). Groups that carry their own per-node motion or wipe
 * drop the generic group wipe (.svc-noclip) and take a time from --at; the
 * rest of each plate keeps the shared clock (drawn 0, built --svc-t-built,
 * fills --svc-t-fill). Same grammar throughout: lines first, stone settles,
 * the saffron ring lands last.
 */
const SLAB_AT = 300;

type Css = CSSProperties & Record<`--${string}`, string | number>;

/** Same markup as Built / Drawn, plus the motion hooks those components do not take. */
function Layer({
  kind,
  className,
  style,
  children,
}: {
  kind: "built" | "drawn";
  className?: string;
  style?: Css;
  children: ReactNode;
}) {
  return kind === "built" ? (
    <g className={`svc-built text-ink ${className ?? ""}`} fill="none" stroke="currentColor" strokeWidth="1.5" style={style}>
      {children}
    </g>
  ) : (
    <g className={`svc-drawn text-control ${className ?? ""}`} fill="none" stroke="currentColor" strokeWidth="1" style={style}>
      {children}
    </g>
  );
}

const SLAB = {
  top: "var(--color-slab-top)",
  end: "var(--color-slab-end)",
  face: "var(--color-slab-face)",
  edge: "var(--color-slab-edge)",
} as const;

/*
 * The Define wipe runs along the deck: a half-plane perpendicular to the line
 * from the near slab to the far slab sweeps along it, as a polygon in board
 * units (view-box), so it follows the deck's slant rather than the page.
 */
const AXIS = (() => {
  const from = slabPoint(0);
  const to = slabPoint(STONE.count - 1);
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const u = [(to[0] - from[0]) / length, (to[1] - from[1]) / length];
  const reach = 500;
  const at = (along: number, across: number) =>
    `${(from[0] + u[0] * along - u[1] * across).toFixed(1)}px ${(from[1] + u[1] * along + u[0] * across).toFixed(1)}px`;
  const sweep = (front: number) =>
    `polygon(${[at(-reach, -reach), at(-reach, reach), at(front, reach), at(front, -reach)].join(", ")}) view-box`;
  // Clear of the deck at both ends: nothing shown before, everything after.
  return { hidden: sweep(-60), shown: sweep(length + 60) };
})();
const farToNear = Array.from({ length: STONE.count }, (_, index) => STONE.count - 1 - index);

/** A slab or plinth: top, front and, where the camera sees it, the end. */
function Stone({ faces, front, end }: { faces: StoneFaces; front?: string; end?: string | false }) {
  return (
    <g stroke={SLAB.edge} strokeWidth="1" strokeLinejoin="round">
      {end !== false && <path d={faces.end} fill={end ?? SLAB.end} stroke={end ? "none" : SLAB.edge} />}
      <path d={faces.front} fill={front ?? SLAB.face} stroke={front ? "none" : SLAB.edge} />
      <path d={faces.top} fill={SLAB.top} />
    </g>
  );
}

/** Plinth faces dissolve downward into the page, as they do in the 3D scene. */
function Fades({ uid }: PlateProps) {
  const gradient = (id: string, [from, to]: [number, number], colour: string) => (
    <linearGradient id={`${uid}-${id}`} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={from} y2={to}>
      <stop offset="0.05" stopColor={colour} />
      <stop offset="0.5" stopColor={colour} stopOpacity="0.55" />
      <stop offset="0.95" stopColor={colour} stopOpacity="0" />
    </linearGradient>
  );
  return (
    <defs>
      {gradient("near-front", STONE.nearFade, SLAB.face)}
      {gradient("near-end", STONE.nearFade, SLAB.end)}
      {gradient("far-front", STONE.farFade, SLAB.face)}
      {gradient("far-end", STONE.farFade, SLAB.end)}
    </defs>
  );
}

const FarPlinth = ({ uid }: PlateProps) => (
  <>
    <Stone faces={STONE.farBlock} front={`url(#${uid}-far-front)`} end={`url(#${uid}-far-end)`} />
    <Stone faces={STONE.farStep} front={`url(#${uid}-far-front)`} end={false} />
  </>
);

const NearStep = ({ uid }: PlateProps) => <Stone faces={STONE.nearStep} front={`url(#${uid}-near-front)`} end={false} />;
const NearBlock = ({ uid }: PlateProps) => (
  <Stone faces={STONE.nearBlock} front={`url(#${uid}-near-front)`} end={`url(#${uid}-near-end)`} />
);

/**
 * Built slabs `from` to `to`, far to near, so each overlaps the next one along. The near step sits under slab 0.
 * Index 0 is the near bank (the Approach path starts there), so --i = index settles the deck from the near bank.
 */
function Slabs({ from, to, uid }: { from: number; to: number } & PlateProps) {
  return (
    <Layer kind="built" className="svc-noclip m-at" style={{ "--at": `${SLAB_AT}ms` }}>
      {farToNear
        .filter((index) => index >= from && index <= to)
        .map((index) => (
          <g key={index} className="rise-in" style={{ "--i": index } as Css}>
            {index === 0 && <NearStep uid={uid} />}
            <Stone faces={STONE.built[index]} end={index === 0 ? undefined : false} />
          </g>
        ))}
    </Layer>
  );
}

/** The slabs `from` to `to` as one deck in outline only: the span drawn, not yet built. */
function Outlines({ from, to, nearCap = true }: { from: number; to: number; nearCap?: boolean }) {
  const { edges, joints } = deckOutline(from, to, nearCap);
  return (
    <>
      <path d={edges} strokeWidth="1" strokeDasharray={DASH} strokeLinejoin="round" />
      <path d={joints} strokeWidth="0.9" strokeDasharray="1.5 4" />
    </>
  );
}

/** The saffron ring fades in at --svc-t-fill + `delay` ms and pops from 0.6 to 1 with it. */
function Ring({ at, delay = 0 }: { at: [number, number]; delay?: number }) {
  return (
    <Fill delay={delay}>
      <circle
        className="pop m-at"
        style={{ "--at": `calc(var(--svc-t-fill) + ${delay}ms)` } as Css}
        cx={at[0]}
        cy={at[1]}
        r="6"
        stroke={SAFFRON}
        strokeWidth="1.5"
        fill={SLAB.top}
      />
    </Fill>
  );
}

/** The saffron inlay wipes in near to far, once the slabs it runs on are down. */
const Inlay = ({ from, to }: { from: number; to: number }) => (
  <Layer
    kind="built"
    className="svc-noclip m-wipe"
    style={{ "--at": `calc(${SLAB_AT}ms + ${to - from} * var(--stagger-step) + 50ms)` }}
  >
    <path d={inlayPath(from, to)} stroke={SAFFRON} strokeWidth="1.75" strokeLinecap="butt" />
  </Layer>
);

/** I. Discover: the stones as they lie today, and the gap measured from both plinths. */
export function DiscoverPlate({ uid }: PlateProps) {
  return (
    <>
      <Fades uid={uid} />
      <Layer kind="built" className="m-early">
        <FarPlinth uid={uid} />
        {farToNear.map((index) => (
          <g key={index}>
            {index === 0 && <NearStep uid={uid} />}
            <Stone faces={STONE.loose[index]} />
          </g>
        ))}
        <NearBlock uid={uid} />
      </Layer>
      <Layer kind="drawn" className="svc-noclip">
        <g
          className="m-wipe"
          strokeDasharray={DASH}
          style={{ "--at": "700ms", "--m-wipe-duration": "var(--motion-slow)" } as Css}
        >
          <path d={GAUGE.line} />
        </g>
        {GAUGE.legList.map((leg, index) => (
          <path
            key={index}
            d={leg}
            className="grow-y m-leg m-at"
            style={{ "--at": `${400 + index * 350}ms`, "--origin": `${GAUGE.feet[index][0]}px ${GAUGE.feet[index][1]}px` } as Css}
          />
        ))}
      </Layer>
      <Ring at={GAUGE.feet[0]} delay={200} />
      <Ring at={GAUGE.feet[1]} delay={320} />
    </>
  );
}

/** II. Define: one span chosen and drawn on the plinths, not yet built. */
export function DefinePlate({ uid }: PlateProps) {
  return (
    <>
      <Fades uid={uid} />
      <Built>
        <FarPlinth uid={uid} />
        <NearStep uid={uid} />
        <NearBlock uid={uid} />
      </Built>
      <Layer kind="drawn" className="svc-noclip">
        <g className="m-axis" style={{ "--axis-hidden": AXIS.hidden, "--axis-shown": AXIS.shown } as Css}>
          <Outlines from={0} to={STONE.count - 1} />
          <path d={inlayPath(0, STONE.count - 1)} strokeDasharray={DASH} strokeWidth="1.1" />
        </g>
      </Layer>
      <Ring at={slabPoint(6, 1)} delay={600} />
    </>
  );
}

const BUILT_TO = 7;

/** III. Build: raised from the near plinth, the far half still on paper. */
export function BuildPlate({ uid }: PlateProps) {
  return (
    <>
      <Fades uid={uid} />
      <Layer kind="built" className="m-early">
        <FarPlinth uid={uid} />
      </Layer>
      <Slabs from={0} to={BUILT_TO} uid={uid} />
      <Layer kind="built" className="m-early">
        <NearBlock uid={uid} />
      </Layer>
      <Inlay from={0} to={BUILT_TO} />
      <Drawn>
        <Outlines from={BUILT_TO + 1} to={STONE.count - 1} nearCap={false} />
        <path d={inlayPath(BUILT_TO + 1, STONE.count - 1)} strokeDasharray={DASH} strokeWidth="1.1" />
      </Drawn>
      <Ring at={slabPoint(BUILT_TO, 1)} delay={200} />
    </>
  );
}

/** IV. Improve: the whole span stands and is measured. */
export function ImprovePlate({ uid }: PlateProps) {
  return (
    <>
      <Fades uid={uid} />
      <Layer kind="built" className="m-early">
        <FarPlinth uid={uid} />
      </Layer>
      <Slabs from={0} to={STONE.count - 1} uid={uid} />
      <Layer kind="built" className="m-early">
        <NearBlock uid={uid} />
      </Layer>
      <Inlay from={0} to={STONE.count - 1} />
      <Layer kind="built" className="svc-noclip m-wipe" style={{ "--at": "1250ms" }}>
        <path d={RULER.line} strokeWidth="1" />
        <path d={RULER.ticks} strokeWidth="1" />
      </Layer>
      <Ring at={slabPoint(3)} delay={650} />
      <Ring at={slabPoint(7)} delay={770} />
      <Ring at={slabPoint(11)} delay={890} />
    </>
  );
}

/** One plate per step of src/data/process.ts, in order. */
export const METHOD_PLATES = [DiscoverPlate, DefinePlate, BuildPlate, ImprovePlate];
