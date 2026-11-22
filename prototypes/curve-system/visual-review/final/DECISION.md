# Final design iteration: decision and evidence

Prototype only. No production file changed, nothing committed or deployed. Phase 1 and all earlier prototype files are untouched.
Router: `prototype/route-final.ts` (optimised `route-next.ts`). Artwork sampler: `prototype/ink-step6.ts`.
Tools and raw numbers: `prototype/tools/`, `prototype/metrics-final.txt`. Screenshots: `screenshots/`.

## Decision

1. **Desktop: adopt the final router (distance field from the real artwork, chamfer-based routes).** The square U-corner beside the heading is gone at 1440, 1280 and 1024. The wire leaves the SEO plate, runs down the margin on a 45 degree chamfer, and enters the left node on a second chamfer. The top-port alternative was tested and is worse: it needs a rightward hook round the heading (forced-port run, see below). Geometry is identical across 1440 / 1280 / 1024 (same ports, 12 quarter-turns, 4 edge switches, 2 crossings).
2. **Mobile: do not adopt the left-spine proposal.** Measured at 430 / 390 / 360 it has 10 edge switches and 6 crossings against 6 and 4–5 for Phase 1, and hugs the edges 40 to 60 % more. The final mobile route keeps the Phase 1 port layout, routed by the new router (`phonePorts: false`). At 390 and 360 this is the same route as Phase 1 (same length, turns, ports). The honest result: **no cleaner mobile alternative was found**; the router change only makes it cheaper to compute. Mobile remains the weakest area.
3. **Radius: keep 8 / 16 / 24 / 32.** A 12 px floor changes nothing measurable on phones (same turns, edge switches, crossings; near-ink within 3 px) and forces 7 radius-fallback retries per page. The scale only differs below 768 px, so there is nothing to test on desktop.
4. **Artwork sampling must move to build time before production** (see performance).

## Route quality (from the drawn path and real page pixels)

Production / Phase 1 / Final. `turns90` counts quarter-turns; `near-ink` is the count and total length of stretches closer than 10 px to text or artwork.

| width | variant | length px | turns90 | turns45 | near-ink | edge switches | crossings |
|---|---|---|---|---|---|---|---|
| 1440 | prod / P1 / final | 7977 / 8790 / 8665 | 6 / 15 / 12 | 0 / 8 / 10 | 8 (45 px) / 9 (333 px) / 4 (30 px) | 4 / 4 / 4 | 2 / 2 / 2 |
| 1280 | prod / P1 / final | 7428 / 8073 / 7991 | 5 / 15 / 12 | 0 / 6 / 8 | 6 (27) / 6 (291) / 3 (16) | 4 / 4 / 4 | 2 / 2 / 2 |
| 1024 | prod / P1 / final | 6356 / 7112 / 6997 | 5 / 15 / 12 | 0 / 8 / 10 | 8 (18) / 5 (17) / 3 (14) | 3 / 4 / 4 | 2 / 2 / 2 |
| 768 | prod / P1 / final | 6982 / 7902 / 7753 | 5 / 20 / 18 | 0 / 4 / 4 | 4 (6) / 5 (11) / 3 (9) | 7 / 7 / 7 | 3 / 3 / 3 |
| 430 | prod / P1 / final | 7307 / 7575 / 7952 | 10 / 19 / 20 | 0 / 10 / 8 | 2 (18) / 1 (23) / 1 (23) | 6 / 6 / 6 | 5 / 4 / 5 |
| 390 | prod / P1 / final | 6987 / 7269 / 7269 | 10 / 19 / 19 | 0 / 12 / 12 | 2 (0) / 1 (20) / 2 (41) | 6 / 6 / 6 | 5 / 4 / 4 |
| 360 | prod / P1 / final | 6764 / 6996 / 6996 | 10 / 19 / 19 | 0 / 8 / 8 | 1 (0) / 1 (19) / 2 (40) | 6 / 6 / 6 | 5 / 4 / 4 |

Desktop: near-ink length falls from 291–333 px (Phase 1 at 1280/1440) to 16–30 px; hugging of the background-band edges falls from 355–378 to 10–24 px. Phone: no improvement over Phase 1; slightly more hugging at 430 and 390 and about 20 px more near-ink at 390 and 360.

Mobile variants compared offline at 390 (8 px unless stated): spine 23 quarter-turns, 10 edge switches, 6 crossings, hug 992; spine at 12 px 19 / 5 / 6, hug 989; Phase 1 ports 20 / 6 / 5, hug 740 (final). The 12 px spine has fewer switches but the same crossings and the heaviest edge-hugging, so it is not a clear win.

## Performance

Method: the router's inputs (text, artwork ink, edges, groups, stops) were captured once from the browser for each width; the router was then run in Node v24.16.0 on an i3-1115G4 (4 cores, shared with a running desktop, load average about 3). Each figure is the **median of 15 timed runs after 2 warm-ups** of the whole `routeWire` call (field build and search). Old prototype: 1300 to 1500 ms.

| width | final router median (min / max) ms | field ms | search ms | radius retries |
|---|---|---|---|---|
| 1440 | 87 (80 / 124) | 26 | 60 | 0 |
| 1280 | 84 (76 / 175) | 22 | 59 | 0 |
| 1024 | 71 (67 / 73) | 15 | 54 | 0 |
| 768 | 38 (36 / 81) | 12 | 25 | 0 |
| 430 | 68 (63 / 108) | 30 | 38 | 0 |
| 390 | 53 (50 / 62) | 26 | 26 | 0 |
| 360 | 46 (43 / 74) | 23 | 22 | 0 |

**Router target (under 100 ms): met in Node at all seven widths** (medians), with some runs reaching 124 to 175 ms under desktop load. Desktop settings: raster cell 6 px; phones: cell 4 px. Routes were checked to be unchanged by the coarser settings (same ports, same metrics).

**End-to-end in the browser: not met on desktop.** The page also samples the artwork in the browser (`artMs`, measured in the captured page): 369 / 368 / 211 / 185 / 177 / 147 / 146 ms at 1440 / 1280 / 1024 / 768 / 430 / 390 / 360 with a 3 px step. With a 6 px step it measured 145 / 116 / 83 / 59 ms at 1440 / 1024 / 430 / 390 (a single page load each, not a median), with identical routes. So the total is about 59 + 53 to 145 + 98 ms: roughly 110 to 245 ms per page. I did not run the router inside the browser; its in-browser speed is assumed close to Node and is unmeasured. **Do not claim the 100 ms target is met end to end.** Fix: the plates' SVGs are static, so sample them once at build time in the SVG's own units and apply only the transform at runtime (tens of thousands of matrix multiplications, a few ms). That is the remaining engineering step.

## Remaining visual compromises

- Phone routes still switch edges 6 times and cross plates/captions 4 to 5 times; the route is a compressed version of the same idea, not a new mobile composition. 
- 360 and 390 have two short near-ink stretches (about 40 px in all) that the router could not avoid.
- At 1440 one 30 px near-ink stretch and four short ones remain at plate boundaries.
- Routes are 8 to 10 % longer than production; 12 quarter-turns plus 10 chamfers against 6 turns.
- 768 is unchanged from Phase 1 (7 edge switches, 3 crossings).
- Automation connectors and animation timing (Phases 2 and 3) are untouched.

## Recommendation

- **Desktop geometry: ready for production implementation**, subject to build-time artwork sampling and an in-browser timing check, because the visual defects raised (artwork overlaps, the U beside the heading) are resolved and the geometry is consistent across 1440 / 1280 / 1024.
- **Mobile: not ready as a design.** The evidence does not support the spine; the Phase 1 layout with the new router is the safest option, but it does not meet the aim of a calmer mobile composition. That needs your visual decision (for instance simplifying the Method section's hops) rather than more routing work.
- Production would also need: porting `route-final.ts` into `src/components/home/services/energy/`, the 11 existing curve tests plus new route tests, and re-running the Playwright screenshots at the seven widths.
