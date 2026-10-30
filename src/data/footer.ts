export interface FooterLink {
  label: string;
  href: string;
}

export const DISCIPLINE_LINKS: FooterLink[] = [
  { label: "AI & Automation", href: "/#services-ai" },
  { label: "Workflows", href: "/#services-automation" },
  { label: "Software & Web", href: "/#services-software" },
  { label: "SEO & Growth", href: "/#services-seo" },
];

export const SECTION_NAV_LINKS: FooterLink[] = [
  { label: "Services", href: "/#services" },
  { label: "Approach", href: "/#approach" },
  { label: "Insights", href: "/#insights" },
  { label: "About", href: "/#about" },
];
