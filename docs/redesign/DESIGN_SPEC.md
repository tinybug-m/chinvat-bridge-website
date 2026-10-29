# Homepage design spec: "The Seam"

Source of truth for the homepage build. Where it is silent, follow the approved
plan and decide the way a top editorial studio would. The code wins over this
document for anything already built (tokens, primitives, shell).

## 1. Principles

1. **Drawn → built.** Every section shows its subject twice: *drawn* (ink
   hairlines, dashed construction lines, dimension ticks, mono callouts,
   registration "+" marks, unfilled shapes) and *built* (solid ink fills,
   depth, and in 3D only, the iridescent material). The change always happens
   across a vertical **seam** or as a state change on scroll/interaction, never
   as a fade between colours.
2. **Paper, ink, one material.** The page is paper and ink. Cobalt is for links
   and interaction. Saffron is decorative only (ring nodes, small accents).
   Iridescence exists only in WebGL and in the glass `Mark`, never in UI chrome,
   backgrounds or text.
3. **Editorial asymmetry.** Text sits on a 12-column grid, left-weighted.
   Diagrams and objects take the opposite side and may bleed off the edge. No
   centred hero-style sections after the hero and no rows of identical cards.
4. **Structure is visible.** Hairline rules open chapters, the mono
   `SectionMarker` names them, and a ring node marks where the seam crosses a
   rule.
5. **Content first.** Everything is server-rendered and readable without JS,
   3D or motion. Motion explains a change; it never decorates idle time.
6. **Nothing invented.** Copy comes from the existing site. Changes are listed
   in `COPY_CHANGES.md`.

## 2. Foundations (implemented)

- **Tokens:** `src/styles/tokens.css`. Text colours: `ink` (headings, body
  emphasis), `ink-soft` (body), `ink-muted` (meta; the lightest text allowed).
  Lines: `line` (structure), `line-strong` (seam, emphasised rules), `control`
  (form borders). Links: `cobalt-700`. Saffron 600/500 decorative only;
  saffron 700/800 if amber text is ever needed.
- **Type roles:**

  | Role | Utility | Notes |
  |---|---|---|
  | Hero H1 | `text-display` | `[font-stretch:100%] lg:[font-stretch:112%]`, `font-medium` |
  | Section H2 | `text-title` | same stretch rule, `max-w-[18ch]`, `text-balance` |
  | Sub-heads, H3 | `text-heading` or `text-subheading` | `font-medium` |
  | Lede | `text-lede text-ink-soft` | `max-w-measure` |
  | Body | `text-body text-ink-soft` | `text-pretty`, `max-w-measure` |
  | Labels, indices, tags | `font-label text-label uppercase text-ink-muted` | never below 12px |

- **Grid:** `Container` (max 90rem, fluid gutter) + `grid grid-cols-12
  gap-x-6` from `md`; a single column below `md`. Typical split: text
  `md:col-span-5` or `lg:col-span-5`, figure `lg:col-start-7 lg:col-span-6`.
- **Rhythm:** `Section` gives `py-section`. Inside a section: marker → 2rem →
  H2 → 1.5rem → lede → 3–4rem → body of the section.
- **Shape:** radius 2px (`rounded-[2px]`) or none; no drop shadows except the
  menu sheet; hairlines are 1px.
- **Icons:** monoline 1.5px, `ArrowIcon` for directions.
- **Focus:** the global 2px cobalt outline. Never remove it.

## 3. Shared patterns (build them locally the same way)

- **Diagram frame:** a `relative` box with `border border-line` (or bare), four
  registration "+" marks at its corners (8px arms, `bg-control`), a mono caption
  top-left (`Annotation`). Inline SVG inside uses `stroke="currentColor"` with
  `text-ink` for built strokes, `text-line-strong` for drawn/construction strokes,
  `vector-effect="non-scaling-stroke"`, stroke 1.5 (built) / 1 dashed `4 4` (drawn).
- **Index row:** a full-width row between `border-t border-line` hairlines:
  mono index (`01`) · title · meta on the right · `ArrowIcon`. Whole row is the
  link, `min-h-16`, hover: title turns `cobalt-700`, arrow nudges 2px.
- **Callout:** `Annotation` with a leader to the thing it names.
- **Seam:** `Seam` / `Rule node` for the vertical line and ring node.

## 4. Motion

- **Entrances:** `Reveal` / `data-reveal` (0.75rem rise + fade, 600ms,
  `ease-out-quart`), stagger children by 80ms via `delay`. Only for content
  blocks, not every line.
- **Micro:** hover/press 200ms colour changes; arrows nudge 2px.
- **Drawn → built on scroll:** SVG strokes draw in (`stroke-dashoffset`) and
  fills appear when a diagram enters view, triggered by `data-revealed` (CSS
  only, no JS) unless the section spec says GSAP.
- **Scroll-driven motion:** one place only. The Approach seam is scrubbed by
  scroll: the value sweeps 0 (today) to 100 (what's next) as the stage rises
  through the viewport (stage centre at 100% of viewport height down to 45%,
  at least 420px of travel) and runs back on scroll up. The value is eased,
  and written to a CSS variable so only whole-percent steps reach React.
  Nothing else is scrubbed or pinned; Reveal fade-ins and the drawn-to-built
  wipes (run once on entry) are the only other scroll-triggered motion.
- **Reduced motion:** everything static and fully visible; 3D shows its poster
  or one frame; interactive controls (slider) still work.

## 5. Page order and rhythm

| # | Section | id | Ground | Composition |
|---|---|---|---|---|
| — | Hero | — | paper | text left, object right (see hero brief) |
| 01 | Services | `services` | paper | four discipline "plates" stacked, alternating diagram side |
| 02 | Approach | `approach` | paper-raised band | full-width interactive seam comparison |
| 03 | Method | `method` | paper | four plates of the Approach's stone path, one per step, in a 2 × 2 grid |
| 04 | Capabilities | `capabilities` (+`#machines`) | paper | lattice diagram + mirrored list |
| 05 | About | `about` | paper-raised band | quote left, mark explanation right |
| 06 | Insights | `insights` | paper | index rows |
| 07 | Contact | `contact` | paper | direct details + the brief in a diagram frame |

Each section is `ruled` (hairline on top) and starts with `SectionMarker`
(`index`, label). H2 ids are `<id>-title`. One `h1` on the page (hero).

## 6. Sections

### Hero (built by the 3D builder; summary)
Eyebrow "UK Based // Working Globally"; two-tone H1 "Same business." (muted,
drawn) / "Better systems." (ink, built) *(proposed)*; existing lede; CTAs
"Start a conversation" → `/#contact`, "Explore services" → `/#services`;
the 3D mark (left half matte maquette, right half iridescent, seam sweeps on
scroll) with annotations "Current state / Transition / Better systems"; a
discipline index (01–04) linking to `#services-ai|automation|software|seo`.

### 01 Services
- **Purpose:** what we do, each discipline as a problem → work → outcome.
- **Copy:** `src/data/services.ts` verbatim (title, strapline, description,
  tags, outcome, href). H2: "Four disciplines, one way of working." *(proposed;
  live heading is "What We Do")*. Supporting line: "Also: Digital Strategy ·
  Data Integration · Analytics & BI · Technical Architecture" from
  `SUPPORTING_CAPABILITIES`.
- **Structure:** `ol` of four `article`s, each `id="services-<ai|automation|software|seo>"`
  with `scroll-mt-20`, `h3` = title.
- **Composition (1440):** each discipline is a horizontal "plate" separated by
  hairlines: left `col-span-5` text (index `01` mono + strapline as label, h3
  in `text-heading`, description, tags as a mono list separated by `·`, outcome
  as "Outcome — Practical Adoption" with a saffron ring node, `TextLink` "Read
  the article"), right `col-start-7 col-span-6` a diagram frame (aspect 4:3).
  Alternate: plates 2 and 4 put the diagram on the left. **390:** text then
  diagram, full width, diagram aspect 4:3.
- **Diagrams (inline SVG, unique per discipline), drawn half → built half
  split by a vertical seam at the frame's centre:**
  - AI: scattered unconnected nodes (left, drawn circles + dashed guesses) →
    a connected knowledge graph (right, solid nodes, edges, one hub).
  - Automation: a manual zig-zag path with hand-off markers (left) → a clean
    left-to-right flow of steps with arrowheads (right).
  - Software: a wireframe of an interface in dashed lines (left) → the same
    layout with filled blocks and type lines (right).
  - SEO: a noisy field of short scattered ticks (left) → ticks aligned into a
    rising signal with one highlighted point (right).
  On reveal, the drawn half's dashes draw in, then the built half fills (CSS).
- **Acceptance:** four anchors exist; each article link correct; no card
  boxes; diagrams `aria-hidden` with the meaning carried by text; no overflow
  at 390.

### 02 Approach (The Bridge) — 3D
- **Purpose:** the narrative made interactive: today → what's next.
- **Copy:** H2 "From today to what’s next." (live heading "From Today to
  What's Next."); lede from the legacy `Transition.tsx`; rows from
  `src/data/transition.ts` verbatim (label + status for both states).
- **Composition (1440):** paper-raised band. Top: marker, H2 left, lede right.
  Below: a full-width stage (`aspect-[21/9]`, max-h ~560px) holding the 3D
  stone path (rising from a low near plinth, today left, to a higher far one, what's next right) with the seam as a vertical line + handle at its x position.
  Under the stage: the five comparison rows as a table-like list, each row
  "Current" label/status on the left, "Next" label/status on the right; a row
  flips to built (ink, status in ink, small ring node) once the seam has passed
  its index (row i flips at (i+0.5)/5). **390:** stage `aspect-[4/3]`, rows
  stacked with both states visible, the active state emphasised.
- **Control:** the shadcn `Slider` (0–100) is the seam: label "Move the seam",
  `aria-valuetext` "Seam at 40%: 2 of 5 modernised". Only the visitor moves
  it (drag or keys) as a manual override, which fades back into the scroll
  position over ~320px of scrolling. Scrolling down and up also sweeps it (see
  Motion); reduced motion and no-JS never scroll-drive it. Rows flip as they
  come into view, not all at once.
- **3D:** fourteen chamfered pale-travertine slabs between two plinths (each
  with one low step), with nothing beneath or around them, rising from the low
  near plinth to a clearly higher far one in one eased line, seen from a low
  three-quarter view along the path. Left of the seam: slabs small, far apart,
  sunk, yawed and a few tilted, no inlay. Right of the seam: grown, level and
  closed up into one broad deck with a thin saffron inlay down its middle.
  Slabs settle by where they sit on the stage, so the seam line stays true
  under perspective. Matte Lambert stone (not tone mapped) over a faint warm
  glow behind the far end; the far plinth dissolves into the page. 2 instanced
  draw calls for slabs and inlays, 4 plinth meshes and the glow plane (7 in
  all), ~1k triangles, render on demand. Framed once at a reference aspect
  (1.4) and cropped like `object-cover` up to a stage aspect of 2.9, so the
  cover-fitted posters (`bridge-*-v9.png`, composited on paper-raised) match
  the canvas; on wider stages the canvas keeps the whole path and adds empty
  paper at the sides. Poster fallback for no-WebGL/reduced motion.
- **Acceptance:** slider keyboard (arrows, Home/End) updates rows and 3D; rows
  readable in both states without JS; reduced motion = posters, slider works, scroll does not move the seam; with
  motion, scrolling down builds the path and scrolling up undoes it; no
  sideways scroll with the seam at 0 or 100 (handle and line are clamped).

### 03 Method
- **Copy:** `src/data/process.ts` verbatim; H2 "How we work." *(live: "Process")*.
- **Composition:** a 2 x 2 grid from lg (stacked below 1024), one plate per step,
  each the same stone path as the Approach stage (src/components/home/method/stonePlates.ts
  projects the 3D scene's own layout and camera into SVG, so proportions, the
  rise toward the far plinth and the saffron inlay match). Both plinths are
  stone in every plate. Discover = the loose stones as they lie, with the gap
  measured from both plinths; Define = the deck drawn in dashes; Build =
  raised from the near plinth with the far part still drawn; Improve =
  standing, inlaid and measured. Below each plate: `h3` title (no step numerals),
  description. Colours are the `--color-slab-*` tokens. No 3D, no sticky
  stage, nothing driven by scroll; the plates draw in once on entry (the
  Services wipe) and are finished without JS or under reduced motion.
- **Acceptance:** four decorative plates (`aria-hidden`), readable without JS,
  no overflow at 390.

### 04 Capabilities (`#capabilities`, alias `#machines`)
- **Copy:** `src/data/capabilities.ts` + `SUPPORTING_CAPABILITIES` verbatim.
  H2 "What we build with." *(live: "Ancient Principles. Modern Machines.")*.
- **Composition (1440):** left `col-span-4`: marker, H2, short lede (use the
  live section's intro line if any, else none) and the accessible list (h3 per
  capability, category label, description). Right `col-start-6 col-span-7`: a
  lattice SVG — four discipline nodes on a top rail (AI, Automation, Software,
  SEO), six capability nodes in the middle, four supporting capabilities on a
  bottom rail, joined by struts in the mark's geometry (triangles). Hover/focus
  on a list item highlights its node and struts (built: ink, 1.5px) and dims
  the rest (drawn: line-strong, dashed). **390:** diagram first (full width,
  simplified), list below.
- **Acceptance:** keyboard focus on list items drives the highlight; diagram
  `aria-hidden`; `#machines` span present.

### 05 About
- **Copy:** legacy `Philosophy.tsx` verbatim (philosophy heading/quote, body,
  pillars, "Name & Origin" text). H2 "The right technology connects the
  pieces." (live). Name origin as plain text, no imagery.
- **Composition (1440):** paper-raised band. Left `col-span-6`: H2 and the
  philosophy text with the pillars as a mono row. Right `col-start-8
  col-span-5`: the glass `Mark` (~280px) with two callouts: left half "Drawn:
  the way it works today", right half "Built: the system it becomes"
  *(proposed captions)*, then the "Name & Origin" note under a hairline.
  **390:** text, then mark + callouts, then the note.

### 06 Insights
- **Copy:** `src/lib/blog.ts` / posts index verbatim (title, category, read
  time, slug). H2 "Ideas and observations." *(live: "Insights" / "Ideas &
  Observations")*.
- **Composition:** four index rows (pattern above): `01`, category, title in
  `text-subheading`, read time, arrow → `/insights/<slug>`. Under them a
  `TextLink` "All insights" → `/insights`. On hover a thin seam line sweeps
  across the row from left to right (CSS, transform only).

### 07 Contact
- **Copy:** closing H2 "Build a better way forward." (moved from the old hero);
  lede from the legacy contact section; email `CONTACT_EMAIL` always visible.
- **Composition (1440):** left `col-span-5`: marker, H2, lede, direct details
  (email as a large link, "UK Based // Working Globally", "Prefer email? Write
  to …"). Right `col-start-7 col-span-6`: the guided brief in a diagram frame:
  name, email, company (optional), "What do you need?" ToggleGroup (multiple:
  AI & Automation, Workflows, Software & Web, SEO & Growth, Not sure yet),
  timeline ToggleGroup (single: "As soon as possible", "1–3 months", "3–6
  months", "Just exploring"), message (min 20 chars). Submit "Open email to
  send" (primary, arrow). **390:** stacked; brief full width.
- **mailto format:** subject `Project enquiry: <needs joined by ", " or
  "General">`; body lines:
  `Name: …`, `Email: …`, `Company: …` (or `—`), `Interested in: …`,
  `Timeline: …`, blank line, message. Encode with `encodeURIComponent`.
- **Validation:** on submit only, then live per field; `aria-invalid`,
  `aria-describedby` to the error text, focus the first invalid field, a polite
  live region announcing "2 fields need attention". Required: name, valid
  email, at least one need, message ≥ 20 chars.
- **Fallback:** after submit show a panel: "Your email app should open. If it
  didn't:" with "Copy message" and "Copy address" buttons (clipboard API, then
  a selectable textarea fallback) and a status message.

## 7. 3D runtime and budgets
- At most 2 live WebGL contexts (core budget suspends the farthest); pause
  offscreen / hidden tab; DPR ≤ 2 desktop, 1.5 mobile, 1 low tier; posters for
  no-WebGL and reduced motion; three.js never in the initial bundle.
- Budgets (vs the live site): LCP ≤ 2152 ms desktop / 2640 ms mobile (lab),
  CLS < 0.05, fonts ≤ 187 KB (now 113 KB), no new console errors.

## 8. QA each builder runs
`pnpm exec eslint <own paths>`; `pnpm typecheck`; own e2e spec on all three
projects; screenshots at **1440×900 and 390×844 only** during iteration
(`node scripts/qa/shoot.mjs --sizes 1440x900,390x844 ...`) plus one
`--reduced` pass; zero console errors and zero overflow. The lead runs the
four-viewport pass at the end.

## 9. File ownership
Hero: `src/components/home/hero/**`, `src/components/three/{core,materials,geometry,scenes/seam}/**`,
`src/components/three/README.md`, `scripts/poster/**` (except bridge*/method*),
`public/hero/**`, `tests/e2e/hero.spec.ts`. Services: `home/services/**`,
`tests/e2e/services.spec.ts`. Bridge: `home/bridge/**`, `three/scenes/bridge/**`,
`scripts/poster/bridge*`, `public/bridge/**`, `tests/e2e/bridge.spec.ts`.
Method: `home/method/**`, `tests/e2e/method.spec.ts`. Capabilities+About:
`home/{capabilities,about}/**`, their specs. Insights+Contact:
`home/{insights,contact}/**`, their specs. Lead: everything else.
