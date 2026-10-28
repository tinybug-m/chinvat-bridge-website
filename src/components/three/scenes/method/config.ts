/*
 * Shared numbers for the Method node and the HTML around it. Pure data (no
 * three), so server components can import it.
 *
 * The node is one space-frame cell: an octahedron of square-section struts
 * with a ring node at every joint and a seventh where its three axes cross.
 * It is framed in a 4:3 box, "contain"-fitted, so the 4:3 posters line up
 * with the live canvas inside the square desktop stage.
 */

export const METHOD_NODE = {
  /** Distance from the centre to each joint, world units. */
  radius: 1.9,
  /** Square-section strut size. */
  strut: 0.085,
  /** Ring node radius and tube. */
  ringRadius: 0.2,
  ringTube: 0.05,
  /** Camera elevation, degrees, and distance from the target. */
  elevation: 17,
  distance: 24,
  /** Turn about y at Discover, and how far the scroll turns it by Improve, degrees. */
  yaw: 22,
  turn: 38,
  /** The ground ellipse (a drawn plinth) radius. */
  groundRadius: 2.35,
  seed: 3031,
} as const;

/** The framed area in world units (4:3), centred on the target. */
export const METHOD_FRAME = { width: 8.2, height: 6.15, centreY: -0.5 } as const;
export const METHOD_FRAME_ASPECT = METHOD_FRAME.width / METHOD_FRAME.height;

/**
 * One state per step of src/data/process.ts, in order. The poster names
 * carry a version: next/image caches optimised images by URL, so bump it
 * whenever scripts/poster/method.mjs renders new ones (the script reads the
 * names from here).
 */
export const METHOD_STATES = [
  { key: "survey", caption: "Point cloud", poster: "/method/method-survey-v2.png" },
  { key: "wireframe", caption: "Wireframe", poster: "/method/method-wireframe-v2.png" },
  { key: "maquette", caption: "Maquette", poster: "/method/method-maquette-v2.png" },
  { key: "material", caption: "Material", poster: "/method/method-material-v2.png" },
] as const;

/** Poster pixel size (2x the widest place a frame is shown). */
export const METHOD_POSTER_SIZE = { width: 1200, height: 900 } as const;
