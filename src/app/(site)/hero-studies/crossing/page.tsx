import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CrossingHero } from "@/components/home/hero/CrossingHero";
import { StudyHomepage } from "@/components/hero-studies/StudyHomepage";

// Internal hero study: the homepage with an alternative hero. Not linked, noindex.

export const metadata: Metadata = {
  title: "Hero study · Crossing",
  alternates: { canonical: "/hero-studies/crossing" },
  robots: { index: false, follow: false },
};

export default function CrossingStudyPage() {
  // Design review only: served by `next dev`, a 404 in production builds (owner, 21 Nov 2026).
  if (process.env.NODE_ENV === "production") notFound();
  return <StudyHomepage hero={<CrossingHero />} />;
}
