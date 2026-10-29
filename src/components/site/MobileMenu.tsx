"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// The sheet (Radix Dialog, scroll lock, focus scope) is its own chunk. Only the
// button ships in the first bundle; the chunk is warmed up before it is needed.
const loadSheet = () => import("./MobileMenuSheet");
const MobileMenuSheet = dynamic(loadSheet, { ssr: false });

export function MobileMenu() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  // Touch has no hover to warm up on, so below lg the chunk is fetched a little after the page settles.
  useEffect(() => {
    if (!window.matchMedia("(max-width: 63.999rem)").matches) return;
    const handle = window.setTimeout(() => void loadSheet(), 3000);
    return () => window.clearTimeout(handle);
  }, []);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setMounted(true);
          setOpen(true);
        }}
        onPointerEnter={() => void loadSheet()}
        onFocus={() => void loadSheet()}
        className="inline-flex min-h-11 items-center gap-2 px-3 text-small font-medium text-ink lg:hidden"
      >
        <span>Menu</span>
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
          <path d="M2 5.5h12M2 10.5h12" />
        </svg>
      </button>
      {mounted ? <MobileMenuSheet open={open} onOpenChange={setOpen} triggerRef={trigger} /> : null}
    </>
  );
}
