/*
 * Shared numbers for the Bridge path and the HTML around it. Pure data (no
 * three), so server components can import it.
 *
 * The path is a row of pale stone slabs rising from a low near plinth to a
 * higher far one, seen from a low three-quarter view that looks along it from
 * the near end. The left of the seam is how things work today (slabs small,
 * far apart, sunk and yawed, a few tilted); the right is where they could be
 * (slabs grown, level and closed up into one broad deck with a saffron inlay).
 */

export const BRIDGE_PATH = {
  slabs: 14,
  /** Built slab, world units: along the path, across it, and thick. */
  length: 1.8,
  depth: 3.2,
  thickness: 0.78,
  /** Gap between built slabs, and from the near plinth to the first slab. */
  closed: 0.05,
  lead: 0.1,
  bevel: 0.035,
  /** Loose slab size as a share of the built one, at the near end and at the far end. */
  looseLength: [0.55, 0.75],
  looseDepth: [0.31, 0.62],
  looseThickness: [0.64, 0.85],
  /** Open space between loose slabs (world units, before the path is fitted back to its ends), near end and far end. */
  looseGap: [1.3, 0.6],
  /** Total rise from the near plinth to the far one, and the share of it that is a steady climb. */
  rise: 4.4,
  climb: 0.62,
  plinthLength: 2,
  plinthDepth: 2.5,
  plinthHeight: 1.1,
  /** Camera: azimuth and elevation off the path's axis (radians), vertical field of view (degrees). */
  azimuth: 0.82,
  elevation: 0.17,
  fov: 30,
  /**
   * The stage is framed once at this aspect. Wider stages keep that width and
   * crop top and bottom, narrower ones crop the sides: the same as the
   * posters' object-cover, so poster and canvas line up, up to maxAspect.
   */
  referenceAspect: 1.4,
  /** Beyond this stage aspect the crop stops (the path stays whole and the sides gain empty paper). */
  maxAspect: 2.9,
  /** Share of the half-width the path (plinth to plinth) fills at the reference aspect. */
  fit: 0.66,
  /** Share of the stage width in which a slab settles from loose to level. */
  band: 0.12,
  seed: 2718,
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
  drawn: "/bridge/bridge-drawn-v8.png",
  built: "/bridge/bridge-built-v8.png",
} as const;
