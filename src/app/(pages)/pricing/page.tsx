import type { Metadata } from "next";
import { SiteShell } from "@/components/templates/SiteShell";
import { Pricing } from "@/components/organisms/sections/Pricing";
import { SHARED_OPEN_GRAPH } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "SEO & Content Pricing",
  description:
    "Monthly SEO and content retainer plans from Chinvat Bridge: technical SEO, keyword research, link building and ongoing content production.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    ...SHARED_OPEN_GRAPH,
    url: "/pricing",
    title: "SEO & Content Pricing — Chinvat Bridge",
    description:
      "Monthly SEO and content retainer plans from Chinvat Bridge: technical SEO, keyword research, link building and ongoing content production.",
  },
};

export default function PricingPage() {
  return (
    <SiteShell>
      <Pricing />
    </SiteShell>
  );
}
