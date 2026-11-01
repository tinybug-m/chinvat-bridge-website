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
