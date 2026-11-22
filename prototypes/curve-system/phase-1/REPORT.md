# Curve system, Phase 1: homepage energy wire

Status: implemented in the working tree, validated, **not committed**. Phase 2 (Automation connectors) and Phase 3 (animation timing) have not been started.

## What changed

| File | Change |
| --- | --- |
| `src/lib/curves/geometry.ts` (new) | Shared geometry, pure and import-free. `turn()` is two mirrored cubics whose curvature rises linearly from 0 to 1/R and back (Euler-spiral fit). `fillet()` turns a polyline into lines and turns, enforcing lead, gap and the 90° limit. `turnExtent()` and `curvature()`. |
| `src/lib/curves/tokens.ts` (new) | Geometry tokens. `wireRadius(margin)` is exactly 8 / 16 / 24 / 32 px at 390 / 768 / 1024 / 1440 and interpolates linearly on the page margin in between, so it is continuous, with no steps. Also `CURVE.lead` = 0.5 R, `CURVE.gap` = 0.5 R and headings 0/45/90. |
| `src/components/home/services/energy/route.ts` | The router is rebuilt on the curve system. The public interface (`routeWire`, `headAt`, `pointAt`, `Wire`, `Segment`, `Arrival`, `Stop`, `Port`, `Box`) is unchanged apart from an optional trailing `margin` argument. The scroll-key, arrival and plate-span logic is unchanged. |
| `src/components/home/services/energy/EnergyFlow.tsx` | One argument: passes the page margin it already measures to `routeWire`. No animation code changed. |
| `tests/unit/curves.test.mjs` (new) | Invariants: zero curvature at turn ends; peak radius equals R; no curvature bumps; continuous tangent and curvature through `fillet`; rejection of short runs and >90° turns; the radius scale at the reference widths and its continuity from 320 to 1920 px. |

Not touched: the plates, ports, keep-outs, text measurement, clearance (7 / 14 px), timing, smoothing, comets, CSS, reduced-motion handling, the Automation diagram and every other animation.

## How the router works now

Each hop between a plate's out port and the next plate's in port is built in two layers.

1. **Topology.** A polyline that only moves down the page, made of vertical lanes joined by lane changes. A lane change is a 45° diagonal when the drop allows, a shallower S for small offsets, or a level run when the drop is too short. It is searched against the same obstacles production uses.
2. **Geometry.** `fillet()` replaces every vertex with a turn of the wire radius.

Lanes prefer the page margin's centre, the page centre and the 12-column gutters (lg); off-grid lanes cost extra. Lane changes prefer the middle of the gap they cross. A route must leave and reach each port along the port's own heading. As in production, the wire may cross the artwork round its own out and in ports only on its opening and closing runs.

## Validation

All runs used production builds (`next build` + `next start`). "Before" is HEAD (12596e8); "after" is this working tree.

### Layout preserved

The router's inputs (hero origin, every plate's ports and keep-outs, every text box, width, lane) were captured from both builds at 390, 768, 1024 and 1440. **They are identical at all four widths**, so plates, ports and obstacles are untouched.

### Geometry of the wire as drawn

Measured from the `d` attributes the page rendered, with reduced motion so the whole wire is drawn.

| Width | Radii, before → after | Curvature breaks* | Bends under 0.75 R | Min clearance to text** | Length |
| --- | --- | --- | --- | --- | --- |
| 390 | 5.8–141.9 → **8.0** | 22 → 0 | 1 → 0 | 9.0 → 10.0 px | 6988 → 7271 (+4%) |
| 768 | 5.0–151.8 → **16.0** | 11 → 0 | 3 → 0 | 15.3 → 20.5 px | 6982 → 7903 (+13%) |
| 1024 | 8.1–174.4 → **24.0** | 9 → 0 | 4 → 0 | 17.6 → 18.8 px | 6326 → 7152 (+13%) |
| 1440 | 12.5–240.2 → **32.0** | 10 → 0 | 2 → 0 | 16.7 → 20.3 px | 7978 → 8791 (+10%) |

\* A join where curvature jumps by more than 10% of 1/R. Tangent breaks: 0 before and after.
\*\* Excluding each hop's first and last 30 px, where it leaves and reaches its own artwork.

Widths between the references (360, 480, 600, 700, 900, 1100, 1280, 1680, 1920): zero breaks, every hop clear, and the radius follows the margin continuously (for example 9.9 px at 480, 20.1 at 900, 28.9 at 1280, capped at 32 above 1440).

### Timing and animation

- **Power-on positions.** The scroll positions at which each plate is powered (the arrival keys) are identical at every stop and width, except Software at 390, which moves by 2 px (see "Port choice").
- **Animation.** EnergyFlow's drawing, head, comets, holds, rings and seam hand-over are unchanged. Live captures with motion on, at three scroll positions per width (`live-*`), show the drawn-ahead track, the built ink and the travelling head as before.
- **Speed.** The wire is about 4–13% longer, so the head covers slightly more path per scrolled pixel. It reaches every plate at the same scroll position.

### Reduced motion

At all four widths on the final build: the wire is drawn built, the head is hidden, every port is lit, no wire animation runs, and no comet is visible. With motion on and the page scrolled to the end, the head is gone and no comet remains.

### Performance

| Width | `routeWire`, median of 25 (Node, same inputs): before → after | Relayout long tasks in the page (widen by 40 px): before → after |
| --- | --- | --- |
| 390 | 50–58 → 24–28 ms | 50 ms → none |
| 768 | 46–49 → 15–23 ms | 56 ms → none |
| 1024 | 60–73 → 27–31 ms | 55 ms → none |
| 1440 | 112–121 → 29–33 ms | 78 ms → 0–52 ms (varied between runs) |

Long tasks are the browser's own over-50 ms tasks, from one resize per width in headless Chromium; treat them as indicative. The Node timings are the like-for-like comparison.

### Tests and checks

- `pnpm test:unit`: 11 / 11 pass (6 new).
- `tsc --noEmit`: clean. `eslint`: clean.
- `pnpm build`: succeeds.
- Playwright e2e, full suite, three projects, against the production build: **259 passed, 116 skipped, 0 failed**, identical to the baseline on HEAD.

## Routing limitations and visual changes (honest list)

1. **Port choice.** Each plate offers a preferred port and a fallback marked with a penalty. The new router takes the fallback only when the preferred port cannot be reached clear at the wire radius. Compared with production:
   - **1024, Hero → AI:** the wire now enters the AI graph by its left node instead of its top node. Between the section heading and the AI artwork there are 44 px after clearance, and a quarter turn plus lead at R = 24 needs 56 px. Production got through with an 8 px kink, its tightest bend at that width. The AI plate's build therefore starts from the left node at this width.
   - **390, Software:** the wire now uses the preferred top port where production used the side port. The plate builds from the top of the browser window instead of its left edge. Its power-on point moves 2 px.
   - **768, Approach:** the wire reaches the same point on the bridge from above rather than from the side. The seam's power-on is identical.
   - Every other port matches production at every reference width.
2. **Smaller radius in one band.** From about 800 to 1000 px wide (the single-column tablet layout), the Automation plate's only in port sits close to the page margin. A quarter turn plus lead at the token radius does not fit between the margin lane and the port. That hop takes the largest radius that does fit, 0.83–0.98 of the token (for example 17.7 px against 20.1 at 900). Every other hop at every width uses the token radius. No reference width is affected.
3. **Longer routes.** Octilinear routes are 4–13% longer than production's free curves. Plates power at the same scroll positions, so the effect is a slightly quicker head.
4. **Fixed along the way, in the router.** EnergyFlow decides a hop is finished by comparing floating-point sums. When the wire ended, a rounding error of about 1e-13 could leave the comet parked at the last port. Production had this at 768 and 1024 (with reduced motion, or scrolled to the end), and the new geometry would have moved it to 390 and 1440. Wire lengths are now kept to 1/1024 px, so the sums are exact. EnergyFlow itself is unchanged.

## Screenshots

In `prototypes/curve-system/phase-1/`, before | after side by side, from production builds:

- **`wire-{390,768,1024,1440}-before-after.png`:** the whole wire, from the hero to the last Method plate, with reduced motion so it is drawn end to end.
- **`live-{automation,seo,method}-{width}-before-after.png`:** motion on, mid-scroll, with the head travelling.

## Not done (by design)

- Automation connectors (Phase 2) and animation timing (Phase 3) are untouched.
- No commit, push, deploy or publish. The prototype folder is untouched apart from this `phase-1/` folder.
