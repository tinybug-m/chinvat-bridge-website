import type { ReactNode } from "react";
import { getSiteChrome } from "@/lib/content/read";
import { shellChrome } from "./nav";
import { SiteShellView } from "./SiteShellView";

/** The site shell with its navigation and footer copy from the published content (cached, shared). */
export async function SiteShell({ children }: { children: ReactNode }) {
  const { navigation, settings } = await getSiteChrome();
  return <SiteShellView chrome={shellChrome(navigation, settings)}>{children}</SiteShellView>;
}
