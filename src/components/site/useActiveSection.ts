"use client";

import { useEffect, useState } from "react";
import { SECTION_ALIASES } from "./nav";

/**
 * Id of the homepage chapter crossing the middle band of the viewport,
 * or null when none is (the hero, the footer, or another page).
 */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join(" ");

  useEffect(() => {
    const watched = [...key.split(" "), ...Object.keys(SECTION_ALIASES)];
    const elements = watched.map((id) => document.getElementById(id)).filter((el) => el !== null);
    if (!elements.length) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // Several chapters can share the band at a boundary; the later one wins.
        const current = elements.findLast((el) => visible.has(el.id))?.id ?? null;
        setActive(current ? (SECTION_ALIASES[current] ?? current) : null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);

  return active;
}
