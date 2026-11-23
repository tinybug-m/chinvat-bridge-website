import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { About } from "@/components/home/about/About";
import { Bridge } from "@/components/home/bridge/Bridge";
import { Capabilities } from "@/components/home/capabilities/Capabilities";
import { Contact } from "@/components/home/contact/Contact";
import { CrossingHero } from "@/components/home/hero/CrossingHero";
import { Insights } from "@/components/home/insights/Insights";
import { Method } from "@/components/home/method/Method";
import { Services } from "@/components/home/services/Services";
import { Work } from "@/components/home/work/Work";
import { SiteShell } from "@/components/site/SiteShell";
import { getPage, getSiteChrome } from "@/lib/content/read";

/*
 * The homepage, from page:/ (a fixed sequence of nine blocks, which the energy wire is routed through)
 * and the shared collections. Diagrams, plates and geometry stay in the components, keyed by the
 * collections' stable keys. `hero` replaces the hero for the dev-only hero studies.
 */
export async function HomeSections({ hero }: { hero?: ReactNode }) {
  const [page, chrome] = await Promise.all([getPage("/"), getSiteChrome()]);
  if (!page || page.data.template !== "home") notFound();
  const [heroBlock, services, work, approach, method, capabilities, about, , contact] = page.data.blocks;

  return (
    <SiteShell>
      {hero ?? <CrossingHero hero={heroBlock} eyebrow={chrome.settings.eyebrow} />}
      <Services heading={services.heading} services={chrome.services.items} />
      <Work content={work} projects={chrome.workProjects.items} />
      <Bridge content={approach} />
      <Method content={method} steps={chrome.processSteps.items} />
      <Capabilities content={capabilities} items={chrome.capabilities.items} />
      <About content={about} />
      {/* The teaser belongs to the insights stream; its block (insights_teaser) is in page:/ for it to adopt. */}
      <Insights />
      <Contact content={contact} email={chrome.settings.contactEmail} />
    </SiteShell>
  );
}
