/*
 * Shared numbers for the Bridge span and the HTML around it. Pure data (no
 * three), so server components can import it.
 *
 * The span is a through-truss bridge between two banks, seen from the side
 * and a little above by an orthographic camera that only pitches: world x is
 * screen x, so the material seam (a plane at world x) lands exactly under the
 * HTML seam line. The left bank is how things work today, the right bank is
 * where they could.
 */

export const BRIDGE_SPAN = {
  /** Bays along the span, and the length of one, world units. */
  panels: 10,
  panel: 1.6,
  /** Distance between the two trusses, which is also the width of the deck. */
  depth: 2.6,
  /** Truss height above the deck at the abutments and at midspan. */
  endHeight: 0.9,
  crownHeight: 4,
  /** Square-section strut size. */
  strut: 0.09,
  /** Ring node radius and tube (square-ish section: 4 radial segments). */
  ringRadius: 0.17,
  ringTube: 0.04,
  deckThickness: 0.1,
  /** Share of the deck's width that is walkable while the span is still drawn. */
  deckDrawn: 0.28,
  /** Share of the diagonals and verticals left out of the drawing. */
  missing: 0.14,
  /** The two banks the span rests on. */
  bankWidth: 2.6,
  bankHeight: 1.6,
  /** Camera elevation above the deck, degrees (90 = plan view). */
  elevation: 22,
  /** Room around the structure, as a share of its projected height. */
  margin: 1.14,
  /** Narrowest share of the whole span the frame may crop to (small screens). */
  minShare: 0.7,
  /** Half-width of the band in which a piece settles from loose to aligned, world units. */
  band: 0.85,
  seed: 20251,
} as const;

/** Slider range (value = share modernised, 0..100). */
export const BRIDGE_SEAM = {
  min: 0,
  max: 100,
  /** Server render and reduced motion. */
  initial: 50,
} as const;

/** Rendered by scripts/poster/bridge.mjs; bump the version there and here after a scene change (busts the image cache). */
export const BRIDGE_POSTERS = {
  drawn: "/bridge/bridge-drawn-v7.png",
  built: "/bridge/bridge-built-v7.png",
} as const;
