/*
 * Shared numbers for the Bridge strut field and the HTML around it. Pure
 * data (no three), so server components can import it.
 *
 * The field is a double-layer space frame lying flat, seen from above by an
 * orthographic camera that only pitches: world x is screen x, so the
 * material seam (a plane at world x) lands exactly under the HTML seam line.
 */

export const BRIDGE_FIELD = {
  /** Nodes along x on the top layer (the bottom layer has one fewer). */
  columns: 17,
  /** Nodes along z on the top layer. */
  rows: 5,
  /** Grid spacing, world units. */
  bay: 1.1,
  /** Distance between the top and bottom layers. */
  thickness: 0.95,
  /** Square-section strut size. */
  strut: 0.055,
  /** Ring node radius and tube (square-ish section: 4 radial segments). */
  ringRadius: 0.13,
  ringTube: 0.032,
  /** Camera elevation above the slab, degrees (90 = plan view). */
  elevation: 50,
  /** Vertical room around the slab, as a share of its projected height. */
  margin: 1.14,
  /** Frame centre above the origin, world units: balances the margins around the projected slab. */
  centreY: 0.24,
  /** Half-width of the band in which a strut settles from loose to aligned, world units. */
  band: 0.85,
  seed: 20251,
} as const;

/** Slider range and the scroll scrub (value = share modernised, 0..100). */
export const BRIDGE_SEAM = {
  min: 0,
  max: 100,
  /** Server render and reduced motion. */
  initial: 50,
  scrubFrom: 10,
  scrubTo: 90,
} as const;

/** Rendered by scripts/poster/bridge.mjs; bump the version there and here after a scene change (busts the image cache). */
export const BRIDGE_POSTERS = {
  drawn: "/bridge/bridge-drawn-v5.png",
  built: "/bridge/bridge-built-v5.png",
} as const;
