import type { Metadata } from "next";
import { SiteShell } from "@/components/templates/SiteShell";
import { Pricing } from "@/components/organisms/sections/Pricing";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "SEO & Content Pricing",
  description:
    "Monthly SEO and content retainer plans from Chinvat Bridge: technical SEO, keyword research, link building and ongoing content production.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <SiteShell>
      <Pricing />
    </SiteShell>
  );
}
