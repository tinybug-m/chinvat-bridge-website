import type { Metadata } from "next";
import { SiteShell } from "@/components/templates/SiteShell";
import { Pricing } from "@/components/organisms/sections/Pricing";

export const metadata: Metadata = {
  title: "SEO & Content Pricing",
  description:
    "Monthly SEO and content retainer plans from Chinvat Bridge: technical SEO, keyword research, link building and ongoing content production.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return (
    <SiteShell>
      <Pricing />
    </SiteShell>
  );
}
