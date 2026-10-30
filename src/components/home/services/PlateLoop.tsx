"use client";

import { useCallback } from "react";

/**
 * Renders a hidden marker and sets data-loop="on" | "off" on its .svc-fig
 * figure. "on" only while the figure is revealed (data-revealed, set by the
 * reveal runtime), intersecting the viewport, and the tab is visible; never
 * under prefers-reduced-motion: reduce. loop.css reads the attribute. No
 * per-frame work: one IntersectionObserver, one MutationObserver on the
 * figure's own attributes, and two cheap listeners, all removed on unmount.
 */
export function PlateLoop() {
  const ref = useCallback((marker: HTMLSpanElement | null) => {
    const fig = marker?.parentElement;
    if (!marker || !fig) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;

    const sync = () => {
      const on =
        !reduce.matches &&
        inView &&
        document.visibilityState === "visible" &&
        fig.hasAttribute("data-revealed");
      const next = on ? "on" : "off";
      if (fig.getAttribute("data-loop") !== next) fig.setAttribute("data-loop", next);
    };

    const io = new IntersectionObserver((entries) => {
      inView = entries[entries.length - 1].isIntersecting;
      sync();
    });
    const mo = new MutationObserver(sync);
    io.observe(fig);
    mo.observe(fig, { attributes: true, attributeFilter: ["data-revealed"] });
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", sync);
    sync();

    // React 19 runs the returned function when the ref detaches.
    return () => {
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", sync);
      fig.removeAttribute("data-loop");
    };
  }, []);

  return <span ref={ref} hidden aria-hidden="true" />;
}
