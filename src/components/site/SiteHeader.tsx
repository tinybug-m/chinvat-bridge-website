"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Lockup } from "@/components/brand/Lockup";
import { ButtonLink } from "@/components/system/Button";
import { Container } from "@/components/system/Container";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";
import { CONTACT_LINK, LOGIN_LINK, PRICING_LINK, SECTION_LINKS } from "./nav";
import { useActiveSection } from "./useActiveSection";

const SECTION_IDS = SECTION_LINKS.map((link) => link.href.split("#")[1]);
const NAV_LINKS = [...SECTION_LINKS, PRICING_LINK];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(SECTION_IDS);
  const pathname = usePathname();

  // The lit link: the homepage chapter under the viewport midline, or Pricing while on /pricing.
  const onPricing = pathname === PRICING_LINK.href;
  const current = active !== null ? `/#${active}` : onPricing ? PRICING_LINK.href : null;

  const list = useRef<HTMLElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const links = useRef(new Map<string, HTMLAnchorElement>());
  const placed = useRef(false);

  // One underline slides between links. It is measured, not scrolled: a few
  // style writes per chapter change (--nav-x, --nav-w), never per frame.
  useLayoutEffect(() => {
    const ul = list.current;
    const bar = indicator.current;
    if (!ul || !bar) return;

    const place = () => {
      const link = current ? links.current.get(current) : undefined;
      if (!link) return;
      const box = link.getBoundingClientRect();
      if (!box.width) return; // the nav is hidden below lg
      // The bar spans the label, not the link's padding, as the underline did.
      const style = getComputedStyle(link);
      const left = parseFloat(style.paddingLeft);
      const width = box.width - left - parseFloat(style.paddingRight);
      // The first placement has nothing to travel from, so it appears in place.
      if (!placed.current) bar.style.transition = "none";
      ul.style.setProperty("--nav-x", `${box.left - ul.getBoundingClientRect().left + left}px`);
      ul.style.setProperty("--nav-w", String(width));
      if (!placed.current) {
        void bar.offsetWidth;
        bar.style.transition = "";
        placed.current = true;
      }
    };

    place();
    // Link boxes change width at xl and when the font loads.
    const observer = new ResizeObserver(place);
    observer.observe(ul);
    return () => observer.disconnect();
  }, [current]);

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

        <nav ref={list} aria-label="Main" className="relative hidden lg:block">
          <ul className="flex items-center xl:gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === current;
              return (
                <li key={link.href}>
                  <Link
                    ref={(el) => {
                      if (el) links.current.set(link.href, el);
                      else links.current.delete(link.href);
                    }}
                    href={link.href}
                    data-active={isActive || undefined}
                    aria-current={isActive ? (link.href === PRICING_LINK.href ? "page" : "location") : undefined}
                    className="relative inline-flex min-h-11 items-center px-2 text-small text-ink-soft transition-colors duration-200 ease-out-quart after:absolute after:inset-x-2 after:bottom-[7px] after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-150 after:ease-out-quart hover:text-ink hover:after:scale-x-100 data-active:text-ink data-active:after:hidden motion-reduce:transition-none motion-reduce:after:transition-none xl:px-3 xl:after:inset-x-3"
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          {/* Decorative; the link's own aria-current carries the state. */}
          <span
            ref={indicator}
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute bottom-[7px] left-0 h-px w-px origin-left bg-ink transition-[translate,scale,opacity] duration-350 ease-out-expo [scale:var(--nav-w,1)_1] [translate:var(--nav-x,0px)_0] motion-reduce:transition-none",
              current ? "opacity-100" : "opacity-0",
            )}
          />
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
