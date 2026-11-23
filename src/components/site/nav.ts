import type { Navigation, SiteSettings } from "@/lib/content/schema";

export interface SiteLink {
  label: string;
  href: string;
  /** Homepage section that lights this link in the header, when the href is a page rather than its anchor. */
  section?: string;
}

/**
 * What the header, mobile menu and footer render, from navigation:main and settings:site. The link
 * labels and targets are content; which homepage section each header link lights, the prefetch
 * policy and the section aliases below are code.
 */
export interface ShellChrome {
  /** Homepage chapters in the header, in page order. Insights goes to /insights but lights for the #insights teaser. */
  sections: SiteLink[];
  pricing: SiteLink;
  login: SiteLink;
  contact: SiteLink;
  /** One link per discipline, to its service page, named as the page names its service. */
  disciplines: SiteLink[];
  contactEmail: string;
  eyebrow: string;
  header: SiteSettings["header"];
  footer: SiteSettings["footer"];
}

export function shellChrome(navigation: Navigation, settings: SiteSettings): ShellChrome {
  const link = ({ label, href }: { label: string; href: string }): SiteLink => ({ label, href });
  return {
    sections: navigation.sections.map((s) => ({ label: s.label, href: s.href, section: s.key })),
    pricing: link(navigation.pricing),
    login: link(navigation.login),
    contact: link(navigation.contact),
    disciplines: navigation.disciplines.map(link),
    contactEmail: settings.contactEmail,
    eyebrow: settings.eyebrow,
    header: settings.header,
    footer: settings.footer,
  };
}

/** The homepage section id a header link stands for. */
export const sectionOf = (link: SiteLink) => link.section ?? link.href.split("#")[1];

/**
 * Prefetch setting for links in the new header, menu and footer: off. A hash link on the homepage
 * would prefetch the page onto itself, and the inner pages load on click rather than on sight.
 */
export const prefetchFor = (href: string) => (href.startsWith("/#") || href !== "/" ? false : undefined);

/**
 * Sections without a header link light up the nearest chapter instead.
 * Capabilities has none on purpose: reading it must not hand the highlight back to Services.
 */
export const SECTION_ALIASES: Record<string, string> = {
  method: "approach",
};
