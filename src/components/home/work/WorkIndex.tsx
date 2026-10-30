"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ArrowIcon } from "@/components/system/ArrowIcon";
import { Powder, loadImage } from "./powder";
import type { Project } from "./projects";

/*
 * The project index. Each row is a label, a large name and one line of
 * context, and the whole row is the link. On a fine pointer the screenshot
 * is a preview that only exists while a name is hovered or focused: it
 * settles out of drifting powder beside the pointer, sharpens, trails it a
 * little, and blows away when the pointer leaves. Keyboard focus places it
 * beside the focused name.
 *
 * On touch screens and without JavaScript each row shows its screenshot
 * inline instead (CSS decides, so nothing waits on hydration). Under reduced
 * motion the preview fades in place: no powder, no trailing, no lean.
 */

/** Preview size in CSS px (the screenshots are 16:10), and its gap from the pointer. */
const PREVIEW_W = 440;
const PREVIEW_H = PREVIEW_W * (10 / 16);
const OFFSET = 32;
/** Time constant (ms) of the trail behind the pointer. */
const FOLLOW_MS = 95;
/** Duration (ms) of a full assemble from powder; reduced motion uses a short fade. */
const ASSEMBLE_MS = 1150;
const FADE_MS = 200;
/** The fixed header's height plus a gap; the preview never tucks under it. */
const HEADER_CLEAR = 88;

/** The optimised screenshot at 1080px (the preview is 880 device px at 2x), not the 2000px original. */
const previewSrc = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=1080&q=75`;

/** A name split before its last word, so the arrow can be kept with that word. */
const head = (name: string) => name.slice(0, name.lastIndexOf(" ") + 1);
const tail = (name: string) => name.slice(name.lastIndexOf(" ") + 1);

export function WorkIndex({ projects }: { projects: Project[] }) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // The preview lives on <body>: a fixed element inside a transformed ancestor (a Reveal mid-rise)
    // would be positioned against that ancestor instead of the viewport.
    const frame = document.createElement("div");
    frame.className = "work-preview";
    frame.setAttribute("aria-hidden", "true");
    frame.dataset.state = "off";
    const canvas = document.createElement("canvas");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(PREVIEW_W * dpr);
    canvas.height = Math.round(PREVIEW_H * dpr);
    frame.style.width = `${PREVIEW_W}px`;
    frame.style.height = `${PREVIEW_H}px`;
    frame.append(canvas);
    document.body.append(frame);
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => frame.remove();

    const powders = new Map<string, Powder>();
    const powderFor = (key: string) => {
      let powder = powders.get(key);
      if (!powder) {
        const project = projects.find((p) => p.key === key);
        if (!project) return null;
        powder = new Powder(project.key, previewSrc(project.src), PREVIEW_W, PREVIEW_H);
        powders.set(key, powder);
      }
      return powder;
    };

    let active: string | null = null;
    const pointer = { x: 0, y: 0 };
    const pos = { x: 0, y: 0, lean: 0 };
    let placed = false;
    let raf = 0;
    let last = 0;

    /** Right edge of the current name: the preview starts past it, so it never sits on the name. */
    let nameRight = 0;
    const measureName = (key: string | null) => {
      const name = key ? list.querySelector(`[data-project="${key}"] [data-name]`) : null;
      nameRight = name ? name.getBoundingClientRect().right : 0;
    };

    /**
     * Top-left of the frame for a pointer at (x, y): right of the pointer and of the name, held
     * inside the viewport, and below the fixed header.
     */
    const anchor = (x: number, y: number) => {
      if (focusRow) {
        const below = focusRow.bottom + 12;
        return {
          x: Math.min(window.innerWidth - PREVIEW_W - 16, x),
          y: below + PREVIEW_H < window.innerHeight - 16 ? below : Math.max(HEADER_CLEAR, focusRow.top - 12 - PREVIEW_H),
        };
      }
      return {
        x: Math.min(window.innerWidth - PREVIEW_W - 16, Math.max(x, nameRight) + OFFSET),
        y: Math.min(window.innerHeight - PREVIEW_H - 16, Math.max(HEADER_CLEAR, y - PREVIEW_H / 2)),
      };
    };

    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const reduced = reducedQuery.matches;

      const goal = anchor(pointer.x, pointer.y);
      if (!placed || reduced) {
        pos.x = goal.x;
        pos.y = goal.y;
        pos.lean = 0;
        placed = true;
      } else {
        const k = 1 - Math.exp(-dt / FOLLOW_MS);
        const dx = (goal.x - pos.x) * k;
        pos.x += dx;
        pos.y += (goal.y - pos.y) * k;
        // A slight lean into the direction of travel, settling when the pointer stops.
        pos.lean += (Math.max(-3, Math.min(3, dx * 0.3)) - pos.lean) * k;
      }
      frame.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0) rotate(${pos.lean.toFixed(2)}deg)`;

      let moving = false;
      let visible = false;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, PREVIEW_W, PREVIEW_H);
      for (const powder of powders.values()) {
        if (powder.step(dt, reduced ? FADE_MS : ASSEMBLE_MS)) moving = true;
        if (powder.draw(ctx, reduced)) visible = true;
      }
      frame.dataset.state = visible ? "on" : "off";

      const settled = Math.abs(goal.x - pos.x) < 0.5 && Math.abs(goal.y - pos.y) < 0.5 && Math.abs(pos.lean) < 0.02;
      if (moving || (active && !settled)) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
        if (!active) placed = false;
      }
    };
    const run = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const show = (key: string | null) => {
      if (key === active) return;
      for (const powder of powders.values()) if (powder.key !== key) powder.leave();
      active = key;
      if (key) powderFor(key)?.enter();
      for (const row of list.children) (row as HTMLElement).toggleAttribute("data-current", row.getAttribute("data-project") === key);
      run();
    };

    const rowKey = (target: EventTarget | null) =>
      target instanceof Element ? (target.closest<HTMLElement>("[data-project]")?.dataset.project ?? null) : null;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !fine.matches) return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      focusRow = null;
      const key = rowKey(event.target);
      show(key);
      measureName(key);
      run();
    };
    const onLeave = () => show(null);
    /** Puts the pointer stand-in at the focused name, so the preview sits beside it. */
    // Keyboard: the preview goes below the focused row (above it near the bottom of the screen),
    // lined up with the name, so it never covers the row or its focus ring.
    let focusRow: DOMRect | null = null;
    const aimAtFocus = (link: Element) => {
      const row = link.closest("[data-project]");
      const name = link.querySelector("[data-name]") ?? link;
      if (!row) return;
      focusRow = row.getBoundingClientRect();
      pointer.x = name.getBoundingClientRect().left;
      nameRight = 0;
    };
    const onFocus = (event: FocusEvent) => {
      const link = event.target;
      if (!fine.matches || !(link instanceof HTMLAnchorElement) || !link.matches(":focus-visible")) return;
      placed = false;
      show(rowKey(link));
      // Measure after the browser has scrolled the focused row into view.
      requestAnimationFrame(() => {
        aimAtFocus(link);
        run();
      });
    };
    const onBlur = (event: FocusEvent) => {
      if (!list.contains(event.relatedTarget as Node | null)) {
        focusRow = null;
        show(null);
      }
    };
    // The page scrolling under a still pointer moves the rows, not the pointer: re-read the row under it.
    const onScroll = () => {
      if (!active) return;
      const focused = document.activeElement;
      if (focused && list.contains(focused) && focused.matches(":focus-visible")) {
        aimAtFocus(focused);
        run();
        return;
      }
      measureName(active);
      const under = document.elementFromPoint(pointer.x, pointer.y);
      show(under && list.contains(under) ? rowKey(under) : null);
    };
    // Fetch and decode the screenshots the first time the pointer comes near, so the first hover is ready.
    const warm = () => projects.forEach((project) => void loadImage(previewSrc(project.src)).catch(() => {}));

    list.addEventListener("pointerenter", warm, { once: true });
    list.addEventListener("pointermove", onMove);
    list.addEventListener("pointerleave", onLeave);
    list.addEventListener("focusin", onFocus);
    list.addEventListener("focusout", onBlur);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      frame.remove();
      list.removeEventListener("pointerenter", warm);
      list.removeEventListener("pointermove", onMove);
      list.removeEventListener("pointerleave", onLeave);
      list.removeEventListener("focusin", onFocus);
      list.removeEventListener("focusout", onBlur);
      window.removeEventListener("scroll", onScroll);
    };
  }, [projects]);

  return (
    <ol ref={listRef} className="work-index border-b border-line">
      {projects.map((project) => (
        <li key={project.key} data-project={project.key} className="work-row relative border-t border-line">
          <div className="grid grid-cols-1 gap-y-2 py-6 md:grid-cols-12 md:items-start md:gap-x-6 md:py-8 lg:py-10">
            <p data-label className="text-small font-medium text-ink-muted md:col-span-12 lg:col-span-2 lg:pt-[0.7em]">
              {project.label}
            </p>
            <h3 id={`work-${project.key}`} className="md:col-span-8 lg:col-span-6 lg:col-start-3">
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="work-link outline-none after:absolute after:inset-0 after:content-['']"
              >
                {/* The arrow is glued to the last word, so a wrapped name never leaves it on a line of its own. */}
                <span
                  data-name
                  className="work-name inline-block text-balance font-display text-[length:clamp(2rem,1.2rem+3.4vw,4.25rem)] leading-[1.02] font-medium tracking-[-0.02em] [font-stretch:100%] lg:[font-stretch:112%]"
                >
                  {head(project.name)}
                  <span className="whitespace-nowrap">
                    {tail(project.name)}
                    <ArrowIcon direction="up-right" className="work-arrow ml-[0.25em] inline-block size-[0.4em] align-[0.1em]" />
                  </span>
                </span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </h3>
            <p className="work-context max-w-[30ch] text-balance text-body text-ink-soft md:col-span-4 md:col-start-9 md:pt-3">
              {project.context}
            </p>
          </div>
          <div className="work-inline pb-8 md:grid md:grid-cols-12 md:gap-x-6">
            <Image
              src={project.src}
              alt={project.alt}
              width={2000}
              height={1250}
              sizes="(min-width: 768px) 80vw, 100vw"
              className="block h-auto w-full border border-line md:col-span-10 md:col-start-3"
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
