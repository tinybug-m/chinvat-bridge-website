import type { ReactNode } from "react";
import { getPostBySlug } from "@/lib/blog";

/**
 * Shows its children only while the article `slug` is published: a sentence that points to
 * another article, written so the text still reads when it is left out. Drafts can then link to
 * each other and be published in any order, without a link to a page that doesn't exist yet.
 * Under `next dev` drafts count as published, so a draft is reviewed with all its links in place.
 */
export function WhenPublished({ slug, children }: { slug: string; children: ReactNode }) {
  return getPostBySlug(slug) ? children : null;
}
