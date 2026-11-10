import type { Metadata } from "next";
import { SITE_NAME } from "./constants";

/**
 * Open Graph fields every page shares. Next merges metadata shallowly, so a page that sets its own
 * openGraph replaces the layout's whole object, the file-based share image (app/opengraph-image.png)
 * included; such a page spreads these in to keep the image, site name and locale.
 */
export const SHARED_OPEN_GRAPH = {
  siteName: SITE_NAME,
  locale: "en_GB",
  images: [
    {
      url: "/opengraph-image.png",
      width: 1200,
      height: 630,
      // Same text as app/opengraph-image.alt.txt.
      alt: "Chinvat Bridge: AI, automation, software and SEO. The mark is split down its axis, flat ink on one side and iridescent glass on the other.",
    },
  ],
} satisfies NonNullable<Metadata["openGraph"]>;

interface PageMetadataInput {
  /** The page's own title; the layout's template adds the site name in <title>. */
  title: string;
  description: string;
  /** Path of the page, e.g. "/pricing"; resolved against metadataBase. */
  path: string;
}

/**
 * Title, description, canonical, Open Graph and Twitter for an inner page. Both social objects
 * are set in full, since a page that leaves one out inherits the root layout's, which describes
 * the homepage. The Twitter card takes its image from openGraph (Next fills it in).
 */
export function pageMetadata({ title, description, path }: PageMetadataInput): Metadata {
  const socialTitle = `${title} — ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...SHARED_OPEN_GRAPH, type: "website", url: path, title: socialTitle, description },
    twitter: { card: "summary_large_image", title: socialTitle, description },
  };
}
