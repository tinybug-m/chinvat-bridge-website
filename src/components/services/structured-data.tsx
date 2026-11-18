import { getPostBySlug } from "@/lib/blog";
import { SITE_URL } from "@/lib/constants";

/*
 * What every service page shares besides its layout blocks: its Service and BreadcrumbList data,
 * and its "Related insights" links. The Service carries no offers (prices live on /pricing or are
 * quoted), and its provider is the Organization the root layout declares.
 */

interface ServiceSchemaInput {
  path: string;
  /** The service's name, as on the homepage plate; also the breadcrumb label. */
  name: string;
  serviceType: string;
  description: string;
}

export function serviceJsonLd({ path, name, serviceType, description }: ServiceSchemaInput) {
  const url = `${SITE_URL}${path}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${url}#service`,
      name,
      serviceType,
      description,
      url,
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: "Worldwide",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name, item: url },
      ],
    },
  ];
}

/** Article links with the reason each is worth reading; slugs that no longer resolve are skipped. */
export function relatedInsightLinks(items: { slug: string; reason: string }[]) {
  return items.flatMap(({ slug, reason }) => {
    const post = getPostBySlug(slug);
    return post ? [{ href: `/insights/${slug}`, title: post.meta.title, reason }] : [];
  });
}

/** One JSON-LD script per block. */
export function JsonLdScripts({ data }: { data: { "@type": string }[] }) {
  return data.map((block) => (
    <script
      key={block["@type"]}
      type="application/ld+json"
      // Escaped so no string in the data can close the script element.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(block).replace(/</g, "\\u003c") }}
    />
  ));
}
