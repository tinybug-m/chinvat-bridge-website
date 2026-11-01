import type { Metadata } from "next";
import { CrossingHero } from "@/components/home/hero/CrossingHero";
import { StudyHomepage } from "@/components/hero-studies/StudyHomepage";

// Internal hero study: the homepage with an alternative hero. Not linked, noindex.

export const metadata: Metadata = {
  title: "Hero study · Crossing",
  alternates: { canonical: "/hero-studies/crossing" },
  robots: { index: false, follow: false },
};

export default function CrossingStudyPage() {
  return <StudyHomepage hero={<CrossingHero />} />;
}
