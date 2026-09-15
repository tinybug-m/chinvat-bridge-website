import type { Post } from "@/lib/blog";
import * as automateFirst from "./what-should-you-automate-first";
import * as aiSaveTime from "./where-ai-can-save-your-business-time";
import * as websiteNotBringingCustomers from "./why-your-website-isnt-bringing-you-customers";
import * as buildCustomSoftware from "./when-should-a-business-build-custom-software";

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
];
