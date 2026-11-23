import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/templates/SiteShell";
import { Pricing } from "@/components/organisms/sections/Pricing";
import { JsonLdScripts, breadcrumbJsonLd } from "@/components/services/structured-data";
import { getDocuments, getPage, getSiteChrome } from "@/lib/content/read";
import { pageMetadata } from "@/lib/metadata";

const PATH = "/pricing";

/** page:/pricing (copy); the plans are public.plans, read by getPlans() inside Pricing (tag "plans"). */
async function pricingPage() {
  const page = await getPage(PATH);
  if (!page || page.data.template !== "pricing") notFound();
  return page.data;
}

export async function generateMetadata(): Promise<Metadata> {
  const [page, { settings }] = await Promise.all([pricingPage(), getSiteChrome()]);
  return {
    ...pageMetadata({ title: page.seo.title, description: page.seo.description, path: PATH }, settings),
    ...(page.seo.robots === "noindex" && { robots: { index: false, follow: true } }),
  };
}

export default async function PricingPage() {
  const [page, chrome] = await Promise.all([pricingPage(), getSiteChrome()]);
  // The services quoted per project, by their pages' own service names and descriptions (one batched read).
  const keys = page.otherServices.pages.map((path) => `page:${path}` as const);
  const docs = await getDocuments(keys);
  const otherServices = keys.flatMap((key) => {
    const data = docs[key]?.data;
    return data?.template === "service" ? [{ href: key.slice("page:".length), title: data.service.name, reason: data.seo.description }] : [];
  });

  return (
    <SiteShell>
      <Pricing content={{ page, services: chrome.services.items, otherServices, contactEmail: chrome.settings.contactEmail }} />
      <JsonLdScripts data={[breadcrumbJsonLd([{ name: page.breadcrumb, path: PATH }])]} />
    </SiteShell>
  );
}
