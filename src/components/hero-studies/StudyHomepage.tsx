import type { ReactNode } from "react";
import { About } from "@/components/home/about/About";
import { Bridge } from "@/components/home/bridge/Bridge";
import { Capabilities } from "@/components/home/capabilities/Capabilities";
import { Contact } from "@/components/home/contact/Contact";
import { Insights } from "@/components/home/insights/Insights";
import { Method } from "@/components/home/method/Method";
import { Services } from "@/components/home/services/Services";
import { Work } from "@/components/home/work/Work";
import { SiteShell } from "@/components/site/SiteShell";

/** The homepage as shipped, with the hero swapped for a study, so it is judged in context. */
export function StudyHomepage({ hero }: { hero: ReactNode }) {
  return (
    <SiteShell>
      {hero}
      <Services />
      <Work />
      <Bridge />
      <Method />
      <Capabilities />
      <About />
      <Insights />
      <Contact />
    </SiteShell>
  );
}
