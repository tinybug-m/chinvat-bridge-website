import type { CSSProperties } from "react";
import { Mark } from "@/components/brand/Mark";
import { ButtonLink } from "@/components/system/Button";
import { Container } from "@/components/system/Container";
import { HERO_COPY } from "./content";
import Link from "next/link";
import { CROSSING_COPY, TIERS } from "./crossing-content";
import "./crossing.css";

/*
 * The homepage hero, THE CROSSING (it began as a hero study). Drawn like the old hourglass charts of being: an
 * engraved inverted triangle (complex challenges: a tangle in a sunburst)
 * narrows to the waist, where the mark stands in its halo as the bridge,
 * and widens into four engraved tiers, one per discipline. Dotted
 * brackets on the left name the two halves; the copy on the right sits
 * level with the bridge.
 *
 * Each tier is a link to its service (an HTML hit area over the chart, see
 * .cx-link). The logo material is held back for the crossing itself: it
 * runs down the tiers once after the intro, and a tier takes it while its
 * link is hovered or focused (.cx:has rules in crossing.css).
 *
 * Chart coordinates: viewBox 0 -34 540 934. Shapes are centred on x = 320
 * (the bracket takes x < 90); the triangle runs y 0 to 330, the waist to
 * 480, four tiers of 105 below.
 */

const CX = 320;
const TOP = { y: 330, half: 220 };
const WAIST = { y: 405 };
const TIER = { y: 480, step: 105, gap: 8 };
const SUN = { y: 118, r: 70 };

/** Half-width of the lower pyramid at y (its sides meet at y = 420). */
const half = (y: number) => (220 * (y - 420)) / 480;
const tierTop = (i: number) => TIER.y + i * TIER.step;
const tierPoints = (i: number) => {
  const y0 = tierTop(i);
  const y1 = y0 + TIER.step - TIER.gap;
  return `${CX - half(y0)},${y0} ${CX + half(y0)},${y0} ${CX + half(y1)},${y1} ${CX - half(y1)},${y1}`;
};

/** Chrome stops (tokens.css --material-fill, flattened to one gradient). */
const CHROME = [
  [0, "#05070a"],
  [0.12, "#1e82ff"],
  [0.24, "#2a3038"],
  [0.36, "#6ed7ff"],
  [0.46, "#06080b"],
  [0.58, "#f59123"],
  [0.7, "#3a414a"],
  [0.82, "#1e82ff"],
  [0.92, "#ffcd78"],
  [1, "#05070a"],
] as const;

const TANGLE = (() => {
  const points: string[] = [];
  for (let k = 0; k <= 480; k++) {
    const t = (k / 480) * Math.PI * 2;
    const x = CX + 36 * Math.sin(3 * t) + 20 * Math.sin(7 * t + 0.6);
    const y = SUN.y + 34 * Math.cos(2 * t) + 19 * Math.cos(9 * t + 1.1);
    points.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M${points.join("L")}Z`;
})();

const RAYS = Array.from({ length: 60 }, (_, i) => (i * Math.PI * 2) / 60);
const HALO = Array.from({ length: 48 }, (_, i) => (i * Math.PI * 2) / 48);

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
const rise = (ms: number) => ({ "--intro-delay": `${ms}ms` }) as CSSProperties;
const round = (n: number) => Number(n.toFixed(2));

export function CrossingHero() {
  return (
    <section
      data-hero
      aria-labelledby="hero-title"
      className="relative overflow-x-clip"
    >
      <Container className="@container pt-[calc(4rem+2.25rem)] pb-12 lg:pt-[calc(4.5rem+2.5rem)] lg:pb-14">
        <div className="cx">
          <div className="cx-text">
            <div className="cx-copy lg:border-t lg:border-ink lg:pt-6">
              <p className="intro-rise text-small text-ink-muted">
                {HERO_COPY.eyebrow}
              </p>
              <h1
                id="hero-title"
                className="intro-rise mt-5 font-display text-[clamp(2.5rem,1.6rem+3.2vw,4rem)] leading-[0.98] font-medium tracking-[-0.025em] [font-stretch:100%] xl:[font-stretch:112%]"
              >
                <span className="block font-normal">
                  {CROSSING_COPY.title[0]}
                </span>{" "}
                <span className="block font-semibold">
                  {CROSSING_COPY.title[1]}
                </span>
              </h1>
              <p
                className="intro-rise mt-5 max-w-[30rem] text-lede text-pretty text-ink-soft"
                style={rise(120)}
              >
                {CROSSING_COPY.lede}
              </p>
            </div>

            <div
              className="intro-rise mt-8 mb-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:mt-10 lg:mb-0"
              style={rise(200)}
            >
              <ButtonLink
                href={HERO_COPY.primary.href}
                size="lg"
                arrow="right"
                className="w-full sm:w-auto"
              >
                {HERO_COPY.primary.label}
              </ButtonLink>
              <ButtonLink
                href={HERO_COPY.secondary.href}
                size="lg"
                variant="secondary"
                arrow="down"
                className="w-full sm:w-auto"
              >
                {HERO_COPY.secondary.label}
              </ButtonLink>
            </div>
          </div>

          <div className="cx-chart">
            <Chart />
            {/* The bridge: the real mark, centred on the waist. */}
            <div
              className="cx-in absolute"
              style={{
                left: `${((CX - 46) / 540) * 100}%`,
                top: `${((WAIST.y + 34 - 45) / 934) * 100}%`,
                width: `${(92 / 540) * 100}%`,
                ...delay(500),
              }}
            >
              <Mark priority title="Chinvat Bridge" />
            </div>
            {/* The foot of the pyramid: the energy wire into Services starts here (EnergyFlow). */}
            <span
              aria-hidden="true"
              data-energy-origin=""
              className="absolute h-0 w-px"
              style={{
                left: `${(CX / 540) * 100}%`,
                top: `${((tierTop(3) + TIER.step - TIER.gap + 34) / 934) * 100}%`,
              }}
            />

            {/* The tiers are the links: each hit area covers its tier and lights it. */}
            <nav aria-label="Disciplines">
              <ul>
                {TIERS.map((item, i) => {
                  const y0 = tierTop(i);
                  const a = half(y0 + TIER.step - TIER.gap);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={item.label}
                        data-i={i}
                        className="cx-link"
                        style={
                          {
                            "--l": CX - a,
                            "--w": a * 2,
                            "--y": y0,
                            "--h": TIER.step - TIER.gap,
                          } as CSSProperties
                        }
                      >
                        <span className="sr-only">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Chart() {
  const top = `${CX - TOP.half},0 ${CX + TOP.half},0 ${CX},${TOP.y}`;
  return (
    <svg
      viewBox="0 -34 540 934"
      aria-hidden="true"
      className="absolute inset-0 size-full overflow-visible"
    >
      <defs>
        <clipPath id="cx-top">
          <polygon points={top} />
        </clipPath>
        {TIERS.map((item, i) => (
          <clipPath key={item.href} id={`cx-tier-${i}`}>
            <polygon points={tierPoints(i)} />
          </clipPath>
        ))}
        {/* The mark's liquid chrome, as far as one SVG gradient carries it: gunmetal with oil-slick pools. */}
        <linearGradient
          id="cx-chrome"
          gradientUnits="userSpaceOnUse"
          x1="100"
          y1="480"
          x2="540"
          y2="900"
        >
          {CHROME.map(([offset, color]) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </linearGradient>
        {/* Engraved light: the middle of each tier is lit, the flanks fall away. */}
        <linearGradient id="cx-lit" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="var(--color-paper)" stopOpacity="0" />
          <stop offset="0.5" stopColor="var(--color-paper)" stopOpacity="0.1" />
          <stop offset="1" stopColor="var(--color-paper)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Complex challenges: an engraved tangle in a sunburst. */}
      <g className="cx-in">
        <polygon points={top} fill="var(--color-ink)" />
        <g clipPath="url(#cx-top)" stroke="var(--color-paper)">
          {Array.from({ length: 66 }, (_, i) => (
            <line
              key={i}
              x1={CX - TOP.half}
              x2={CX + TOP.half}
              y1={i * 5}
              y2={i * 5}
              strokeOpacity="0.07"
              strokeWidth="0.8"
            />
          ))}
          {RAYS.map((a, i) => (
            <line
              key={i}
              x1={round(CX + Math.cos(a) * (SUN.r + 6))}
              y1={round(SUN.y + Math.sin(a) * (SUN.r + 6))}
              x2={round(CX + Math.cos(a) * 420)}
              y2={round(SUN.y + Math.sin(a) * 420)}
              strokeOpacity={i % 2 ? 0.25 : 0.55}
              strokeWidth={i % 2 ? 0.6 : 1}
            />
          ))}
        </g>
        <circle
          cx={CX}
          cy={SUN.y}
          r={SUN.r}
          fill="var(--color-ink)"
          stroke="var(--color-paper)"
          strokeWidth="1.4"
        />
        <circle
          cx={CX}
          cy={SUN.y}
          r={SUN.r - 6}
          fill="none"
          stroke="var(--color-paper)"
          strokeOpacity="0.4"
          strokeDasharray="1.5 3"
        />
        <path
          d={TANGLE}
          fill="none"
          stroke="var(--color-paper)"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
      </g>

      {/* The halo the mark stands in (the mark itself is HTML, over this). */}
      <g className="cx-in" style={delay(400)} stroke="var(--color-ink)">
        {HALO.map((a, i) => (
          <line
            key={i}
            x1={round(CX + Math.cos(a) * 52)}
            y1={round(WAIST.y + Math.sin(a) * 52)}
            x2={round(CX + Math.cos(a) * (i % 2 ? 61 : 67))}
            y2={round(WAIST.y + Math.sin(a) * (i % 2 ? 61 : 67))}
            strokeOpacity="0.55"
            strokeWidth="0.9"
          />
        ))}
      </g>

      {/* Intelligent technology: four engraved tiers, one per discipline. */}
      {TIERS.map((item, i) => {
        const y0 = tierTop(i);
        const y1 = y0 + TIER.step - TIER.gap;
        const a = half(y0);
        return (
          <g key={item.href} className="cx-in" style={delay(800 + i * 110)}>
            <g className="cx-tier" data-i={i}>
              <polygon points={tierPoints(i)} fill="var(--color-ink)" />
              <g clipPath={`url(#cx-tier-${i})`}>
                <rect
                  x={CX - 220}
                  y={y0}
                  width="440"
                  height={y1 - y0}
                  fill="url(#cx-lit)"
                />
                {Array.from({ length: Math.floor((y1 - y0) / 4) }, (_, k) => (
                  <line
                    key={k}
                    x1={CX - 220}
                    x2={CX + 220}
                    y1={y0 + 6 + k * 4}
                    y2={y0 + 6 + k * 4}
                    stroke="var(--color-paper)"
                    strokeOpacity="0.08"
                    strokeWidth="0.7"
                  />
                ))}
                {/* The logo material: run once after the intro, held while hovered. */}
                <g className="cx-glow" style={{ "--i": i } as CSSProperties}>
                  <rect
                    x={CX - 220}
                    y={y0}
                    width="440"
                    height={y1 - y0}
                    fill="url(#cx-chrome)"
                  />
                </g>
              </g>
              <line
                x1={CX - a + 5}
                x2={CX + a - 5}
                y1={y0 + 3.5}
                y2={y0 + 3.5}
                stroke="var(--color-paper)"
                strokeOpacity="0.35"
                strokeWidth="0.8"
              />
              <text
                x={CX}
                y={(y0 + y1) / 2 - 4}
                className="cx-caps cx-tier-name font-display"
                fontSize={19 + i * 2}
                style={{ "--fs": 19 + i * 2 } as CSSProperties}
                fill="var(--color-paper)"
                textAnchor="middle"
                dominantBaseline="middle"
                letterSpacing="0.12em"
              >
                {item.short}
              </text>
              <path
                className="cx-chevron"
                d={`M${CX - 5} ${(y0 + y1) / 2 + 17 + i}l5 5l5 -5`}
                fill="none"
                stroke="var(--color-paper)"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </g>
        );
      })}

      <Bracket />
    </svg>
  );
}

/** The dotted brackets: one per half, crossing at the bridge, with a lead to the halo. */
function Bracket() {
  const dashed = {
    fill: "none",
    stroke: "var(--color-ink)",
    strokeWidth: 1.2,
    strokeDasharray: "2 4",
  } as const;
  const label = {
    className: "cx-caps font-display max-lg:hidden",
    fontSize: 14,
    fill: "var(--color-ink)",
    textAnchor: "middle",
  } as const;
  return (
    <g className="cx-in" style={delay(300)}>
      <path d="M62 0 H44 V382 L64 428 M64 382 L44 428 V894 H62" {...dashed} />
      <path d={`M64 ${WAIST.y} H${CX - 80}`} {...dashed} />
      <text
        {...label}
        transform={`translate(28 ${TOP.y / 2 + 20}) rotate(-90)`}
      >
        {CROSSING_COPY.above}
      </text>
      <text
        {...label}
        transform={`translate(28 ${(TIER.y + 900) / 2}) rotate(-90)`}
      >
        {CROSSING_COPY.below}
      </text>
    </g>
  );
}
