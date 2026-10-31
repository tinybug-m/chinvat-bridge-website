import type { ReactNode } from "react";
import { SiteShell as NewSiteShell } from "@/components/site/SiteShell";

/**
 * The inner pages' shell: the new site header, footer and skip link. The
 * header is fixed, so the content starts below its height (h-16, lg:h-18);
 * pages add their own top spacing on top of that (PageHeader does).
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <NewSiteShell>
      <div className="pt-16 lg:pt-18">{children}</div>
    </NewSiteShell>
  );
}
