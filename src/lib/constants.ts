export const SITE_NAME = "Chinvat Bridge";
/**
 * The homepage title leads with the offer, not the name: a search for "Chinvat Bridge" alone
 * returns the Zoroastrian bridge, so the name earns little on its own (seo/overnight-2026-11-18).
 * The business is UK-based and works internationally, so titles name the buyer (SMEs), not a
 * country; "UK-based" stays in descriptions as a fact.
 */
export const SITE_TITLE = "AI, Automation & Custom Software for SMEs — Chinvat Bridge";
export const SITE_DESCRIPTION =
  "UK-based technology consultancy for small businesses worldwide: AI integration, workflow automation, custom software and technical SEO, built around your work.";
/** Where the name comes from, for structured data. Sourced in the About section and docs/redesign/COPY_CHANGES.md. */
export const SITE_ORIGIN =
  "The name comes from the Chinvat Bridge of ancient Persian tradition, the crossing where a person's own conscience meets them, and stands for the move from how a business works today to how it could work tomorrow.";
/**
 * The canonical origin. Production sets NEXT_PUBLIC_SITE_URL; it must be the .com, which is the
 * primary domain and the one the mail runs on (.uk should redirect to it).
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.chinvatbridge.com";

export const CONTACT_EMAIL = "artin@chinvatbridge.com";
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;
