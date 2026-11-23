"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ShellChrome } from "./nav";
import { SiteShellView } from "./SiteShellView";

/*
 * The shell's content for client-only trees. The root layout provides it, so the error boundary
 * (a Client Component, which cannot fetch) still renders inside the real header and footer.
 */
const ShellChromeContext = createContext<ShellChrome | null>(null);

export function ShellChromeProvider({ chrome, children }: { chrome: ShellChrome; children: ReactNode }) {
  return <ShellChromeContext.Provider value={chrome}>{children}</ShellChromeContext.Provider>;
}

/** templates/SiteShell for Client Components: clears the fixed header like the server version. */
export function ClientSiteShell({ children }: { children: ReactNode }) {
  const chrome = useContext(ShellChromeContext);
  const content = <div className="pt-16 lg:pt-18">{children}</div>;
  // Without content (it failed to load in the root layout) the page still renders, bare.
  return chrome ? <SiteShellView chrome={chrome}>{content}</SiteShellView> : <main id="main-content">{content}</main>;
}
