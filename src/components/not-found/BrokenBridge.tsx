"use client";

import { useEffect, useRef, useState } from "react";
import { FarPlinth, Fades, NearBlock, NearStep, SLAB, Stone } from "@/components/home/method/MethodDiagrams";
import {
  boardPoint,
  builtPose,
  deckOutline,
  hingedPose,
  inlayAt,
  inlayPath,
  type Pose,
  SLAB_DIMENSIONS,
  solidFaces,
  STONE,
  STONE_BOARD,
} from "@/components/home/method/stonePlates";
import { random } from "@/components/three/scenes/bridge/math";
import "./broken-bridge.css";

/*
 * The 404: the Approach bridge with a span gone. Three slabs have fallen; the
 * slab before them hangs from its joint with the near deck, the one after
 * them droops from the far deck, and the span they made is left as a drawing,
 * measured between the edges that still stand.
 *
 * The SVG is rendered broken, so no JavaScript and reduced motion show the
 * finished picture. With motion, the bridge first stands whole, shakes, and
 * gives way: the falling slabs and chunks are real boxes projected through
 * the Approach camera every frame (stonePlates.ts), so they turn in depth.
 */

const UID = "broken-bridge";
const FALLEN = [5, 6, 7];
/** The torn slabs either side of the fallen ones, each hinged at the joint it keeps. */
const NEAR_HANG = FALLEN[0] - 1;
const FAR_HANG = FALLEN[FALLEN.length - 1] + 1;
const FAR_FROM = FAR_HANG + 1;
const { length: L, thickness: T, depth: D } = SLAB_DIMENSIONS;
/** Below the board, room for the fall before it fades out. */
const FALL_ROOM = 24;
const VIEW = `0 0 ${STONE_BOARD.width} ${STONE_BOARD.height + FALL_ROOM}`;

/* Timeline, ms from the start of the break. */
const HOLD = 700;
const TREMOR = 520;
const SETTLED = 3800;
const GRAVITY = 10;

type Vec3 = [number, number, number];

interface Body {
  pose: Pose;
  size?: Vec3;
  opacity: number;
}

interface Faller {
  from: Pose;
  size?: Vec3;
  /** Release time (ms) after the tremor, velocities per second. */
  at: number;
  v: Vec3;
  spin: Vec3;
}

const FALLERS: Faller[] = [
  { from: builtPose(FALLEN[0]), at: 40, v: [-0.3, 0.3, 0.4], spin: [0.55, -0.3, -1.6] },
  { from: builtPose(FALLEN[1]), at: 0, v: [0.05, 0.1, -0.2], spin: [-0.25, 0.4, 0.5] },
  { from: builtPose(FALLEN[2]), at: 90, v: [0.35, 0.25, -0.3], spin: [-0.45, 0.3, 1.2] },
];

interface Hinge {
  index: number;
  /** The joint it keeps: -1 near, 1 far. */
  end: -1 | 1;
  /** Resting angle (radians), release time after the tremor (ms), spring stiffness and damping. */
  rest: number;
  at: number;
  k: number;
  c: number;
}

const HINGES: Hinge[] = [
  { index: NEAR_HANG, end: -1, rest: -0.95, at: 30, k: 38, c: 3.4 },
  { index: FAR_HANG, end: 1, rest: 0.2, at: 110, k: 80, c: 6.5 },
];

/** Chunks off both broken edges, the same on every visit. */
const CHUNKS: Faller[] = (() => {
  const rand = random(404);
  const spread = (span: number) => (rand() - 0.5) * span;
  const edges = [builtPose(NEAR_HANG), builtPose(FAR_HANG)];
  return Array.from({ length: 16 }, (_, index) => {
    const edge = edges[index % 2];
    const side = index % 2 === 0 ? 1 : -1;
    const size: Vec3 = [0.18 + rand() * 0.32, 0.14 + rand() * 0.26, 0.18 + rand() * 0.36];
    return {
      from: {
        ...edge,
        x: edge.x + side * (L / 2 + 0.05 - rand() * 0.25),
        y: edge.y + spread(T * 0.8),
        z: spread(D * 0.9),
        roll: rand() * 3,
        pitch: rand() * 3,
        sx: 1,
        sy: 1,
        sz: 1,
      },
      size,
      at: rand() * 260,
      v: [side * (0.2 + rand() * 0.9), 0.4 + rand() * 1.6, spread(1.4)],
      spin: [spread(9), spread(9), spread(9)],
    };
  });
})();

function fallen({ from, at, v, spin, size }: Faller, ms: number): Body | null {
  const t = Math.max(0, ms - TREMOR - at) / 1000;
  const drop = 0.5 * GRAVITY * t * t - v[1] * t;
  const opacity = 1 - Math.min(1, Math.max(0, (drop - 1.5) / 8));
  if (opacity <= 0) return null;
  return {
    pose: {
      ...from,
      x: from.x + v[0] * t,
      y: from.y - drop,
      z: from.z + v[2] * t,
      pitch: from.pitch + spin[0] * t,
      yaw: from.yaw + spin[1] * t,
      roll: from.roll + spin[2] * t,
    },
    size,
    opacity,
  };
}

/** A torn slab's swing: a damped spring released after the tremor, integrated once and looked up per frame. */
function swing({ rest, at, k, c }: Hinge) {
  const step = 1000 / 240;
  const angles: number[] = [];
  let angle = 0;
  let speed = 0;
  for (let ms = 0; ms <= SETTLED; ms += step) {
    if (ms < TREMOR + at) {
      // It sags a little as the span starts to go.
      angle = Math.sign(rest) * 0.04 * Math.min(1, ms / TREMOR);
    } else {
      speed += (-k * (angle - rest) - c * speed) * (step / 1000);
      angle += speed * (step / 1000);
    }
    angles.push(angle);
  }
  return (ms: number) => angles[Math.min(angles.length - 1, Math.max(0, Math.round(ms / step)))];
}

const SWINGS = HINGES.map(swing);

function frame(ms: number): Body[] {
  const shake = ms < TREMOR ? (ms / TREMOR) * 0.04 : 0;
  const bodies: Body[] = [];
  const pieces = ms < TREMOR ? FALLERS.map((faller, index) => {
    const pose = { ...faller.from };
    pose.y += shake * Math.sin(ms * 0.11 + index * 2.1);
    pose.roll += shake * 0.4 * Math.sin(ms * 0.07 + index);
    return { pose, opacity: 1 };
  }) : [...FALLERS, ...CHUNKS].map((faller) => fallen(faller, ms)).filter((body): body is Body => body !== null);
  HINGES.forEach((hinge, index) => bodies.push({ pose: hingedPose(hinge.index, SWINGS[index](ms), hinge.end), opacity: 1 }));
  bodies.push(...pieces);
  // Far to near along the path, so nearer stone paints over farther.
  return bodies.sort((a, b) => b.pose.x - a.pose.x);
}

const FILL = { top: SLAB.top, face: SLAB.face, end: SLAB.end } as const;

function markup(bodies: Body[]) {
  return bodies
    .map(({ pose, size, opacity }) => {
      const faces = solidFaces(pose, size)
        .map(({ role, d }) => `<path d="${d}" fill="${FILL[role]}"/>`)
        .join("");
      const inlay = size ? null : inlayAt(pose);
      const line = inlay ? `<path d="${inlay}" stroke="var(--color-saffron-500)" stroke-width="1.75" fill="none"/>` : "";
      return `<g opacity="${opacity.toFixed(3)}" stroke="${SLAB.edge}" stroke-width="1" stroke-linejoin="round">${faces}${line}</g>`;
    })
    .join("");
}

const BROKEN = markup(frame(SETTLED));

/* The gauge across the gap: between the joints that still hold, either side of it. */
const corner = (index: number, end: -1 | 1, rise = 0) => {
  const pose = builtPose(index);
  return boardPoint({ ...pose, y: pose.y + rise }, [(end * L) / 2, T / 2, 0]);
};
const GAUGE_RISE = 1.5;
const FEET = [corner(NEAR_HANG, -1), corner(FAR_FROM, -1)];
const HEADS = [corner(NEAR_HANG, -1, GAUGE_RISE), corner(FAR_FROM, -1, GAUGE_RISE)];
const PLAN = deckOutline(NEAR_HANG, FAR_HANG, false);

type Phase = "standing" | "breaking" | "broken";

export function BrokenBridge({ className }: { className?: string }) {
  const bodies = useRef<SVGGElement>(null);
  const [phase, setPhase] = useState<Phase | undefined>(undefined);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layer = bodies.current;
    if (!layer) return;

    let raf = 0;
    let start = 0;
    layer.innerHTML = markup(frame(0));
    setPhase("standing");

    const tick = (now: number) => {
      if (!start) start = now;
      const ms = now - start;
      layer.innerHTML = markup(frame(ms));
      if (ms < SETTLED) raf = requestAnimationFrame(tick);
      else {
        layer.innerHTML = BROKEN;
        setPhase("broken");
      }
    };
    const timer = window.setTimeout(() => {
      setPhase("breaking");
      raf = requestAnimationFrame(tick);
    }, HOLD);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={VIEW}
      data-phase={phase}
      className={`broken-bridge block h-auto w-full overflow-visible ${className ?? ""}`}
    >
      <Fades uid={UID} />
      <g stroke="currentColor" fill="none">
        <FarPlinth uid={UID} />
        {/* The far deck, far to near; its first slab shows the end the fallen span used to cover. */}
        {STONE.built
          .map((faces, index) => ({ faces, index }))
          .slice(FAR_FROM)
          .reverse()
          .map(({ faces, index }) => (
            <Stone key={index} faces={faces} end={index === FAR_FROM ? undefined : false} />
          ))}
        <path d={inlayPath(FAR_FROM, STONE.count - 1)} stroke="var(--color-saffron-500)" strokeWidth="1.75" />
      </g>

      {/* The span as drawn: what should stand in the gap. */}
      <g className="bb-plan text-control" fill="none" stroke="currentColor">
        <path d={PLAN.edges} strokeWidth="1" strokeDasharray="4 4" strokeLinejoin="round" />
        <path d={PLAN.joints} strokeWidth="0.9" strokeDasharray="1.5 4" />
        <path d={inlayPath(NEAR_HANG, FAR_HANG)} strokeDasharray="4 4" strokeWidth="1.1" />
      </g>

      <g ref={bodies} dangerouslySetInnerHTML={{ __html: BROKEN }} />

      <g fill="none" stroke="currentColor">
        {STONE.built
          .slice(0, NEAR_HANG)
          .map((faces, index) => ({ faces, index }))
          .reverse()
          .map(({ faces, index }) => (
            <g key={index}>
              {index === 0 && <NearStep uid={UID} />}
              <Stone faces={faces} end={index === 0 ? undefined : false} />
            </g>
          ))}
        <path d={inlayPath(0, NEAR_HANG - 1)} stroke="var(--color-saffron-500)" strokeWidth="1.75" />
        <NearBlock uid={UID} />
      </g>

      {/* The gap, measured from both broken edges. */}
      <g className="bb-gauge text-ink-muted" fill="none" stroke="currentColor" strokeWidth="1">
        <path d={`M${HEADS[0].join(" ")} L${HEADS[1].join(" ")}`} strokeDasharray="4 4" />
        {FEET.map((foot, index) => (
          <path key={index} d={`M${foot.join(" ")} L${HEADS[index].join(" ")}`} />
        ))}
        {FEET.map((foot, index) => (
          <circle
            key={index}
            className="bb-ring"
            cx={foot[0]}
            cy={foot[1]}
            r="6"
            stroke="var(--color-saffron-500)"
            strokeWidth="1.5"
            fill={SLAB.top}
            style={{ transitionDelay: `${650 + index * 140}ms` }}
          />
        ))}
      </g>
    </svg>
  );
}
