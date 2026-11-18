import type { Post } from "@/lib/blog";
import * as automateFirst from "./what-should-you-automate-first";
import * as aiSaveTime from "./where-ai-can-save-your-business-time";
import * as websiteNotBringingCustomers from "./why-your-website-isnt-bringing-you-customers";
import * as buildCustomSoftware from "./when-should-a-business-build-custom-software";
import * as whereTheNameComesFrom from "./where-the-name-chinvat-bridge-comes-from";
// Drafts (meta.draft: true): hidden in production, visible under `next dev` for review.
import * as replaceSpreadsheets from "./replace-spreadsheets-with-custom-software";
import * as seoCost from "./how-much-does-seo-cost-uk";
import * as connectSystems from "./how-to-connect-business-systems";
import * as chooseAiConsultant from "./how-to-choose-an-ai-consultant";
import * as seoAudit from "./what-a-technical-seo-audit-should-include";
import * as aiSubscriptions from "./ai-subscriptions-vs-ai-integration";
import * as howWeBuilt from "./how-we-built-this-site";
import * as clientPortal from "./does-your-business-need-a-client-portal";
import * as techPartner from "./how-to-choose-a-technology-partner";
import * as aiAdoptionFigures from "./uk-small-business-ai-adoption-2026";

/**
 * Explicit registry rather than a filesystem scan: this keeps article discovery a plain,
 * statically-analyzable import list, so Next.js's bundler always includes exactly the posts
 * that exist — no risk of a build-time-only directory read behaving differently once deployed.
 * Adding a new article means creating its file next to these and adding one import + one
 * array entry here.
 */
export const ALL_POSTS: Post[] = [
  { meta: aiSaveTime.meta, Content: aiSaveTime.Content },
  { meta: automateFirst.meta, Content: automateFirst.Content },
  { meta: websiteNotBringingCustomers.meta, Content: websiteNotBringingCustomers.Content },
  { meta: buildCustomSoftware.meta, Content: buildCustomSoftware.Content },
  { meta: whereTheNameComesFrom.meta, Content: whereTheNameComesFrom.Content },
  { meta: replaceSpreadsheets.meta, Content: replaceSpreadsheets.Content },
  { meta: seoCost.meta, Content: seoCost.Content },
  { meta: connectSystems.meta, Content: connectSystems.Content },
  { meta: chooseAiConsultant.meta, Content: chooseAiConsultant.Content },
  { meta: seoAudit.meta, Content: seoAudit.Content },
  { meta: aiSubscriptions.meta, Content: aiSubscriptions.Content },
  { meta: howWeBuilt.meta, Content: howWeBuilt.Content },
  { meta: clientPortal.meta, Content: clientPortal.Content },
  { meta: techPartner.meta, Content: techPartner.Content },
  { meta: aiAdoptionFigures.meta, Content: aiAdoptionFigures.Content },
];
