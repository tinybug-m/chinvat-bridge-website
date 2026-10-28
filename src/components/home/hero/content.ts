/*
 * Hero copy. Verbatim from the current site (organisms/sections/Hero.tsx)
 * except where noted; every change is listed for the owner's review.
 */
export const HERO_COPY = {
  eyebrow: "UK Based // Working Globally",
  /** PROPOSED headline (was "Build a better way forward."): the drawn line, then the built line. */
  titleDrawn: "Same business.",
  titleBuilt: "Better systems.",
  lede: "Chinvat Bridge helps businesses use AI, automation and modern software to reduce manual work, improve digital performance and build better ways of working.",
  /** Sentence case; was "Start a Conversation". */
  primary: { label: "Start a conversation", href: "/#contact" },
  /** Was "Explore Our Services". */
  secondary: { label: "Explore services", href: "/#services" },
} as const;

/** The only place the disciplines appear in the hero; short forms of the service titles. */
export const HERO_DISCIPLINES = [
  { index: "01", label: "AI integration", href: "/#services-ai" },
  { index: "02", label: "Automation & workflows", href: "/#services-automation" },
  { index: "03", label: "Software & web", href: "/#services-software" },
  { index: "04", label: "SEO & growth", href: "/#services-seo" },
] as const;

/** Drawing callouts tied to the object. */
export const SEAM_LABELS = {
  drawn: { index: "01", label: "Current state" },
  seam: { index: "02", label: "Transition" },
  built: { index: "03", label: "Better systems" },
} as const;
