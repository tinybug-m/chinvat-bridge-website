export interface SiteLink {
  label: string;
  href: string;
  /** Homepage section that lights this link in the header, when the href is a page rather than its anchor. */
  section?: string;
}

/**
 * Homepage chapters in the header, in page order. Insights goes to the /insights index rather than
 * the homepage teaser, but still lights while the teaser (#insights) is being read.
 */
export const SECTION_LINKS: SiteLink[] = [
  { label: "Services", href: "/#services" },
  { label: "Work", href: "/#work" },
  { label: "Approach", href: "/#approach" },
  { label: "About", href: "/#about" },
  { label: "Insights", href: "/insights", section: "insights" },
];

/** The homepage section id a header link stands for. */
export const sectionOf = (link: SiteLink) => link.section ?? link.href.split("#")[1];

/**
 * Prefetch setting for links in the new header, menu and footer: off. A hash link on the homepage
 * would prefetch the page onto itself, and the inner pages load on click rather than on sight.
 */
export const prefetchFor = (href: string) => (href.startsWith("/#") || href !== "/" ? false : undefined);

export const PRICING_LINK: SiteLink = { label: "Pricing", href: "/pricing" };
export const LOGIN_LINK: SiteLink = { label: "Client login", href: "/login" };
export const CONTACT_LINK: SiteLink = { label: "Start a conversation", href: "/#contact" };

/**
 * Sections without a header link light up the nearest chapter instead.
 * Capabilities has none on purpose: reading it must not hand the highlight back to Services.
 */
export const SECTION_ALIASES: Record<string, string> = {
  method: "approach",
};

/** One anchor per discipline inside #services. */
export const DISCIPLINE_LINKS: SiteLink[] = [
  { label: "AI & Automation", href: "/#services-ai" },
  { label: "Workflows", href: "/#services-automation" },
  { label: "Software & Web", href: "/#services-software" },
  { label: "SEO & Growth", href: "/#services-seo" },
];
