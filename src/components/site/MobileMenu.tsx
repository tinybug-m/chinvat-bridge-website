"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type MouseEvent } from "react";
import { Lockup } from "@/components/brand/Lockup";
import { ButtonLink } from "@/components/system/Button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CONTACT_EMAIL } from "@/lib/constants";
import { CONTACT_LINK, LOGIN_LINK, PRICING_LINK, SECTION_LINKS } from "./nav";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pendingTarget = useRef<string | null>(null);
  const pathname = usePathname();

  // On the homepage an in-page link waits for the sheet to close, because the
  // sheet's scroll lock would otherwise swallow the jump.
  function followAnchor(event: MouseEvent<HTMLAnchorElement>, href: string) {
    const [path, id] = href.split("#");
    if (!id || path !== "/" || pathname !== "/") {
      setOpen(false);
      return;
    }
    event.preventDefault();
    pendingTarget.current = id;
    setOpen(false);
  }

  function onCloseAutoFocus(event: Event) {
    const id = pendingTarget.current;
    pendingTarget.current = null;
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    event.preventDefault();
    history.pushState(null, "", `#${id}`);
    target.scrollIntoView({ block: "start" });
    // Keyboard and screen reader users continue from the chapter they chose.
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex min-h-11 items-center gap-2 px-3 text-small font-medium text-ink lg:hidden">
        <span>Menu</span>
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
          <path d="M2 5.5h12M2 10.5h12" />
        </svg>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto sm:max-w-md"
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <div className="flex h-16 items-center px-gutter">
          <Lockup href={null} />
        </div>
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">Site navigation</SheetDescription>

        <nav aria-label="Mobile" className="px-gutter pt-8">
          <ul className="border-t border-line">
            {[...SECTION_LINKS, PRICING_LINK, LOGIN_LINK].map((link, index) => (
              <li key={link.href} className="border-b border-line">
                <SheetClose asChild>
                  <Link
                    href={link.href}
                    onClick={(event) => followAnchor(event, link.href)}
                    className="flex min-h-16 items-center justify-between gap-4 text-heading font-medium text-ink transition-colors duration-200 hover:text-cobalt-700"
                  >
                    <span>{link.label}</span>
                    <span aria-hidden="true" className="font-label text-label text-ink-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </SheetClose>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto flex flex-col gap-6 px-gutter pt-10 pb-10">
          <SheetClose asChild>
            <ButtonLink
              href={CONTACT_LINK.href}
              size="lg"
              arrow="right"
              className="w-full justify-between"
              onClick={(event) => followAnchor(event, CONTACT_LINK.href)}
            >
              {CONTACT_LINK.label}
            </ButtonLink>
          </SheetClose>
          <div className="flex flex-col gap-1 text-small text-ink-muted">
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
              {CONTACT_EMAIL}
            </a>
            <p className="font-label text-label uppercase">UK Based // Working Globally</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
