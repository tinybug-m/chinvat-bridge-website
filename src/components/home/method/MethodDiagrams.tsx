import { Built, DASH, Drawn, Fill, PAPER, SAFFRON } from "@/components/home/services/diagrams";

/*
 * Four plates of one bridge, on a 400 x 200 board (the plate crops the empty sky): two banks with a gap
 * between them, and the same span at each step. Discover measures the gap,
 * Define draws the span, Build raises it from the near bank, Improve measures
 * what stands. Hairlines and dashes are not yet built; solid ink is. Same
 * language as the Approach seam and the Services diagrams.
 */

const LEFT = 80;
const RIGHT = 320;
const GROUND = 150;
const PANELS = 8;
const RISE = 80;

const nodeX = (i: number) => LEFT + ((RIGHT - LEFT) / PANELS) * i;
const archY = (i: number) => {
  const s = i / PANELS;
  return GROUND - RISE * 4 * s * (1 - s);
};

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

/** Deck, arch, hangers and diagonals between panel nodes `from` and `to`. */
function span(from: number, to: number) {
  const nodes = range(from, to);
  const chord = nodes.map((i, k) => `${k ? "L" : "M"}${nodeX(i)} ${archY(i).toFixed(1)}`).join(" ");
  const hangers = nodes.map((i) => `M${nodeX(i)} ${GROUND} V${archY(i).toFixed(1)}`).join(" ");
  const diagonals = nodes
    .slice(0, -1)
    .map((i) => (i < PANELS / 2 ? `M${nodeX(i)} ${archY(i).toFixed(1)} L${nodeX(i + 1)} ${GROUND}` : `M${nodeX(i)} ${GROUND} L${nodeX(i + 1)} ${archY(i + 1).toFixed(1)}`))
    .join(" ");
  return { deck: `M${nodeX(from)} ${GROUND} H${nodeX(to)}`, chord, hangers, diagonals };
}

function Banks({ solid }: { solid?: boolean }) {
  const bank = (
    <>
      <path d={`M0 ${GROUND} H${LEFT} V196`} />
      <path d={`M${RIGHT} 196 V${GROUND} H400`} />
    </>
  );
  return solid ? <Built>{bank}</Built> : <Drawn>{bank}</Drawn>;
}

function Ring({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  return (
    <Fill delay={delay}>
      <circle cx={x} cy={y} r="5" stroke={SAFFRON} strokeWidth="1.5" fill={PAPER} />
    </Fill>
  );
}

/** I. Discover: the gap measured from both banks. */
export function DiscoverPlate() {
  return (
    <>
      <Banks />
      <Drawn>
        <g strokeDasharray={DASH}>
          <path d={`M${LEFT} 112 H${RIGHT}`} />
          <path d={`M${nodeX(0)} ${GROUND} L${nodeX(4)} 70 L${nodeX(8)} ${GROUND}`} strokeWidth="0.75" />
        </g>
        <path d={`M${LEFT} 104 V120 M${RIGHT} 104 V120`} />
        <path d="M24 146 l8 8 m0 -8 l-8 8 M54 146 l8 8 m0 -8 l-8 8 M338 146 l8 8 m0 -8 l-8 8 M368 146 l8 8 m0 -8 l-8 8" strokeWidth="0.75" />
      </Drawn>
      <Ring x={LEFT} y={GROUND} />
      <Ring x={RIGHT} y={GROUND} delay={120} />
    </>
  );
}

/** II. Define: one span chosen and drawn, not yet built. */
export function DefinePlate() {
  const all = span(0, PANELS);
  return (
    <>
      <Banks />
      <Drawn>
        <g strokeDasharray={DASH}>
          <path d={all.deck} />
          <path d={all.chord} />
        </g>
        <path d={all.hangers} strokeWidth="0.75" strokeDasharray="2 5" />
      </Drawn>
      <Ring x={nodeX(4)} y={archY(4)} />
    </>
  );
}

/** III. Build: raised from the near bank, the far half still on paper. */
export function BuildPlate() {
  const done = span(0, 5);
  const rest = span(5, PANELS);
  return (
    <>
      <Banks solid />
      <Drawn>
        <g strokeDasharray={DASH}>
          <path d={rest.deck} />
          <path d={rest.chord} />
        </g>
        <path d={rest.hangers} strokeWidth="0.75" strokeDasharray="2 5" />
      </Drawn>
      <Built>
        <path d={done.deck} />
        <path d={done.chord} />
        <path d={done.hangers} strokeWidth="1" />
        <path d={done.diagonals} strokeWidth="1" />
      </Built>
      <Ring x={nodeX(5)} y={GROUND} />
    </>
  );
}

/** IV. Improve: the whole span stands and is measured. */
export function ImprovePlate() {
  const all = span(0, PANELS);
  return (
    <>
      <Banks solid />
      <Built>
        <path d={all.deck} />
        <path d={all.chord} />
        <path d={all.hangers} strokeWidth="1" />
        <path d={all.diagonals} strokeWidth="1" />
        <path d={`M${LEFT} 180 H${RIGHT}`} strokeWidth="1" />
        <path d={range(0, PANELS).map((i) => `M${nodeX(i)} 175 V185`).join(" ")} strokeWidth="1" />
      </Built>
      <Ring x={nodeX(4)} y={archY(4)} />
      <Ring x={nodeX(2)} y={GROUND} delay={120} />
      <Ring x={nodeX(6)} y={GROUND} delay={240} />
    </>
  );
}

/** One plate per step of src/data/process.ts, in order. */
export const METHOD_PLATES = [DiscoverPlate, DefinePlate, BuildPlate, ImprovePlate];
