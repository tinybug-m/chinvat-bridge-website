import type { ReactNode } from "react";
import type { ShellChrome } from "./nav";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** The skip link, header, main and footer, from content passed in (server and client trees alike). */
export function SiteShellView({ chrome, children }: { chrome: ShellChrome; children: ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:inline-flex focus:min-h-11 focus:items-center focus:bg-ink focus:px-5 focus:text-paper"
      >
        Skip to content
      </a>
      <SiteHeader chrome={chrome} />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <SiteFooter chrome={chrome} />
    </>
  );
}
