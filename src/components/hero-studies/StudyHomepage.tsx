import type { ReactNode } from "react";
import { HomeSections } from "@/components/home/HomeSections";

/** The homepage as shipped, with the hero swapped for a study (or the shipped hero), so it is judged in context. */
export function StudyHomepage({ hero }: { hero?: ReactNode }) {
  return <HomeSections hero={hero} />;
}
