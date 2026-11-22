# Checkpoint: build-time artwork sampling (prototype)

Follows `DECISION.md`. Prototype only: no production file, routing, mobile layout or radius scale changed; nothing committed or deployed. All new files are in `ink/` here.

## What changed

The router's ink (the plates' visible SVG outlines and fills, sampled every 6 screen px) used to be sampled in the browser on every layout (`ink.ts`, 66 to 153 ms at the 6 px step, varying run to run). It is now generated once into `ink/ink.generated.json`, and the browser only applies each plate's scale and offset (`ink/inkdata.ts`, 5 to 9 ms warm, 9 to 20 ms cold in the page).

| file (`ink/`) | role |
|---|---|
| `ink-signature.ts` | `signature(svg)`: FNV hash of a plate's tags and attributes (ignores the random `--loop-d`, `--from`, `--to` style variables). Shared by the browser and the generator. |
| `inkdata.ts` | run-time: `inkFromData(nodes, toLayer, data)` returns `{ ink, missing }`; `inkForPlate` is the DOM-free core. |
| `ink-prebuilt.ts` | call site that replaces `artwork(nodes, toLayer)`: plates with no matching data fall back to the slow sampler with a console warning. |
| `generate-ink.mjs` | the generator (Playwright, already a dev dependency). |
| `ink.generated.json` | the data: 159,379 bytes (44,684 gzip), 8 plates, 446 elements, 5,290 vertices. |
| `ink.test.mjs` | `node --test`: fails when any artwork source file changed since generation; checks data shape and the sampler's counting. |
| `capture.mjs`, `compare2.mjs`, `routes.mjs`, `browser-bench.mjs` | validation tools; their results are in `ink/results/validation.txt`. |

## How it works

1. Which artwork: the 8 `svg[data-energy-ports]` plates (4 Services plates, 4 Method plates). The Bridge frame (stop 4) is an HTML element and has no ink. Every `path, line, polyline, polygon, rect, circle, ellipse` that is visible and has a stroke or fill is sampled; faint/decoration flags come from the same rules as `ink.ts`.
2. Why it can be done at build time: measured at 7 widths, nothing about the plate artwork depends on the viewport except the plate's uniform scale (no CSS transforms, no animations under reduced motion, stroke widths and opacities identical at every width). The generator also loads 1440 and 390 px and refuses to write if the two disagree.
3. The sampling step is in screen pixels, so point counts depend on the scale. The data therefore stores each outline in SVG units as a polyline with the arc length at every vertex (dense `getPointAtLength`, simplified within 0.06 units, about 0.1 px at the largest scale), the total length, bounding box, stroke half-width, fill rule and flags. At run time `n = ceil(length * scale / 6)` and the points are read off the polyline by arc length; fills use the same `ceil(box * scale / 6)` grid, with a point-in-polygon test that counts points on the outline as inside (as `isPointInFill` does).
4. Staleness is handled explicitly: (a) at run time a plate whose `signature` has no data goes to `missing` and is sampled the slow way with a warning; (b) `ink.generated.json` stores the SHA-256 of the 16 source files (diagrams, CSS, plate crops, Method plates) and `ink.test.mjs` fails, naming them, when one changes; (c) the generator exits with an error if a listed source is missing or the style is width dependent.

## Regenerate

```
pnpm dev                      # or next start, any server that serves the homepage
node prototypes/curve-system/visual-review/final/ink/generate-ink.mjs http://localhost:3000 \
     prototypes/curve-system/visual-review/final/ink/ink.generated.json "$PWD"
node --test prototypes/curve-system/visual-review/final/ink/ink.test.mjs
```

Takes 19 to 20 s on the i3-1115G4 (two page loads and Chromium start-up); it is not part of `next build`. Output is deterministic: two runs were byte-identical, and a run against the repo's own dev server (port 3000) was byte-identical to the one made from the prototype build.

## Validation (`ink/results/validation.txt`)

Browser ground truth: `window.__energy.art` from the prototype build at the 6 px step, reduced motion, at 1440 / 1280 / 1024 / 768 / 430 / 390 / 360.

| width | browser points | data points | browser points with no data point within 0.3 px | data points with no browser point | matched max / mean distance px |
|---|---|---|---|---|---|
| 1440 | 26,428 | 26,427 | 4 | 3 | 0.117 / 0.005 |
| 1280 | 22,254 | 22,247 | 12 | 5 | 0.103 / 0.006 |
| 1024 | 16,022 | 16,022 | 0 | 0 | 0.072 / 0.005 |
| 768 | 13,389 | 13,389 | 1 | 1 | 0.088 / 0.005 |
| 430 | 12,969 | 12,969 | 3 | 3 | 0.082 / 0.005 |
| 390 | 11,406 | 11,406 | 0 | 0 | 0.075 / 0.005 |
| 360 | 10,202 | 10,202 | 0 | 0 | 0.086 / 0.004 |

**The output is not bit-identical and I do not claim it is.** Points match within 0.12 px (the stored outlines are simplified), and at four widths a handful of fill-grid points differ (at most 12 of 22,254, 0.05%): they lie exactly on a fill's edge, where the browser's inclusive test and floating point disagree. Order is not compared point by point for that reason.

Effect on routing: the final router (`prototype/route-final.ts`, desktop cell 6, phones `phonePorts: false`) was run on the same inputs with the browser's ink and the generated ink at all seven widths: **the drawn paths are string-identical, the ports are identical, the maximum point deviation is 0** (`routes.mjs`).

Timing, in the page (`browser-bench.mjs`; medians of 24 warm calls, plus the first call; browser-sampling figure is one measurement per page load, the one in `ink/results/validation.txt`, with an earlier run in brackets):

| width | browser sampling (ink.ts, 6 px) | build-time data, first call | build-time data, warm median |
|---|---|---|---|
| 1440 | 127 ms (153 in an earlier run) | 20.2 | 8.8 |
| 1280 | 116 (119) | 17.3 | 7.5 |
| 1024 | 95 (85) | 11.4 | 6.0 |
| 768 | 104 (74) | 11.1 | 5.8 |
| 430 | 99 (78) | 12.7 | 4.7 |
| 390 | 76 (66) | 10.6 | 4.7 |
| 360 | 67 (68) | 13.1 | 4.9 |

Before this task the sampler used a 3 px step and took 146 to 370 ms; the 6 px step (from the previous task) already halves that, and the data path removes the rest. Combined with the router medians in `DECISION.md` (38 to 87 ms), the ink plus routing is about 55 to 107 ms on the first call (1440: 87 + 20, over 100 ms by a few ms; 1280: 84 + 17 = 101) and 43 to 96 ms warm (router median plus warm ink). **The 100 ms target holds at 5 of 7 widths on a first call and at all 7 warm, but not with margin at 1440/1280.** The router's in-browser time and the other measurements the page makes (text rectangles, edges, groups) were not timed here.

## Limitations and compatibility

- Not bit-identical (above); routes are identical on the seven tested widths, but a different layout could in principle tip a route that is sensitive to a boundary point. Order of points differs only where the data and the browser disagree.
- Valid for reduced motion / settled state. With motion on, the loop animation changes element opacity over time, so the browser sampler's `faint` flag depends on when it runs; the generated data fixes the settled state (this makes it deterministic).
- Data is about 159 KB raw, 45 KB gzip if imported into the client bundle; load it as a JSON import only into the energy chunk, or serve it as a static asset.
- It assumes one uniform scale per plate (true for these `viewBox`-scaled SVGs) and no transforms on the elements; the generator does not check transforms, only that 1440 and 390 px agree.
- The generator needs a running site and Chromium; it is a manual step, guarded by the test and the run-time fallback rather than run in `next build`.
- The data was generated from the Phase 1 repo (dev server on :3000), whose artwork markup matches the prototype build.

## Remaining work for production implementation

1. Port `prototype/route-final.ts` into `src/components/home/services/energy/` (replacing `route.ts`); keep `src/lib/curves/` and its 11 tests; add route tests from the fixtures.
2. Add the `ink/` runtime (`ink-signature.ts`, `inkdata.ts`, the `ink-prebuilt.ts` call) and `ink.generated.json` to the project, with the generator script under `scripts/` and `pnpm` script, and move the test to `tests/unit/`.
3. Wire `EnergyFlow.tsx`: replace the `window.__energy` prototype hooks, the `?wire=` switch and the prototype `phone:`/`next:` port fields (Services/Method) with the final port rules (phones keep Phase 1 ports; desktop keeps the `next:` penalty).
4. Time the router and the page's other measurements inside the browser; if 1440/1280 stay above 100 ms on a first call, options are caching the field per layout and a coarser field cell on desktop (already 6 px).
5. Re-run the Playwright screenshots at the seven widths and compare with `final/screenshots/`.
6. Decide the mobile composition (see `DECISION.md`): this task did not change mobile routing.


---

# Production implementation (2026-11-22)

Not committed, pushed or deployed. Pre-existing changes and untracked files are kept. Phase 1 `route.ts` and `EnergyFlow.tsx` were saved to the session scratchpad before editing.

## What changed in production

| file | change |
|---|---|
| `src/components/home/services/energy/route.ts` | now the final router (ported from `prototype/route-final.ts`): prototype switches (`Options`, `STATS`, `debugJudge`, `phonePorts`, `X.*`) removed; imports use `@/lib/curves`; ports: phones use `penalty` only (Phase 1 ports), larger screens use `next ?? penalty`. Signature gained `art`, `edges`, `groups`. |
| `.../energy/ink-core.ts` | DOM-free runtime of the generated data (`inkForPlate`, types, `STEP`). |
| `.../energy/ink.ts` | `loadInk()` (lazy dynamic import of the JSON, off the main chunk, shape-checked) and `artworkInk()` (data where a plate's signature matches, else sampled). |
| `.../energy/ink-sampler.ts` | the browser sampler, kept only as the fallback for plates with no valid data. |
| `.../energy/ink-signature.ts` | plate fingerprint. **Changed from the prototype:** it now ignores runtime-added `svc-current` overlay paths, `data-loop-d`, and every style custom property (`--len`, `--seg`, `--sx`, ...). The prototype's signature differed between the first layout and the settled page, so four Services plates missed the data and were sampled on every first layout (found in this task, fixed, data regenerated). |
| `.../energy/ink.generated.json` | generated data (159 KB, 8 plates, 446 elements). |
| `.../energy/EnergyFlow.tsx` | gathers `edges` and `groups` (as in the prototype), calls `artworkInk` then `routeWire`; first layout waits for the data (or its failure); `performance.measure` entries `energy:measure`, `energy:ink`, `energy:route`. No `window.__energy`, no `?wire=`. Animations, reveal, reduced motion untouched. |
| `src/components/home/method/Method.tsx` | Method's side in-port gets `next: 2` (near neutral on desktop; phones keep penalty 60). Services plates need no change: their ports are Phase 1's. |
| `scripts/energy/generate-ink.mjs`, `pnpm energy:ink` | the generator (default `http://localhost:3000`, writes the JSON in place). |
| `tests/unit/energy-ink.test.mjs` | staleness (hash of 16 artwork sources), data shape, sampler counting. Runs in `pnpm test:unit`. |
| `tsconfig.json` | `prototypes` excluded: the untracked prototype folder's `.ts` imports broke `next build`'s typecheck. |

Browser-time artwork sampling now only runs for a plate with no matching data.

## Missing / stale data (checked in a browser)

- Chunk blocked: console warning "could not be loaded", all plates sampled, wire drawn (10 paths).
- One plate's signature altered: warning naming plate 0, only that plate sampled, wire drawn.
- Malformed vertex data: handled in code (`try/catch`, partial ink discarded, plate sampled) but **not** exercised in a browser; my injection did not match the chunk.
- Artwork source edited: `pnpm test:unit` fails naming the file; fix with `pnpm energy:ink`.

## Browser timings (Chromium, i3-1115G4, machine memory-starved: 7 GB with a dev server running; `next start` production build; reduced motion)

Cold = first layout of a page load. Warm = median of the later relayouts (width nudged by 1 px, 6 loads). ms.

| width | cold measure / ink / route = total | warm measure / ink / route = total |
|---|---|---|
| 1440 | 3.3 / 27 / 227 = 258 | 2.7 / 15.7 / 129 = 147 |
| 1280 | 7.4 / 44 / 253 = 304 | 3.2 / 18.6 / 169 = 191 |
| 1024 | 2.2 / 13 / 237 = 252 | 4.0 / 17.2 / 151 = 172 |
| 768 | 2.1 / 13 / 136 = 151 | 4.6 / 18.0 / 90 = 112 |
| 430 | 5.8 / 38 / 160 = 204 | 4.8 / 13.3 / 78 = 97 |
| 390 | 4.0 / 21 / 189 = 214 | 4.4 / 13.1 / 64 = 82 |
| 360 | 3.4 / 16 / 102 = 121 | 3.0 / 10.8 / 68 = 82 |

(A dev-server run gave similar warm totals: 64 to 193 ms.) Ink fell from 65 to 119 ms cold in the sampler to 13 to 44 ms. **The 100 ms target is not met in the browser**: the router alone is 129 to 169 ms warm at 1440 to 1024 and 100 to 250 ms cold, above the 38 to 87 ms measured in Node (JIT warm-up, and a loaded machine). Only 430, 390, 360 are at or under 100 ms warm. Layout runs once after the page settles, in an idle callback, so it does not block input, but it is not "under 100 ms".

## Routes

Wire paths at the seven widths differ from Phase 1's (strings compared), as intended on desktop. On phones the ports are Phase 1's, but the new router computes the path, so it is not string-identical to Phase 1 (DECISION.md: same length, turns and ports at 390 and 360; 430 differs slightly).

## Remaining issues

- In-browser router time (above) is the open performance item; options: cache the distance field per layout, or a coarser cell on desktop. Not attempted: no evidence yet that the validated routes survive it.
- Mobile composition remains the weakest area (DECISION.md); unchanged.
- The ink generator is manual and needs a running site; the unit test is the guard.
- Screenshots against `final/screenshots/` were not re-compared in this task.

## Validation results

- `pnpm test:unit`: 14 pass, 0 fail (includes the 11 curve tests and the ink staleness/shape/sampling tests).
- ESLint on the touched folders: clean. `pnpm typecheck` and `pnpm build`: pass (after excluding `prototypes` in tsconfig).
- Playwright E2E, all three projects, against `next start` on port 3100: 259 passed, 0 failed, 116 skipped (the specs' own project skips).
