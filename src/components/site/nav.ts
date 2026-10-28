export interface SiteLink {
  label: string;
  href: string;
}

/** Homepage chapters in the header, in page order. */
export const SECTION_LINKS: SiteLink[] = [
  { label: "Services", href: "/#services" },
  { label: "Approach", href: "/#approach" },
  { label: "Insights", href: "/#insights" },
  { label: "About", href: "/#about" },
];

export const PRICING_LINK: SiteLink = { label: "Pricing", href: "/pricing" };
export const LOGIN_LINK: SiteLink = { label: "Client login", href: "/login" };
export const CONTACT_LINK: SiteLink = { label: "Start a conversation", href: "/#contact" };

/** Sections without a header link light up the nearest chapter instead. */
export const SECTION_ALIASES: Record<string, string> = {
  method: "approach",
  capabilities: "services",
};

/** One anchor per discipline inside #services. */
export const DISCIPLINE_LINKS: SiteLink[] = [
  { label: "AI & Automation", href: "/#services-ai" },
  { label: "Workflows", href: "/#services-automation" },
  { label: "Software & Web", href: "/#services-software" },
  { label: "SEO & Growth", href: "/#services-seo" },
];
