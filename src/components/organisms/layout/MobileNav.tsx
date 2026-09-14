"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/atoms/icons";
import { Button } from "@/components/atoms/Button";
import type { NavLink } from "@/data/navigation";

interface MobileNavProps {
  links: NavLink[];
}

export function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <button
        ref={toggleRef}
        aria-controls="mobile-nav"
        aria-expanded={open}
        aria-label="Toggle navigation menu"
        onClick={() => setOpen((value) => !value)}
        className="lg:hidden p-2 text-parchment-200 hover:text-gold-400 rounded focus:outline-none focus:ring-1 focus:ring-gold-500"
        type="button"
      >
        <Icon name={open ? "close" : "menu"} className="text-2xl" />
      </button>
      <div
        id="mobile-nav"
        className={`lg:hidden absolute top-full inset-x-0 border-b border-stone-border bg-obsidian-900/98 px-6 py-6 ${
          open ? "block" : "hidden"
        }`}
      >
        <nav
          aria-label="Mobile navigation"
          className="flex flex-col space-y-4 font-mono text-xs tracking-technical uppercase text-parchment-200"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-2 hover:text-gold-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-stone-border">
            <Button
              href="/#contact"
              icon="arrowForward"
              onClick={() => setOpen(false)}
              className="w-full"
            >
              Start a Conversation
            </Button>
          </div>
        </nav>
      </div>
    </>
  );
}
