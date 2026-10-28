/*
 * Brand colours for 3D, as sRGB hex. They match tokens.css and the logo's
 * measured glass clusters (deep cerulean into saffron). three converts them
 * to linear when they become Color objects.
 */
export const PALETTE_3D = {
  paper: 0xf6f4ef,
  paperRaised: 0xfbfaf7,
  ink: 0x0b1a26,
  inkSoft: 0x33414c,

  /** The material ramp of the built half, darkest to lightest. */
  cerulean: 0x0b263c,
  cobalt: 0x0f557d,
  azure: 0x1c8ec3,
  saffron: 0xcf9c48,
  saffronLight: 0xebc26b,
  /** Grazing-angle highlight. */
  cream: 0xf2e8c4,
  /** A trace of cyan sheen, as in the logo. */
  cyan: 0x1edff0,
} as const;
