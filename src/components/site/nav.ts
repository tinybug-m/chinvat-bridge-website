export interface SiteLink {
  label: string;
  href: string;
}

/** Homepage chapters in the header, in page order. */
export const SECTION_LINKS: SiteLink[] = [
  { label: "Services", href: "/#services" },
  { label: "Work", href: "/#work" },
  { label: "Approach", href: "/#approach" },
  { label: "About", href: "/#about" },
  { label: "Insights", href: "/#insights" },
];

export const PRICING_LINK: SiteLink = { label: "Pricing", href: "/pricing" };
export const LOGIN_LINK: SiteLink = { label: "Client login", href: "/login" };
export const CONTACT_LINK: SiteLink = { label: "Start a conversation", href: "/#contact" };

/**
 * Sections without a header link light up the nearest chapter instead.
 * Capabilities has none on purpose: reading it must not hand the highlight back to Services.
 * Team has none either, but it belongs to About, so About stays lit while reading it.
 */
export const SECTION_ALIASES: Record<string, string> = {
  method: "approach",
  team: "about",
};

/** One anchor per discipline inside #services. */
export const DISCIPLINE_LINKS: SiteLink[] = [
  { label: "AI & Automation", href: "/#services-ai" },
  { label: "Workflows", href: "/#services-automation" },
  { label: "Software & Web", href: "/#services-software" },
  { label: "SEO & Growth", href: "/#services-seo" },
];
