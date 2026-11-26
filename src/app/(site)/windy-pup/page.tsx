import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeSections } from "@/components/home/HomeSections";
import { HomeContact } from "@/components/windy-pop/variants/contact/HomeContact";
import { OpenHero } from "@/components/windy-pop/variants/open/OpenHero";
import { PupHome } from "@/components/windy-pop/variants/open/PupHome";
import { getPage, getSiteChrome } from "@/lib/content/read";
import { isChatAvailable } from "@/lib/windy-pop/availability";

/** The homepage with the Windy Pup hero: reached only by its address, and kept out of search. */
export const metadata: Metadata = { robots: { index: false, follow: false }, alternates: { canonical: "/" } };

export default async function WindyPup() {
  const [page, chrome] = await Promise.all([getPage("/"), getSiteChrome()]);
  const hero = page?.data.template === "home" ? page.data.blocks[0] : null;
  if (hero?.type !== "hero") notFound();
  const { titleLines, lede, primaryCta, secondaryCta } = hero;
  return (
    <PupHome chat={isChatAvailable()}>
      <HomeSections
        hero={<OpenHero content={{ eyebrow: chrome.settings.eyebrow, titleLines, lede, primaryCta, secondaryCta }} />}
        contact={<HomeContact />}
      />
    </PupHome>
  );
}
