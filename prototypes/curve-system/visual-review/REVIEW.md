# Energy wire: visual review and proposal

Status: investigation and isolated prototype only. Production code is untouched, and the Phase 1 working tree and the earlier prototype files are preserved. Nothing has been committed, pushed or deployed. Phases 2 and 3 have not been started.

## How this was looked at

- **One build, three routers.** An isolated copy of the site (in a temporary folder, never the working tree) switches the wire's router by URL: `?wire=prod` (HEAD), `?wire=p1` (Phase 1) and `?wire=next` (this proposal). Same build, same page, same measured layout, so every difference in the screenshots comes from the router alone.
- **Widths:** 1440, 1280, 1024, 768, 430, 390 and 360 px.
- **States:**
  - the whole wire with reduced motion (drawn end to end)
  - mid-scroll frames with motion on, with the head two thirds of the way into the hops to AI, Automation, Software, SEO and Define.
- **What the wire is measured against:** the page as rendered.
  - The page is captured with the wire hidden. Every pixel that differs from its row's background counts as ink, so text, artwork, rules and the 3D bridge all count.
  - The distance from the wire's centreline to the nearest ink is measured along its whole length.
  - Separately, the prototype router samples every visible stroke and fill of each plate's SVG, so it sees the drawing itself, not its bounding box.

## Visual problems

Each sheet in `screenshots/problems/` shows the same crop from production, Phase 1 and the proposal. The trouble spots are circled in red.

### Desktop (1024 to 1440)

- **The Automation exit runs along its own artwork.**
  - At 1440 and 1280, Phase 1 leaves the result node, turns, and runs 254 px with no gap at all along the bottom of the lower card and through the dot canvas.
  - Production swept past the card's corner 12 px away.
  - `automation-exit-1440.png`
- **A squeezed approach to the Automation trigger.**
  - Phase 1 makes a small jog just below the AI graph: 68 px across at 1440, 45 px at 1024. It then runs down the narrow corridor between the Automation paragraph and the trigger, at the 14 px minimum from the text, and turns hard into the trigger.
  - `ai-into-automation-1440.png`
- **Hero to AI wraps the section heading.**
  - Phase 1 runs flat under the pyramid, then down the page margin beside "Four disciplines, one way of working", then flat again into the AI graph's left node.
  - The result is a U around the heading that reads like a bracket.
  - At 1024 the first flat run also sits right against the pyramid.
  - `hero-into-ai-1440.png`, `hero-into-ai-1024.png`
- **Cramped brackets between neighbouring Method plates.**
  - From one plate's far plinth to the next plate's near plinth, Phase 1 squeezes a down-across-down bracket into a gap barely taller than its two turns.
  - `method-1440.png`

### Tablet (768)

- **Edge-hugging U-turns.**
  - Phase 1 runs flat right under the pyramid to the far page edge, down the edge beside the text, and back across into the AI graph's top node. The same pattern repeats from Automation into Software.
  - There is a free column about 100 px wide between the text and the edge that it never uses.
  - `tablet-services-768.png`
- **The same Method brackets.**
  - `tablet-method-768.png`

### Phone (360 to 430)

- **The wire switches screen edge from plate to plate.**
  - Hero to AI goes down the right edge, AI to Automation the left, Automation to Software the right, Software to SEO the left.
- **It crosses the column at every plate and ends most crossings in a hook.**
  - At 390, five plates (AI, Software and three Method plates) are entered by a flat run turned down into a top port.
- **Every corner is a tight 8 px elbow,** so the hooks read as cramped.
- `phone-services-390.png`, `phone-method-390.png`

### Shared by all widths

- **Flat runs hug whatever is above them.** A lane change is placed at the first level where it fits, not in the middle of the gap. The pyramid at 1024, 768 and 390 is the clearest case.
- **The wire runs parallel to background edges.** It can run just inside the edge of the grey Software band, because the router cannot see background edges (`automation-to-software-1024.png`).

## Why the current router produces them

- **It sees rectangles, not drawings.**
  - Each plate is one keepout rectangle. Inside it the router knows nothing, so it can neither avoid the actual shapes nor use the empty space around them.
- **Its own artwork is exempt.**
  - The runs that leave a plate and the runs that reach the next plate may cross that plate's rectangle freely. Production allowed the same.
  - That is how the Automation exit came to run along its own card: the whole run counts as "leaving".
- **Clearance is pass or fail.**
  - Any route 14 px (7 on phones) from text and keepouts is as good as any other, so the shortest one wins.
  - The shortest route is the one that hugs everything at exactly the minimum, and places its lane changes at the first level that fits.
- **Turns are priced by the radius.**
  - A quarter turn costs three radii of length. At R = 8 on a phone that is 24 px, almost free, so U-turns and hooks cost nearly nothing.
  - Reversing sideways (a hook) is not penalised at all.
- **The lanes favour the page edges.**
  - Below 1004 px the only preferred lanes are the two page-margin centres and the page centre. Corridors beside the text are never preferred.
- **Ports are the same at every width.**
  - On a phone the AI and Software plates still prefer their top ports, and the Method plates their top entries.
  - In a single column, a top port can only be reached by crossing the column and hooking down.
- **Entries are always right-angled.**
  - A side port is entered by a 90° elbow. A level lane change is two 90° elbows. There is no 45° chamfer anywhere except in diagonal lane changes.
- **Background edges, and the pairing of a figure with its caption, are invisible to the router.**

## Proposed desktop improvements

All of these are in the prototype router (`prototype/route-next.ts`). The curve language is unchanged: 0/45/90° headings, Euler-spiral turns and one radius per width (8/16/24/32 at the reference widths).

- **Avoid the artwork as drawn.**
  - Every visible stroke and fill of every plate is sampled (`prototype/ink.ts`) and rasterised with the text into a distance field.
  - Each drawing is closed: gaps narrower than 36 px (20 px on phones) are filled, and enclosed holes are filled. The wire can therefore skirt a drawing's real outline but never thread between its parts.
  - The dot canvas and other faint decoration may be crossed, at a cost.
- **No blanket exemption.**
  - Only the straight stub a port needs to get clear of its own drawing is exempt, plus one clearance. After that, the wire keeps clear of its own plate like any other.
- **Spacing is a cost, not just a limit.**
  - Every pixel of wire closer than a comfortable distance costs, and more for runs across the page than down it. Lane changes therefore sit in the middle of their gaps, and long runs keep their distance.
  - The hard minimum stays 14 px (8 on phones).
- **Gentler topology.**
  - A turn costs by the square of its angle, so two 45° turns cost half of one 90°.
  - Side ports may be entered and left through a 45° chamfer, and level runs may be chamfered.
  - A turn never costs less than 12% of the page width. A sideways reversal (a hook) costs 40% of it.
  - Lane changes shorter than three radii cost extra: a jog is either decisive or not made.
- **Background edges.** Section and band edges are soft lines that runs across the page keep away from. Running across an edge at right angles is free.
- **Figures stay with their captions.** Where a figure and its caption are stacked (every Method step, and the service plates on a phone), the gap between them is solid.
- **Method entries.**
  - The near plinth's side entry becomes almost neutral on desktop (prototype data: `next: 2`), so the simpler route wins.
  - Between neighbouring plates that gives a single-turn L: down beside the plate, then into the next plinth's side. The two-turn bracket goes.

What it does on screen, from `screenshots/full/` and `screenshots/problems/`:

- **Automation exit:** drops straight down from the result node, well clear of the lower card, crosses in the middle of the gap above the grey band, and drops into the browser window.
- **Into the trigger:** one drop from the AI graph, then a 45° approach.
- **Hero to AI:** the flat run sits mid-gap under the pyramid, and the wire enters the left node through a chamfer. At 1280 and 1440 it still passes the heading on the page-margin side, because that is the only way to the left node that stays clear of the heading. The U is softer, but it is still there.
- **Software to SEO:** one long 45° diagonal, chamfered into the baseline.
- **Method:** the brackets become single-turn L routes. Where the wire changes rows, it crosses in the middle of the row gap below the captions.
- **Tablet (768):** long 45° runs replace the edge-hugging U-turns, the vertical runs keep clear of the paragraphs, and entries are chamfered.

## Mobile proposal (single column, under 640 px)

**Concept: a spine and branches that read like text.**

On a phone the wire becomes one spine down the left page margin. Every plate is entered from it, from the left, by a short branch: a turn, or a 45° chamfer. Where a plate's way out is on its right (the Automation result, the Method plates' far plinths), the wire returns to the spine below that plate and its text, the way a line of text returns to the margin. Every crossing runs right to left, in a gap between plates, never between a drawing and its caption.

- **Port preferences for phones**, as data on each port (`phone:`):
  - AI enters at its left node.
  - Software enters at the browser window's left edge.
  - Each Method plate enters at its near plinth's side.
  - On desktop these ports keep their current preferences.
  - Each plate builds outward from the port it is entered by, so on phones AI and Software build from the left.
- **Turn and hook costs scale with the page, not the radius.** Hooks and staples are now expensive at R = 8.
- **Lead halved on phones (0.25 R).** The near plinth's side, 18 px from the spine at 360, can still be reached.
- **Radius unchanged:** 8 px at 390, as approved.

What it does on screen (`phone-services-390.png`, `phone-method-390.png`, `screenshots/full/full-390.png`):

- **No hook-shaped top-port entries.** At 390, five plates were entered by a hook; now none are. Every plate is entered from the same side.
- **No more random edge switching.** The left margin carries every approach. The right margin is used only to leave a plate whose exit is on the right: Automation, SEO to the bridge, and the Method plates.

Honest trade-offs:

- **More crossings and edge switches by count.**
  - The proposal crosses the column more often than Phase 1: 6 crossings against 4 at 390, and 10 edge switches against 6.
  - The reason is that every right-hand exit now returns to the spine. Each return is short, in a gap, and always in the same direction, but there are more of them.
- **Still 10 px from the text.** On a 390 px screen with a 20 px margin there is nowhere else for a vertical run.
- **About 8% longer** than Phase 1 at 390.

Decisions for you:

- **Spine pattern:** accept it as the phone direction, or prefer something closer to production's freer sweeps.
- **Phone radius:** stay at 8, or try 12 on phones only (not prototyped).
- **Phone margin:** a wider margin (24 px) would give the spine more air. That is a layout change and was not prototyped.

## The prototype

`prototype/` holds everything needed to rebuild it:

| File | What it is |
| --- | --- |
| `route-next.ts` | The proposed router (prototype quality: not optimised, includes a debug export). |
| `ink.ts` | Samples each plate's visible SVG geometry. |
| `prototype.patch` | Against the Phase 1 working tree: the `?wire=` switch and measurement hooks in EnergyFlow (artwork, band edges, figure-caption gaps); phone and desktop port data in Services.tsx and Method.tsx. |
| `route-prod.ts` | HEAD's router, for `?wire=prod`. |
| `setup.sh` | Copies the repo to a temporary folder, applies the above there, and builds it. |
| `tools/` | The capture, analysis and comparison-sheet scripts used for this review (paths inside point at the session's scratch folder and the repo's node_modules). |
| `metrics.json`, `phone-metrics.json` | The measurements below. |

To run it: `prototypes/curve-system/visual-review/prototype/setup.sh /some/folder`, then `cd /some/folder && ./node_modules/.bin/next start -p 3400` and open `http://localhost:3400/?wire=next`. Use `?wire=p1` or `?wire=prod` to compare.

## Comparison screenshots

- **`screenshots/problems/*.png`:** the problem areas, same crop from production, Phase 1 and the proposal, with the trouble spots circled and a one-line caption.
- **`screenshots/full/full-<width>.png`:** the whole wire at each of the seven widths, production, Phase 1 and the proposal side by side.
- **`screenshots/live/live-<width>-<plate>.png`:** mid-scroll with motion on (head, drawn track and built ink), at each width, on the way into AI, Automation, Software, SEO and Define.

## Measurements

| Width | Version | Length (px) | Turns | Near ink: stretches / total | Closest (px) | Hugging (px) | Routing (ms, browser) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1440 | Production | 7977 | 20 | 8 / 45 px | 5 | 199 | 130 |
| 1440 | Phase 1 | 8790 | 23 | 9 / 333 px | 0 | 378 | 62 |
| 1440 | Proposal | 8581 | 25 | 4 / 30 px | 4 | 24 | 1410 |
| 1280 | Production | 7428 | 19 | 6 / 27 px | 8.1 | 310 | 129 |
| 1280 | Phase 1 | 8073 | 21 | 6 / 291 px | 0 | 355 | 147 |
| 1280 | Proposal | 7908 | 21 | 3 / 16 px | 8 | 10 | 1345 |
| 1024 | Production | 6356 | 21 | 8 / 18 px | 7 | 152 | 80 |
| 1024 | Phase 1 | 7112 | 23 | 5 / 17 px | 6 | 88 | 79 |
| 1024 | Proposal | 7011 | 22 | 3 / 14 px | 6 | 28 | 974 |
| 768 | Production | 6982 | 22 | 4 / 6 px | 9.2 | 568 | 71 |
| 768 | Phase 1 | 7902 | 24 | 5 / 11 px | 5 | 455 | 41 |
| 768 | Proposal | 7321 | 23 | 3 / 8 px | 5 | 502 | 1220 |
| 430 | Production | 7307 | 25 | 2 / 18 px | 6 | 644 | 70 |
| 430 | Phase 1 | 7575 | 27 | 1 / 23 px | 0 | 478 | 120 |
| 430 | Proposal | 8185 | 29 | 1 / 23 px | 0 | 846 | 1586 |
| 390 | Production | 6987 | 27 | 2 / 0 px | 7 | 751 | 70 |
| 390 | Phase 1 | 7269 | 28 | 1 / 20 px | 0 | 639 | 63 |
| 390 | Proposal | 7888 | 30 | 1 / 20 px | 0 | 993 | 1326 |
| 360 | Production | 6764 | 24 | 1 / 0 px | 7 | 772 | 76 |
| 360 | Phase 1 | 6996 | 26 | 1 / 19 px | 0 | 579 | 71 |
| 360 | Proposal | 7457 | 28 | 1 / 19 px | 0 | 1005 | 1186 |

- **Near ink:** stretches of wire closer than 12 px (8 on phones) to any ink, excluding 14 px at each port. "Total" is their combined length.
- **Hugging:** wire running within 24 px (14 on phones) of ink, excluding 30 px at each port.
- **Phone results:**
  - "Near ink" includes 20 px where the spine joins the SEO baseline's own continuation. That is intended: the wire runs into that line.
  - Hugging rises on phones because the spine runs beside the text by design.
- **Tablet results:** at 768 total hugging is slightly higher than Phase 1 (502 px against 455). The Software run is clearer, but the left-margin runs beside the Automation and SEO text are counted.

Narrow widths, from the same captures:

| Width | Version | Screen-edge switches | Crossings of most of the column | Plates entered from the side (of 9) |
| --- | --- | --- | --- | --- |
| 768 | Production | 7 | 3 | 2 |
| 768 | Phase 1 | 7 | 3 | 3 |
| 768 | Proposal | 5 | 3 | 5 |
| 430 | Production | 6 | 5 | 3 |
| 430 | Phase 1 | 6 | 4 | 2 |
| 430 | Proposal | 10 | 6 | 8 |
| 390 | Production | 6 | 5 | 3 |
| 390 | Phase 1 | 6 | 4 | 2 |
| 390 | Proposal | 10 | 6 | 8 |
| 360 | Production | 6 | 5 | 3 |
| 360 | Phase 1 | 6 | 4 | 2 |
| 360 | Proposal | 10 | 6 | 8 |

## Limitations and open questions

- **Performance.** The prototype routes a layout in 1.0 to 1.6 s in the browser (up to 2.9 s with three captures running at once), against 40 to 150 ms for Phase 1 and production. It searches exhaustively and judges every candidate on its true curve against a 2 to 4 px field.
  - A production version needs a coarse-to-fine search and caching, possibly in a worker. I expect it can get to around 100 ms, but that is not yet shown.
  - Until then this is a visual prototype, not a candidate for production.
- **Length.** The wire is 5 to 13% longer than production's. Against Phase 1 it ranges from 7% shorter (768) to 9% longer (390). Plates still power at their own scroll positions, so the head moves slightly faster.
- **Port choices change.**
  - On phones: AI, Software and every Method plate are entered from the side.
  - On desktop: Define and Improve are entered from the side.
  - Plates build outward from their entry, so this changes where those plates start building. Arrival timing would need the same validation as Phase 1 before production.
- **Automation to Software at 768 is still a U.** The Software text spans the column, so the wire must pass beside it and come back to the centred browser window. It now runs further from the text.
- **Decoration rules are heuristic.** An element counts as decoration (crossable at a cost) when its opacity is below 0.35 or its fill is a pattern, which covers the dot canvas. Dashed lines count as drawing, because the Define plate is drawn in them. Animated elements are sampled as they are at the moment of measuring.
- **The Approach stage is still boxes.** It is a 3D render, so it keeps its keepout boxes. The arrival on the bridge's far end comes within 6 to 9 px of the render, as it does in production.
- **Production data changes.** The port preferences (`phone:` and `next:`) would have to be added to `Services.tsx` and `Method.tsx`. The figure-caption gaps and band edges would be measured in EnergyFlow, as the patch does.
