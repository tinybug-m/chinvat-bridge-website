import { CAPABILITIES } from "@/data/capabilities";
import { SUPPORTING_CAPABILITIES } from "@/data/services";

/**
 * The capabilities lattice: four disciplines on a top rail, the six
 * capabilities in the middle, the supporting capabilities on a bottom rail,
 * joined by struts that form triangles, as in the mark. The connections are
 * illustrative. Decorative: the list beside it carries the content.
 *
 * Highlighting is CSS only (capabilities.css): every strut, chip and node
 * carries `data-c`, the indices of the capabilities it belongs to.
 */

const DISCIPLINES = ["AI", "Automation", "Software", "SEO"] as const;

/** Capability index (0-5) to the disciplines it serves. */
const TOP_LINKS: number[][] = [[0], [0, 1], [1, 2], [1, 2], [2, 3], [3]];
/** Capability index to the supporting capabilities that serve it. */
const BOTTOM_LINKS: number[][] = [[0], [0], [1], [1, 2], [2, 3], [3]];

const unique = (values: number[]) => [...new Set(values)].sort((a, b) => a - b);
const tokens = (values: number[]) => unique(values).join(" ");

/** Capabilities that connect to each discipline / supporting node. */
const DISCIPLINE_CAPS = DISCIPLINES.map((_, d) => TOP_LINKS.flatMap((links, c) => (links.includes(d) ? [c] : [])));
const SUPPORT_CAPS = SUPPORTING_CAPABILITIES.map((_, s) =>
  BOTTOM_LINKS.flatMap((links, c) => (links.includes(s) ? [c] : [])),
);

/** Splits a title over two lines at its first space. */
function twoLines(text: string): [string, string] {
  const at = text.indexOf(" ");
  return at === -1 ? [text, ""] : [text.slice(0, at), text.slice(at + 1)];
}

interface Geometry {
  width: number;
  height: number;
  captionY: [number, number, number];
  discX: number[];
  discY: number;
  capX: number[];
  capY: number;
  /** Half the height of a capability node. */
  capHalf: number;
  supX: number[];
  supY: number;
}

const WIDE: Geometry = {
  width: 720,
  height: 590,
  captionY: [22, 244, 458],
  discX: [90, 270, 450, 630],
  discY: 112,
  capX: [60, 180, 300, 420, 540, 660],
  capY: 300,
  capHalf: 36,
  supX: [90, 270, 450, 630],
  supY: 494,
};

const NARROW: Geometry = {
  width: 350,
  height: 520,
  captionY: [18, 222, 398],
  discX: [43, 131, 219, 307],
  discY: 100,
  capX: [29, 87, 145, 203, 261, 319],
  capY: 280,
  capHalf: 14,
  supX: [43, 131, 219, 307],
  supY: 440,
};

const NODE_R = 8;
const SMALL_R = 6;

export function Lattice({ variant }: { variant: "wide" | "narrow" }) {
  const wide = variant === "wide";
  const g = wide ? WIDE : NARROW;
  const strutStart = g.discY + NODE_R;
  const capTop = g.capY - g.capHalf;
  const capBottom = g.capY + g.capHalf;
  const supEnd = g.supY - SMALL_R;
  const seamX = g.width / 2;

  return (
    <svg
      viewBox={`0 0 ${g.width} ${g.height}`}
      focusable="false"
      aria-hidden="true"
      className={wide ? "hidden size-full md:block" : "block size-full md:hidden"}
    >
      {/* Construction: rails, ticks and the seam with its ring node. */}
      <g stroke="var(--color-line-strong)" strokeWidth="1" strokeDasharray="4 4" fill="none">
        <line x1="0" x2={g.width} y1={g.discY} y2={g.discY} />
        <line x1="0" x2={g.width} y1={g.supY} y2={g.supY} />
        {wide ? <line x1={seamX} x2={seamX} y1={g.captionY[0] + 14} y2={g.height} /> : null}
      </g>
      {wide ? (
        <circle cx={seamX} cy={g.capY} r="5.5" fill="var(--color-paper)" stroke="var(--color-saffron-500)" strokeWidth="2" />
      ) : null}

      {/* Struts, top rail to capabilities, capabilities to bottom rail. */}
      <g className="cap-struts" fill="none">
        {TOP_LINKS.flatMap((links, c) =>
          links.map((d) => (
            <line
              key={`t${c}-${d}`}
              className="cap-strut"
              data-c={c}
              x1={g.discX[d]}
              y1={strutStart}
              x2={g.capX[c]}
              y2={capTop}
            />
          )),
        )}
        {BOTTOM_LINKS.flatMap((links, c) =>
          links.map((s) => (
            <line
              key={`b${c}-${s}`}
              className="cap-strut"
              data-c={c}
              x1={g.capX[c]}
              y1={capBottom}
              x2={g.supX[s]}
              y2={supEnd}
            />
          )),
        )}
      </g>

      {/* Rail captions. */}
      {(["Disciplines", "Capabilities", "Supporting"] as const).map((caption, i) => (
        <text key={caption} x="0" y={g.captionY[i]} className="font-label cap-caption" fontSize="12">
          {caption.toUpperCase()}
        </text>
      ))}

      {/* Disciplines. */}
      {DISCIPLINES.map((name, d) => (
        <g key={name} data-c={tokens(DISCIPLINE_CAPS[d])} className="cap-node">
          <text x={g.discX[d]} y={g.discY - 22 - (!wide && d % 2 ? 20 : 0)} textAnchor="middle" className="font-label cap-label" fontSize="12">
            {name.toUpperCase()}
          </text>
          <circle cx={g.discX[d]} cy={g.discY} r={NODE_R} className="cap-ring" />
        </g>
      ))}

      {/* Capabilities. */}
      {CAPABILITIES.map((capability, c) => {
        const x = g.capX[c];
        const [first, second] = twoLines(capability.title);
        return (
          <g key={capability.title} data-c={c} className="cap-node cap-chip">
            {wide ? (
              <>
                <rect x={x - 50} y={capTop} width="100" height={capBottom - capTop} rx="2" className="cap-box" />
                <text x={x} y={g.capY - 14} textAnchor="middle" className="font-label cap-index" fontSize="12">
                  {capability.index}
                </text>
                <text x={x} y={g.capY + 6} textAnchor="middle" className="font-display cap-title" fontSize="15">
                  {first}
                </text>
                <text x={x} y={g.capY + 24} textAnchor="middle" className="font-display cap-title" fontSize="15">
                  {second}
                </text>
              </>
            ) : (
              <>
                <circle cx={x} cy={g.capY} r={g.capHalf} className="cap-box" />
                <text x={x} y={g.capY + 4} textAnchor="middle" className="font-label cap-index" fontSize="12">
                  {capability.index}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* Supporting capabilities. */}
      {SUPPORTING_CAPABILITIES.map((name, s) => {
        const [first, second] = twoLines(name);
        return (
          <g key={name} data-c={tokens(SUPPORT_CAPS[s])} className="cap-node">
            <circle cx={g.supX[s]} cy={g.supY} r={SMALL_R} className="cap-small" />
            {wide ? (
              <>
                <text x={g.supX[s]} y={g.supY + 30} textAnchor="middle" className="font-label cap-label" fontSize="12">
                  {first.toUpperCase()}
                </text>
                <text x={g.supX[s]} y={g.supY + 46} textAnchor="middle" className="font-label cap-label" fontSize="12">
                  {second.toUpperCase()}
                </text>
              </>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
