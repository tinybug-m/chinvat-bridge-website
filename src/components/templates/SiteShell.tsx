import type { ReactNode } from "react";
import { Header } from "@/components/organisms/layout/Header";
import { Footer } from "@/components/organisms/layout/Footer";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-gold-500 focus:text-obsidian-950 focus:font-mono focus:text-xs focus:font-semibold focus:uppercase focus:rounded-sm"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="grow">
        {children}
      </main>
      <Footer />
    </>
  );
}
