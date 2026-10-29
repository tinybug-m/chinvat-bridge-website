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

const SLAB = {
  top: "var(--color-slab-top)",
  end: "var(--color-slab-end)",
  face: "var(--color-slab-face)",
  edge: "var(--color-slab-edge)",
} as const;
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

/** Built slabs `from` to `to`, far to near, so each overlaps the next one along. The near step sits under slab 0. */
function Slabs({ from, to, uid }: { from: number; to: number } & PlateProps) {
  return (
    <>
      {farToNear
        .filter((index) => index >= from && index <= to)
        .map((index) => (
          <g key={index}>
            {index === 0 && <NearStep uid={uid} />}
            <Stone faces={STONE.built[index]} end={index === 0 ? undefined : false} />
          </g>
        ))}
    </>
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

function Ring({ at, delay = 0 }: { at: [number, number]; delay?: number }) {
  return (
    <Fill delay={delay}>
      <circle cx={at[0]} cy={at[1]} r="6" stroke={SAFFRON} strokeWidth="1.5" fill={SLAB.top} />
    </Fill>
  );
}

const Inlay = ({ from, to }: { from: number; to: number }) => (
  <path d={inlayPath(from, to)} stroke={SAFFRON} strokeWidth="1.75" strokeLinecap="butt" />
);

/** I. Discover: the stones as they lie today, and the gap measured from both plinths. */
export function DiscoverPlate({ uid }: PlateProps) {
  return (
    <>
      <Fades uid={uid} />
      <Built>
        <FarPlinth uid={uid} />
        {farToNear.map((index) => (
          <g key={index}>
            {index === 0 && <NearStep uid={uid} />}
            <Stone faces={STONE.loose[index]} />
          </g>
        ))}
        <NearBlock uid={uid} />
      </Built>
      <Drawn>
        <g strokeDasharray={DASH}>
          <path d={GAUGE.line} />
        </g>
        <path d={GAUGE.legs} />
      </Drawn>
      <Ring at={GAUGE.feet[0]} />
      <Ring at={GAUGE.feet[1]} delay={120} />
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
      <Drawn>
        <Outlines from={0} to={STONE.count - 1} />
        <path d={inlayPath(0, STONE.count - 1)} strokeDasharray={DASH} strokeWidth="1.1" />
      </Drawn>
      <Ring at={slabPoint(6, 1)} />
    </>
  );
}

const BUILT_TO = 7;

/** III. Build: raised from the near plinth, the far half still on paper. */
export function BuildPlate({ uid }: PlateProps) {
  return (
    <>
      <Fades uid={uid} />
      <Built>
        <FarPlinth uid={uid} />
        <Slabs from={0} to={BUILT_TO} uid={uid} />
        <NearBlock uid={uid} />
        <Inlay from={0} to={BUILT_TO} />
      </Built>
      <Drawn>
        <Outlines from={BUILT_TO + 1} to={STONE.count - 1} nearCap={false} />
        <path d={inlayPath(BUILT_TO + 1, STONE.count - 1)} strokeDasharray={DASH} strokeWidth="1.1" />
      </Drawn>
      <Ring at={slabPoint(BUILT_TO, 1)} />
    </>
  );
}

/** IV. Improve: the whole span stands and is measured. */
export function ImprovePlate({ uid }: PlateProps) {
  return (
    <>
      <Fades uid={uid} />
      <Built>
        <FarPlinth uid={uid} />
        <Slabs from={0} to={STONE.count - 1} uid={uid} />
        <NearBlock uid={uid} />
        <Inlay from={0} to={STONE.count - 1} />
        <path d={RULER.line} strokeWidth="1" />
        <path d={RULER.ticks} strokeWidth="1" />
      </Built>
      <Ring at={slabPoint(3)} />
      <Ring at={slabPoint(7)} delay={120} />
      <Ring at={slabPoint(11)} delay={240} />
    </>
  );
}

/** One plate per step of src/data/process.ts, in order. */
export const METHOD_PLATES = [DiscoverPlate, DefinePlate, BuildPlate, ImprovePlate];
