import { BRIDGE_POSTERS } from "@/components/three/scenes/bridge/config";

/*
 * The bridges on the studies page: the shipped one, and Nine Spears (the
 * razor's edge that widens to nine spears' length) drawn in four different
 * visual languages. Three are flat SVG illustrations (they follow the
 * slider, they do not turn); the etching is a WebGL scene with an ink
 * hatching shader. Pure data (server-safe).
 */

export type StudyId = "original" | "miniature" | "blueprint" | "etching" | "poster";

export interface Study {
  id: StudyId;
  number: string;
  name: string;
  /** Small label over the name. */
  kind: string;
  /** One line: the idea. */
  thesis: string;
  /** The part of the Chinvat story it draws on. */
  story: string;
  concept: string;
  notes: { label: string; text: string }[];
  /** Today (0) and future (1) in a few words, for the slider ends. */
  states: [string, string];
  adoption: string;
  /** "webgl" turns and zooms; "svg" is a flat illustration that follows the slider. */
  medium: "webgl" | "svg";
  /** Stage ground behind a WebGL canvas. */
  ground?: string;
  /** Still for a WebGL study before (or instead of) the canvas; SVG studies draw themselves. */
  poster?: string;
}

const STORY = "For those who fail, Chinvat is as narrow as a razor's edge; for those who cross, it widens to nine spears' length.";

export const STUDIES: Study[] = [
  {
    id: "original",
    number: "00",
    name: "Stone path",
    kind: "Current bridge · 3D",
    thesis: "Loose slabs that level and close into one deck.",
    story: "The crossing itself: a way over that is only implied until it is built.",
    concept:
      "The bridge on the site today, for reference. Fourteen pale travertine slabs rise from a low plinth to a higher one. Today they are small, sunk and turned; built, they have grown, levelled and closed into a single deck with a saffron inlay.",
    notes: [
      { label: "Medium", text: "WebGL, lit 3D model." },
      { label: "Palette", text: "Pale travertine on paper; one saffron inlay." },
      { label: "Movement", text: "Each slab grows, levels and closes up." },
      { label: "Reads as", text: "Calm and abstract, close to a diagram." },
    ],
    states: ["Loose slabs", "One deck"],
    adoption: "Already in place: the Approach stage, the four Method plates and the 404 all use it.",
    medium: "webgl",
    ground: "var(--color-paper-raised)",
    poster: BRIDGE_POSTERS.built,
  },
  {
    id: "miniature",
    number: "01",
    name: "Miniature",
    kind: "Nine Spears · Persian illumination",
    thesis: "The bridge painted as a page from a Persian manuscript.",
    story: STORY,
    concept:
      "A lapis night sky with gold stars and a rayed sun, two massifs of the lobed, striated rock that miniature painters use for mountains, cloud scrolls in the abyss and gold waves at its floor, all inside a gilded frame. The bridge is a single gold hairline, the razor's edge with a glint on it, that opens into nine gilded spears laid on a strip of night, heads toward the far peak. A title cartouche quotes the story.",
    notes: [
      { label: "Medium", text: "Flat SVG illustration, drawn in code; no WebGL." },
      { label: "Palette", text: "Lapis, gold and cream: the brand's cerulean and saffron, richer." },
      { label: "Movement", text: "The nine spears open from the centre; the cartouche turns over." },
      { label: "Reads as", text: "Heritage and story first. The most Persian, the most ornamental." },
    ],
    states: ["Razor's edge", "Nine spears"],
    adoption:
      "Brings the name's origin onto the page. It needs a dark, framed panel on a light site, and the ornament would have to be pared back for the four small Method plates.",
    medium: "svg",
  },
  {
    id: "blueprint",
    number: "02",
    name: "Blueprint",
    kind: "Nine Spears · engineering drawing",
    thesis: "A cyanotype general arrangement, dimensioned.",
    story: STORY,
    concept:
      "White linework on cobalt with a drafting grid. Elevation across the top with the plinths hatched, the span and rise dimensioned and a section mark at mid-span; section A–A and the plan below; a title block in the corner. The section carries the story: one blade on its edge opening into nine knife sections, its width dimension counting from 120 to 3 200. Saffron is used only for the two notes that quote the myth.",
    notes: [
      { label: "Medium", text: "Flat SVG drawing, live dimensions; no WebGL." },
      { label: "Palette", text: "Cobalt and white, with saffron for the story's notes." },
      { label: "Movement", text: "Section and plan open; dimensions and revision update." },
      { label: "Reads as", text: "Rigour and engineering. Says ‘we build things properly’." },
    ],
    states: ["One blade", "Nine blades"],
    adoption:
      "Speaks directly to the services (software, automation). Scales well: the Method plates could each be one sheet (survey, section, plan, as built). The 404 is a sheet with a red-lined gap.",
    medium: "svg",
  },
  {
    id: "etching",
    number: "03",
    name: "Etching",
    kind: "Nine Spears · engraved plate · 3D",
    thesis: "A 3D bridge printed like a plate from an old book.",
    story: STORY,
    concept:
      "The 3D Nine Spears with every surface drawn in ink hatching on warm paper: single lines where the light starts to turn, crossed where it falls away, denser in shadow, and every edge inked. It still turns and zooms, and the hatching stays on the page grid as it turns, the way a print would. The plinths dissolve into the paper.",
    notes: [
      { label: "Medium", text: "WebGL with a custom hatching shader; rotatable." },
      { label: "Palette", text: "Ink on warm paper; no colour at all." },
      { label: "Movement", text: "The razor fans out into nine blades, centre first." },
      { label: "Reads as", text: "Crafted, timeless, a little literary. Unusual on the web." },
    ],
    states: ["Razor's edge", "Nine spears"],
    adoption:
      "Keeps the interactive 3D of the current site but in a hand-made style. Monochrome sets off the colourful hero. Ink hatching can also be drawn in SVG for the Method plates and the 404.",
    medium: "webgl",
    // Engraved sky: fine horizontal rules over warm paper, as old plates draw air.
    ground: "repeating-linear-gradient(to bottom, rgb(11 26 38 / 0.12) 0 1px, transparent 1px 6px), #efe5cf",
    poster: "/bridge-studies/etching-v1.webp",
  },
  {
    id: "poster",
    number: "04",
    name: "Poster",
    kind: "Nine Spears · modernist graphic",
    thesis: "Ink, a saffron sun, one diagonal and big type.",
    story: STORY,
    concept:
      "A modernist poster. Today the diagonal is a single hairline and the headline reads ‘As narrow as a razor.’ Built, nine heavy bars fan out along it, the centre one cerulean, and the headline turns to ‘Nine spears wide.’ A ruler at the foot counts the spears as they land. Typography carries as much of the idea as the drawing.",
    notes: [
      { label: "Medium", text: "Flat SVG with live type; no WebGL." },
      { label: "Palette", text: "Ink, paper, saffron sun, one cerulean bar." },
      { label: "Movement", text: "Bars fan out from the centre; the headline and ruler change." },
      { label: "Reads as", text: "Bold and confident. The most graphic, the least literal." },
    ],
    states: ["A razor", "Nine wide"],
    adoption:
      "Would make the Approach a statement section in the site's own type. Easy to adapt: the Method plates as four posters, the 404 as ‘This bridge is as narrow as a razor.’",
    medium: "svg",
  },
];

export const STUDY_BY_ID = Object.fromEntries(STUDIES.map((study) => [study.id, study])) as Record<StudyId, Study>;

/** The side-by-side matrix: one row per question, one cell per study, in STUDIES order. */
export const COMPARISON: { label: string; cells: string[] }[] = [
  { label: "Style", cells: ["Pale 3D model", "Persian miniature", "Engineering drawing", "Engraving", "Modernist poster"] },
  { label: "Medium", cells: ["WebGL", "SVG", "SVG", "WebGL (hatching shader)", "SVG"] },
  { label: "Can be turned", cells: ["Yes", "No", "No", "Yes", "No"] },
  { label: "Palette", cells: ["Stone, saffron", "Lapis, gold, cream", "Cobalt, white, saffron", "Ink, paper", "Ink, saffron, cerulean"] },
  { label: "Ties to", cells: ["The seam", "The name's origin", "The services", "Craft", "The type"] },
  { label: "Change to the site", cells: ["None", "Large (dark ornate panel)", "Medium (blue panel)", "Small", "Medium (dark panel)"] },
  { label: "Risk", cells: ["Reads as a diagram", "Ornament over clarity", "Cold, technical", "Old-fashioned", "Loud next to the hero"] },
];
