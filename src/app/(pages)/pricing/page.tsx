import type { Metadata } from "next";
import { SiteShell } from "@/components/templates/SiteShell";
import { Pricing } from "@/components/organisms/sections/Pricing";
import { JsonLdScripts, breadcrumbJsonLd } from "@/components/services/structured-data";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "SEO Packages & Pricing",
  description:
    "SEO packages for small businesses with published monthly prices in pounds: technical SEO, keyword research, content and link building. No long-term contract.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <SiteShell>
      <Pricing />
      <JsonLdScripts data={[breadcrumbJsonLd([{ name: "Pricing", path: "/pricing" }])]} />
    </SiteShell>
  );
}
