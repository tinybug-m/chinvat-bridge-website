import { PRICING_LINK, SECTION_LINKS } from "@/components/site/nav";

export interface NavLink {
  label: string;
  href: string;
}

/* The legacy pages' header lists the same links, in the same order, as the new site header. */
export const NAV_LINKS: NavLink[] = [...SECTION_LINKS, PRICING_LINK];
