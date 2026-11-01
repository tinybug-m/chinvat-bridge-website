import type { Metadata } from "next";
import { PortalHero } from "@/components/hero-studies/PortalHero";
import { StudyHomepage } from "@/components/hero-studies/StudyHomepage";

// Internal hero study: the homepage with an alternative hero. Not linked, noindex.

export const metadata: Metadata = {
  title: "Hero study · Portal",
  alternates: { canonical: "/hero-studies/portal" },
  robots: { index: false, follow: false },
};

export default function PortalStudyPage() {
  return <StudyHomepage hero={<PortalHero />} />;
}
