# Curve system: proposal

Status: prototype for review. Nothing in `src/` imports these files, nothing here is built or deployed, and no production component, path or animation was changed.

Open `index.html` directly, or serve the repository root (for example `python3 -m http.server`) and visit `/prototypes/curve-system/` to get the site's fonts.

| File | What it is |
| --- | --- |
| `index.html` | The prototype: families, the homepage wire routed both ways, the diagram connectors, motion, tokens |
| `curves.js` | Geometry core (pure): the turn, `fillet()`, path and curvature analysis |
| `router.js` | Proposed wire router: same inputs as `routeWire()`, built from the families |
| `layouts.js` | The wire's real inputs and current output, captured at 1440, 1024, 768 and 390 px |
| `capture.mjs` | Read-only capture script: `node prototypes/curve-system/capture.mjs http://localhost:3000` |
| `screenshots/` | Screenshots of the prototype |

## 1. Inventory of animated lines

**Homepage (production)**

| Line | Where | Technology | Geometry | Motion |
| --- | --- | --- | --- | --- |
| Energy wire | `home/services/energy/EnergyFlow.tsx`, `route.ts`, `energy.css` | Runtime-routed SVG, one path per hop, with a dashed track, an ink wire and three comet dashes | One cubic per curve with handles at 0.55 × the travel along each end's heading. Vertical lanes. A "corridor" fallback with two quarter circles at a fixed 32 px. Routed again on every resize | Scroll-scrubbed head (τ 110 ms), `stroke-dashoffset` draw, comets 16/44/84 px, a 900 ms port ring, plates hold the energy until built |
| Deck wire | `home/bridge/BridgeSeam.tsx`, `bridge.css` | SVG polyline, revealed by `clip-path` at the seam | The deck path projected by the 3D camera (straight segments) | Driven by the seam's eased value (τ 110 ms), head bead |
| Plate currents | `home/services/current.ts`, `current.css` | A cloned dash on every solid line of each Services plate | Inherits each diagram line | Each pulse takes 9% of a 7.6 s clock (0.68 s) whatever its length, linear. A powered plate's activation wave runs at 0.004 s per unit |
| Explore flows | `home/services/explore.css`, `diagrams.tsx` | `pathLength="100"`, dash `10 100` / `8 100` / `6 100` | AI spokes (straight), Automation route (elbows), SEO trace (polyline) | 2.4 s, 2.2 s and 3 s loops, linear: the speed follows the line's length |
| Automation run | `loop-morph.css` (`auto-pulse`) | Dash along `AUTO_RUN` | The same quadratic elbows | On the 7.6 s morph clock |
| Automation connectors | `diagrams.tsx` (`elbow()`) | Static paths that fade in (`mx-in`) | Orthogonal, with **quadratic** corners of "r 6" | Fade |
| AI spokes and rim, SEO stems and trace | `diagrams.tsx`, `loop-ai.css`, `loop-morph.css` | Scale and travel transforms | Straight lines and a data polyline | 7.6 s morph |
| Method plates | `home/method/MethodDiagrams.tsx`, `method.css` | `clip-path` wipes (one along the deck's axis), `grow-y`, `pop` | Projected deck, inlay, gauges and ruler (straight) | One-shot when the wire arrives, `--ease-drawn` |
| Hero bracket and orbits | `home/hero/CrossingHero.tsx`, `crossing.css` | Static dotted SVG, points on orbits rotated by CSS | Sharp, mitred bracket. Concentric circles (radii +130, +10 each ring) | 34 to 88 s orbits, 1100 ms chrome sweep down the tiers |

**Elsewhere:** the 404 broken bridge (`not-found/BrokenBridge.tsx`) uses static projected lines and a swinging slab, with no line drawing. The `.draw` helper in `styles/motion.css` and `.svc-fig .draw` are defined but no plate sets `draw`. `MarkDrawing` belongs to the hero studies, which are out of production.

**Shared code:** `motion.css` (reveal helpers), `loop.css` (plate clock), `tokens.css` (eases and durations). No shared geometry module exists. Corner shapes are written three times in three ways: `connector()` and the corridor in `route.ts`, and `elbow()` in `diagrams.tsx`.

## 2. What is inconsistent (measured)

Numbers come from the captured paths (`index.html` recomputes them live).

| Measure, whole wire | 1440 | 1024 | 768 | 390 |
| --- | --- | --- | --- | --- |
| Tightest bend, current | 12.5 px | 8.1 px | 5.0 px | 5.8 px |
| Widest bend, current | 240 px | 174 px | 152 px | 142 px |
| Distinct radii (within 10%), current | 9 | 9 | 10 | 13 |
| Curvature breaks at joins, current | 10 | 11 | 15 | 28 |
| Proposed: radius / distinct / breaks | 32 / 1 / 0 | 24 / 1 / 0 | 16 / 1 / 0 | 8 / 1 / 0 |

1. **No radius system.** Bend radii are a by-product of where the ports happen to be. One wire swings from 5 px to 152 px at 768 wide.
2. **Kinks in flattened S-curves.** `connector()` sizes both handles from the drop. When the lateral offset is large and the drop small (576 × 80 px at 768 wide, the AI to Automation hop), the peak radius collapses to 5 px.
3. **Hooks into side ports.** Down into a right-facing port, one handle comes from the drop and the other from the short horizontal room. The curve runs almost straight, then packs its whole turn into the last pixels (6 px radius on phones).
4. **Curvature steps at every join.** The cubics meet the straight lanes with non-zero curvature, and the corridor's quarter circles jump from zero to 1/32. The moving head's direction changes abruptly there.
5. **Mixed construction.** Organic Béziers for most hops, a fixed 32 px orthogonal corridor at some widths (the same hop changes character between widths), and quadratic parabola corners in the Automation diagram (12 units of radius at the ends, 4.2 at the apex).
6. **Radii that ignore scale.** The corridor turn is 32 px on a 390 px phone and on a 1440 px desktop.
7. **Motion speed follows length.** Ambient flows with `pathLength="100"` and one duration run at about 32 to 185 board units per second, with comet length set by line length. Plate pulses take 0.68 s on a 20-unit line and on a 376-unit line, a 15× spread in speed.

Consistent already, and kept: one follow smoothing (110 ms) for the wire and the seam, one arrival ring (900 ms ease-out-quart), and the drawn-to-built grammar (dashed track ahead, ink behind).

## 3. Principles

1. **Straight runs, measured turns.** Curvature belongs to turns, never to a whole hop.
2. **Transition curves only.** Every turn's curvature rises linearly from 0 to 1/R and back to 0, an Euler spiral (clothoid), the transition curve of railway and road alignment. Turns join straights with continuous curvature (G2), so nothing jolts.
3. **One radius per role.** Each role has one radius, derived from tokens the site already has.
4. **Three headings.** Down, across, and 45°. An S may be shallower than 45° for a small offset, never steeper. Diagonals stay parallel wherever they appear, echoing the Method deck.
5. **Lines live on the grid.** Vertical runs prefer the page margin's centre, the 12-column gutters (lg), the page's centre line, and the ports' own lines. Lane changes sit in the middle of the gap they cross.
6. **Arrive straight.** A straight lead of at least R/2 at every port. A port that cannot be reached that way is not used; every plate already offers a second port.
7. **Flow lines bend; notation lines don't.** Lines that carry the current (the wire, connectors, pulse routes) use the system. Brackets, gauges, rulers, data traces and projected stone keep their true corners and vertices by drafting convention.

## 4. Curve families

The **turn** is the only curved primitive. It is two mirrored cubics, fitted so curvature is linear in arc length (under 2% error up to 90°): apex depth `(0.66 + 0.06q²)·tan(θ/4)·e` from the vertex, first handle at `0.5 − 0.1q²` of the way to the second, with `q = θ / 90°`. A turn of peak radius R runs **1.85 R** along each leg at 90° and **0.81 R** at 45°. Everything else is a polyline filleted with turns.

| Family | Rule |
| --- | --- |
| Quarter turn | 90°, straight to straight, peak radius R. |
| Eighth turn | 45°, the entry into and exit from a diagonal. |
| Lane change | Between two vertical runs, at fixed R: a 45° diagonal when the drop allows (drop ≥ offset); a shallower S when the offset is too small for two 45° turns (the angle is solved so the diagonal just holds both turns); a level run with two quarter turns when the drop is shorter than the offset. Never a free-angle diagonal. |
| Port landing | Straight-to-curve: leave along the port's heading, turn, and arrive on a lead of at least R/2. No room means the other port. |
| Through-route | Chains of the above in one hop. Turns of the same hand are separated by at least R/2 of straight. Opposite turns may meet, because both have zero curvature there. |

## 5. Tokens

Geometry:

| Token | Rule | 390 / 768 / 1024 / 1440 |
| --- | --- | --- |
| `--curve-r-wire` | 4 px × round(0.1 × `--spacing-gutter`) | 8 / 16 / 24 / 32 px |
| `--curve-r-detail` | 6 board units (scales with the artwork, ≈ 6 to 10 px) | 6u |
| `--curve-transition` | euler (κ linear in s) | |
| `--curve-headings` | 0°, 45°, 90° (S may go shallower than 45°) | |
| `--curve-lead` | 0.5 R | 4 / 8 / 12 / 16 px |
| `--curve-gap` | 0.5 R between same-hand turns, 0 between reversing turns | 4 / 8 / 12 / 16 px |
| `--curve-clearance` | unchanged: 7 px under 640, 14 px above | |
| `--curve-lanes` | margin centre, gutters (lg), centre line, port lines; others allowed at a cost | |

Motion, kept separate (motion reads only path lengths):

| Token | Value |
| --- | --- |
| `--flow-speed-active` | 250 board units/s (about 400 px/s): the plate activation wave and its pulses, matching today's `WAVE_S` |
| `--flow-speed-ambient` | 120 px/s, replacing `pathLength="100"` plus a fixed duration |
| `--flow-comet` | 16 / 44 / 84 px at 1 / 0.45 / 0.22 for every travelling current |
| `--follow-tau` | 110 ms (unchanged, shared) |
| `--draw-speed` | 600 px/s, clamped to 400 to 1200 ms, `--ease-drawn` |
| `--arrive` | 900 ms `--ease-out-quart` (unchanged, shared) |

## 6. Prototype and screenshots

`index.html` has five parts:

- **Families**, with sliders. Lane change shows the angle adapting at fixed R. Port landing shows the hook and the rule. Each card has a curvature comb and a κ(s) plot.
- **The homepage wire.** Captured production paths beside the proposed router run live on the same inputs, at four widths. It offers side-by-side or overlay views, zoom per hop, combs, tight-bend and curvature-break markers, a run of the current, and metrics.
- **The Automation connectors**, quadratic against filleted.
- **Motion**: one duration against one speed. It follows OS reduced motion and has its own toggle.
- **The token table.**

Screenshots are in `screenshots/`:

- `overview.png`
- `families-1440.png`
- `families-390.png`
- `wire-1440-whole.png`
- `wire-390-whole.png`
- `wire-1440-hero-to-ai.png`
- `wire-768-ai-to-automation.png`
- `wire-390-ai-to-automation.png`
- `wire-1024-define-to-build.png`
- `wire-768-seo-to-approach-overlay.png`
- `diagram-connectors.png`
- `motion.png`
- `tokens.png`
- `prototype-on-a-phone.png`

## 7. Validation

| Criterion | Result |
| --- | --- |
| Geometric consistency | One radius per width across the whole wire (current: 9 to 13 distinct). One turn shape everywhere. |
| Smoothness | Zero curvature or tangent breaks (current: 10 to 28 curvature breaks per wire). No bend tighter than R. |
| Visual rhythm | Parallel 45° diagonals, verticals on grid lanes, lane changes centred in their gaps. Lobes of curvature per wire go down (for example 23 to 21 at 1440 and 29 to 22 at 768). |
| Responsiveness | R follows the page margin. All nine hops route clear of the text and artwork at the token radius at every captured width, with no fallback needed. |
| Maintainability | One primitive and one fillet, shared by the wire and the diagrams. Tokens derive from existing ones. Topology, geometry and motion are separate layers. |
| Fit with the design language | Drafting and engineering register; the drawn-to-built grammar, colours and comet are unchanged. Notation lines stay sharp. |
| Performance | Routing the whole wire takes 12 to 50 ms on this machine (Node and Chromium). The current router was not timed for comparison. Each turn adds one cubic to the path. Nothing per-frame changes. |
| Accessibility | Reduced motion is unchanged in principle: lines drawn built, nothing travels. The geometry is static and decorative (`aria-hidden`). |
| Cost | Routes are about 6 to 13% longer (390: +6%, 768: +10%, 1024: +13%, 1440: +10%). The scroll keys absorb this, because the head's speed comes from scrolling. |

## 8. Plan for a production rollout (after approval)

1. **Geometry module.** Add `src/lib/curves/` (`turn`, `fillet`, `toPath`, sampling and length tables) from `curves.js`, in TypeScript. Unit-test the invariants: zero end curvature, peak radius equals R, no tangent breaks, fillet rejection when a run is too short.
2. **Tokens.** Add the geometry and motion tokens to `tokens.css`, and a TS mirror. EnergyFlow already measures the page margin, so R comes from that measurement.
3. **Router.** Replace `connector()` and the corridor in `route.ts` with the polyline search and `fillet()`, keeping its interface (`Wire`, `segments`, `arrivals`, `keys`) so `EnergyFlow.tsx` needs no change. Carry over the port-heading check, own-artwork rules, penalties and the bounding cull. Run the e2e suite and `shoot.mjs` at four sizes, with and without reduced motion.
4. **Diagrams.** Build the Automation connectors and `AUTO_RUN` from one filleted polyline at `--curve-r-detail`, so the static lines, the pulse and the explore run share geometry.
5. **Motion.** Derive plate pulse durations from line length at `--flow-speed-active` (`current.ts` already measures lengths). Replace `pathLength="100"` explore flows with real lengths at `--flow-speed-ambient` and the shared comet.
6. **QA.** Visual comparison at 390, 768, 1024 and 1440, a relayout performance trace during a window drag, and a reduced-motion pass.

Steps 1 to 3 can ship alone. Steps 4 and 5 are independent of each other.

## 9. Decisions for the owner

- **Direction.** Octilinear (0/45/90° with Euler turns, as prototyped), orthogonal only (no diagonals: more circuit-like), or keep free-angle curves and only fix radii and continuity (less change, less coherence). The recommendation is octilinear.
- **Radius scale** 8 / 16 / 24 / 32 px, tied to the margin.
- **Scope.** Whether the Automation connectors and the motion tokens join the first rollout or follow it.
