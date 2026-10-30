"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, type CSSProperties, type MouseEvent, type RefObject } from "react";
import { Lockup } from "@/components/brand/Lockup";
import { ButtonLink } from "@/components/system/Button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { CONTACT_EMAIL } from "@/lib/constants";
import { CONTACT_LINK, LOGIN_LINK, PRICING_LINK, SECTION_LINKS } from "./nav";

interface MobileMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The Menu button, which lives outside the dialog and takes focus back when it closes. */
  triggerRef: RefObject<HTMLButtonElement | null>;
}

/** The sheet itself. Loaded on demand by MobileMenu: Radix Dialog and its scroll lock stay out of the first bundle. */
export default function MobileMenuSheet({ open, onOpenChange, triggerRef }: MobileMenuSheetProps) {
  const pendingTarget = useRef<string | null>(null);
  const pathname = usePathname();

  // On the homepage an in-page link waits for the sheet to close, because the
  // sheet's scroll lock would otherwise swallow the jump.
  function followAnchor(event: MouseEvent<HTMLAnchorElement>, href: string) {
    const [path, id] = href.split("#");
    if (!id || path !== "/" || pathname !== "/") {
      onOpenChange(false);
      return;
    }
    event.preventDefault();
    pendingTarget.current = id;
    onOpenChange(false);
  }

  function onCloseAutoFocus(event: Event) {
    const id = pendingTarget.current;
    pendingTarget.current = null;
    event.preventDefault();
    const target = id ? document.getElementById(id) : null;
    if (!target) {
      // The dialog has no Radix trigger of its own, so focus goes back by hand.
      triggerRef.current?.focus();
      return;
    }
    history.pushState(null, "", `#${id}`);
    target.scrollIntoView({ block: "start" });
    // Keyboard and screen reader users continue from the chapter they chose.
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
          <ul>
            {[...SECTION_LINKS, PRICING_LINK, LOGIN_LINK].map((link, i) => (
              // The rows rise in one after another once the sheet has begun to slide in; --i is the stagger index.
              <li
                key={link.href}
                style={{ "--i": i } as CSSProperties}
                className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:fill-mode-backwards motion-safe:duration-300 motion-safe:ease-out-quart motion-safe:[animation-delay:calc(120ms+var(--i)*60ms)]"
              >
                <SheetClose asChild>
                  <Link
                    href={link.href}
                    onClick={(event) => followAnchor(event, link.href)}
                    className="flex min-h-14 touch-manipulation items-center text-heading font-medium text-ink transition-[color,translate] duration-200 ease-out-quart hover:text-cobalt-700 active:translate-y-px motion-reduce:transition-none"
                  >
                    {link.label}
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
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-small text-ink underline decoration-line-strong underline-offset-4 transition-[text-decoration-color] duration-200 ease-out-quart hover:decoration-ink motion-reduce:transition-none"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
