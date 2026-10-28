"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Lockup } from "@/components/brand/Lockup";
import { ButtonLink } from "@/components/system/Button";
import { Container } from "@/components/system/Container";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";
import { CONTACT_LINK, LOGIN_LINK, PRICING_LINK, SECTION_LINKS } from "./nav";
import { useActiveSection } from "./useActiveSection";

const SECTION_IDS = SECTION_LINKS.map((link) => link.href.split("#")[1]);

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(SECTION_IDS);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      data-scrolled={scrolled || undefined}
      className="group/header fixed inset-x-0 top-0 z-50 border-b border-transparent transition-[background-color,border-color] duration-300 ease-out-quart data-scrolled:border-line data-scrolled:bg-paper/90 data-scrolled:backdrop-blur-md"
    >
      <Container className="flex h-16 items-center justify-between gap-6 transition-[height] duration-300 ease-out-quart lg:h-18 lg:group-data-scrolled/header:h-15">
        <Lockup className="-my-2 py-2" />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1 xl:gap-2">
            {[...SECTION_LINKS, PRICING_LINK].map((link) => {
              const isActive = active !== null && link.href === `/#${active}`;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    data-active={isActive || undefined}
                    className="group/link relative inline-flex min-h-11 items-center px-3 text-small text-ink-soft transition-colors duration-200 hover:text-ink data-active:text-ink"
                  >
                    {/* Ring node: the mark's joint marks the chapter in view. */}
                    <span
                      aria-hidden="true"
                      className="absolute top-1/2 left-0 size-1.5 -translate-y-1/2 scale-50 rounded-full border border-saffron-600 opacity-0 transition-[opacity,scale] duration-300 ease-out-quart group-data-active/link:scale-100 group-data-active/link:opacity-100"
                    />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={LOGIN_LINK.href}
            className={cn(
              "hidden min-h-11 items-center px-3 text-small text-ink-soft transition-colors duration-200 hover:text-ink lg:inline-flex",
            )}
          >
            {LOGIN_LINK.label}
          </Link>
          <ButtonLink href={CONTACT_LINK.href} className="hidden sm:inline-flex">
            {CONTACT_LINK.label}
          </ButtonLink>
          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}
