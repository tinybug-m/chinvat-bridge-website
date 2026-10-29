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
      className="group/header fixed inset-x-0 top-0 z-50 border-b border-transparent transition-[background-color,border-color] duration-300 ease-out-quart data-scrolled:border-line data-scrolled:bg-paper"
    >
      <Container className="flex h-16 items-center justify-between gap-2 transition-[height] duration-300 ease-out-quart lg:h-18 sm:gap-6 lg:group-data-scrolled/header:h-15">
        <Lockup className="min-h-11" />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center xl:gap-1">
            {[...SECTION_LINKS, PRICING_LINK].map((link) => {
              const isActive = active !== null && link.href === `/#${active}`;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    data-active={isActive || undefined}
                    aria-current={isActive ? "location" : undefined}
                    className="inline-flex min-h-11 items-center px-2 text-small text-ink-soft underline decoration-transparent decoration-1 underline-offset-8 transition-colors duration-200 hover:text-ink data-active:text-ink data-active:decoration-ink xl:px-3"
                  >
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
              "hidden min-h-11 items-center px-2 text-small whitespace-nowrap text-ink-soft transition-colors duration-200 hover:text-ink lg:inline-flex xl:px-3",
            )}
          >
            {LOGIN_LINK.label}
          </Link>
          <ButtonLink href={CONTACT_LINK.href} className="hidden whitespace-nowrap sm:inline-flex">
            {CONTACT_LINK.label}
          </ButtonLink>
          {/* Below sm the full label does not fit beside the menu; the conversion path stays one tap away. */}
          <ButtonLink href={CONTACT_LINK.href} className="px-3 min-[360px]:px-4 sm:hidden">
            Contact
          </ButtonLink>
          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}
