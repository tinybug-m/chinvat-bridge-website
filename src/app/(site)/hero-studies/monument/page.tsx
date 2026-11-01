import type { Metadata } from "next";
import { MonumentHero } from "@/components/hero-studies/MonumentHero";
import { StudyHomepage } from "@/components/hero-studies/StudyHomepage";

// Internal hero study: the homepage with an alternative hero. Not linked, noindex.

export const metadata: Metadata = {
  title: "Hero study · Monument",
  alternates: { canonical: "/hero-studies/monument" },
  robots: { index: false, follow: false },
};

export default function MonumentStudyPage() {
  return <StudyHomepage hero={<MonumentHero />} />;
}
