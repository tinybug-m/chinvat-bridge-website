import { Cinzel, EB_Garamond, Inter, Space_Grotesk } from "next/font/google";

// Copies of ./legacy-fonts without preloading, for the root 404 and error
// boundaries. Those modules are in every route's graph, so preloading here
// would make every page, the new homepage included, fetch the old fonts.
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
  preload: false,
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false,
});

export const legacyBoundaryFontVariables = [cinzel, ebGaramond, inter, spaceGrotesk]
  .map((font) => font.variable)
  .join(" ");
