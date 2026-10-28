import { MARK_WIDTH_UNITS, UNITS_PER_PX, framePercent, markFrame } from "../../geometry/mark-outline";

/*
 * Shared numbers for the seam scene and the HTML around it. Pure data, so
 * the hero's server components use the same frame as the camera: the line
 * drawing, the poster and the annotations all land exactly on the object.
 */

/**
 * The stage frame in source pixels. The camera fits it to the canvas with
 * "contain", the poster is rendered at its aspect, and the SVG drawing uses
 * it as its viewBox. Padding leaves room for the shadow and the tilt.
 */
export const SEAM_FRAME = markFrame(44, 40, 72);

/** CSS aspect-ratio of the stage box. */
export const SEAM_FRAME_ASPECT = `${SEAM_FRAME.width.toFixed(1)} / ${SEAM_FRAME.height.toFixed(1)}`;

export const SEAM_SCENE = {
  /** Extrusion depth and bevel, in world units (the mark is 10 units tall). */
  depth: 1.1,
  bevel: 0.07,
  bevelSegments: 3,
  /** Camera distance from the silhouette plane. Longer is flatter. */
  cameraDistance: 30,
  /** Pointer tilt limits, in degrees. */
  maxYaw: 6,
  maxPitch: 4,
  /** Seam travel: beyond this x the whole mark is on one side. */
  seamReach: MARK_WIDTH_UNITS / 2 + 0.15,
  /** Intro sweep, from fully drawn to the axis: delay + duration stays under 1.2 s. */
  introDelay: 120,
  introDuration: 1050,
} as const;

/** Frame size in world units. */
export const SEAM_FRAME_UNITS = {
  width: SEAM_FRAME.width * UNITS_PER_PX,
  height: SEAM_FRAME.height * UNITS_PER_PX,
} as const;

/** Mark features the annotations point at, in source pixels. */
export const SEAM_ANCHORS = {
  /** The ring node on the drawn half, and its mirror on the built half. */
  ringDrawn: framePercent(SEAM_FRAME, 559.5, 384.2),
  ringBuilt: framePercent(SEAM_FRAME, 691.5, 384.2),
  /** Where the seam crosses the top strut, and the foot of the axis. */
  seamTop: framePercent(SEAM_FRAME, 625.5, 396.4),
  seamFoot: framePercent(SEAM_FRAME, 625.5, 917),
  /** The two feet of the mark. */
  footDrawn: framePercent(SEAM_FRAME, 545.5, 917),
  footBuilt: framePercent(SEAM_FRAME, 705.5, 917),
  /** Outer tips of the two heavy bars. */
  tipDrawn: framePercent(SEAM_FRAME, 324, 416.5),
  tipBuilt: framePercent(SEAM_FRAME, 927, 416.5),
} as const;
