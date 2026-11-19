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

/** A BreadcrumbList from Home through each named path, as absolute canonical URLs. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "" }, ...trail].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
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
    breadcrumbJsonLd([{ name, path }]),
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
export function JsonLdScripts({ data }: { data: ({ "@type": string } & Record<string, unknown>)[] }) {
  return data.map((block) => (
    <script
      key={block["@type"]}
      type="application/ld+json"
      // Escaped so no string in the data can close the script element.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(block).replace(/</g, "\\u003c") }}
    />
  ));
}
