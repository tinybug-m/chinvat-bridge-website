import { getPage, getSiteChrome } from "@/lib/content/read";
import { isChatAvailable } from "@/lib/windy-pop/availability";
import { DuoHome } from "../duo/DuoHome";
import { FormFirst } from "./FormFirst";

/*
 * The homepage's contact section: the form, with Windy Pup one click away. The dog's director wraps
 * this section alone, so the dog appears here and nowhere else on the page.
 */
export async function HomeContact() {
  const [page, chrome] = await Promise.all([getPage("/"), getSiteChrome()]);
  if (!page || page.data.template !== "home") return null;
  const content = page.data.blocks[8];
  return (
    <DuoHome>
      <FormFirst solo chat={isChatAvailable()} heading={content.heading} lede={content.lede} noscriptLead={content.noscriptLead} email={chrome.settings.contactEmail} />
    </DuoHome>
  );
}
