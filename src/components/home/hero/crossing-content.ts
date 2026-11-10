import { HERO_DISCIPLINES } from "./content";

/*
 * Copy for the Crossing hero. The headline, lede and chart labels are taken
 * from the company's LinkedIn overview (supplied by the CTO, 2026-11-01) and
 * logged as proposed in docs/redesign/COPY_CHANGES.md. The tiers are the
 * site's own four disciplines.
 */
export const CROSSING_COPY = {
  /** LinkedIn's closing line. */
  title: ["Cross the bridge.", "Enter the future."],
  /**
   * LinkedIn's opening line, without "At Chinvat Bridge,", then the four services by name. Kept to
   * three lines on desktop so the H1, not the later-rising lede, stays the largest contentful paint.
   */
  lede: "We bridge the gap between complex challenges and intelligent technology: AI and automation, custom software, SEO, and data analytics.",
  /** The chart's left-hand bracket, from the same sentence. */
  above: "Complex challenges",
  below: "Intelligent technology",
} as const;

/** The site's four disciplines (as in the shipped hero), narrowest tier first; `short` is lettered inside the tier. */
const SHORT = ["AI", "Automation", "Software", "SEO"] as const;
export const TIERS = HERO_DISCIPLINES.map((item, i) => ({
  ...item,
  short: SHORT[i],
}));
