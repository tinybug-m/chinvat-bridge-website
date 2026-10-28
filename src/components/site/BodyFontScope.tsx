"use client";

import { useEffect } from "react";

/**
 * Mirrors the site font variables onto <body> once mounted, so portalled UI
 * (the menu sheet, tooltips) renders outside the page wrapper in the brand
 * faces too. Removed again when navigating to a page in the old design.
 */
export function BodyFontScope({ className }: { className: string }) {
  useEffect(() => {
    const classes = className.split(" ");
    document.body.classList.add(...classes);
    return () => document.body.classList.remove(...classes);
  }, [className]);

  return null;
}
