import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type PlanPlateKind = "foundation" | "growth" | "scale" | "custom";

interface PlanPlateProps {
  kind: PlanPlateKind;
  className?: string;
}

/*
 * Scene coordinates: viewBox 0 0 400 128, drawn bottom-centred so the plate
 * can be any width (the rays and ground run on past the frame). The stack
 * is the hero's lower pyramid in miniature: slabs widening towards the
 * ground line at y 120.
 */
const CX = 200;
const GROUND = 120;
const SLAB = 22;
const GAP = 5;

/** Half-width of the stack at y: narrow at the top, widening to the base like the hero's tiers. */
const half = (y: number) => 22 + (y - 40) * 0.95;

const slabTop = (i: number, count: number) => GROUND - (count - i) * (SLAB + GAP) + GAP;

const slabPoints = (y0: number) => {
  const y1 = y0 + SLAB;
  return [
    [CX - half(y0), y0],
    [CX + half(y0), y0],
    [CX + half(y1), y1],
    [CX - half(y1), y1],
  ]
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
};

const round = (n: number) => Number(n.toFixed(1));

/** Each plate: how many slabs, how many of them built (from the ground up), and what stands behind them. */
const SCENES: Record<PlanPlateKind, { slabs: number; built: number; rays: number; arcs: number; ticks: boolean }> = {
  foundation: { slabs: 3, built: 1, rays: 0, arcs: 0, ticks: true },
  growth: { slabs: 3, built: 2, rays: 13, arcs: 1, ticks: false },
  scale: { slabs: 3, built: 3, rays: 31, arcs: 3, ticks: false },
  custom: { slabs: 4, built: 0, rays: 0, arcs: 0, ticks: true },
};

/**
 * The engraved plate at the head of a plan card: the hero's stack of slabs
 * under the bridge, built as far as the plan goes. Foundations lays the base
 * stone and pegs out the rest; growth has two courses up and a sun rising
 * behind them; scale stands complete under a full sunburst with arcs of
 * reach; the custom package is all drawn, its scope still to set. Colours
 * come from the card: --plate-ground, --plate-ink (lines), --plate-fill
 * (built slabs). Slabs rise into place in turn when revealed (motion.css
 * .rise-in).
 */
export function PlanPlate({ kind, className }: PlanPlateProps) {
  const scene = SCENES[kind];
  const rays = Array.from({ length: scene.rays }, (_, i) => Math.PI + (Math.PI * (i + 1)) / (scene.rays + 1));

  return (
    <div aria-hidden="true" className={cn("relative h-32 overflow-hidden bg-(--plate-ground)", className)}>
      {/* Engraved ground: fine hairlines across the whole plate. */}
      <div className="pp-engraving absolute inset-0" />
      <svg
        viewBox="0 0 400 128"
        preserveAspectRatio="xMidYMax meet"
        data-reveal=""
        suppressHydrationWarning
        className="absolute inset-0 size-full overflow-visible text-(--plate-ink)"
      >
        {rays.map((a, i) => (
          <line
            key={`ray-${i}`}
            x1={round(CX + Math.cos(a) * 64)}
            y1={round(GROUND + Math.sin(a) * 64)}
            x2={round(CX + Math.cos(a) * 520)}
            y2={round(GROUND + Math.sin(a) * 520)}
            stroke="currentColor"
            strokeOpacity={i % 2 ? 0.18 : 0.34}
            strokeWidth={i % 2 ? 0.6 : 0.9}
          />
        ))}
        {Array.from({ length: scene.arcs }, (_, i) => {
          const r = 96 + i * 30;
          return (
            <path
              key={`arc-${i}`}
              d={`M${CX - r} ${GROUND} A${r} ${r} 0 0 1 ${CX + r} ${GROUND}`}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.45 - i * 0.1}
              strokeDasharray="1.5 3.5"
            />
          );
        })}

        <line x1={-1200} x2={1600} y1={GROUND + 0.5} y2={GROUND + 0.5} stroke="currentColor" strokeOpacity={0.6} />
        {scene.ticks
          ? Array.from({ length: 161 }, (_, i) => {
              const x = CX - 800 + i * 10;
              return (
                <line
                  key={`tick-${i}`}
                  x1={x}
                  x2={x}
                  y1={GROUND}
                  y2={GROUND - (i % 5 ? 3 : 6)}
                  stroke="currentColor"
                  strokeOpacity={0.4}
                  strokeWidth={0.7}
                />
              );
            })
          : null}

        {Array.from({ length: scene.slabs }, (_, i) => {
          const y0 = slabTop(i, scene.slabs);
          const built = i >= scene.slabs - scene.built;
          const lines = Math.floor(SLAB / 3.5);
          return (
            <g key={i} className="rise-in" style={{ "--i": scene.slabs - 1 - i } as CSSProperties}>
              <polygon
                points={slabPoints(y0)}
                fill={built ? "var(--plate-fill)" : "none"}
                stroke="currentColor"
                strokeOpacity={built ? 0.9 : 0.6}
                strokeWidth={built ? 1 : 0.9}
                strokeDasharray={built ? undefined : "2.5 2.5"}
              />
              {built
                ? Array.from({ length: lines }, (_, k) => {
                    const y = y0 + 4 + k * 3.5;
                    return (
                      <line
                        key={k}
                        x1={round(CX - half(y) + 3)}
                        x2={round(CX + half(y) - 3)}
                        y1={y}
                        y2={y}
                        stroke="var(--plate-ground)"
                        strokeOpacity={0.22}
                        strokeWidth={0.6}
                      />
                    );
                  })
                : null}
              {/* The lit edge along each built slab's top, as on the hero's tiers. */}
              {built ? (
                <line
                  x1={round(CX - half(y0) + 3)}
                  x2={round(CX + half(y0) - 3)}
                  y1={y0 + 2}
                  y2={y0 + 2}
                  stroke="var(--plate-ground)"
                  strokeOpacity={0.5}
                  strokeWidth={0.8}
                />
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
