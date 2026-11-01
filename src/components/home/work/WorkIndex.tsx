"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ArrowIcon } from "@/components/system/ArrowIcon";
import { Screen, loadImage } from "./screen";
import type { Project } from "./projects";

/*
 * The project index. Each row is a label, a large name and one line of
 * context, and the whole row is the link. On a fine pointer, hovering or
 * focusing a name draws a straight hairline from the end of the name to a
 * frame on the right of the row, and the screenshot switches on in that frame
 * cell by cell, starting where the line arrives (see screen.ts). The frame has
 * a fixed place in its row: it never follows the pointer.
 *
 * On touch screens and without JavaScript each row shows its screenshot
 * inline instead (CSS decides, so nothing waits on hydration). Under reduced
 * motion the line appears without drawing and the screenshot fades in.
 */

/** Duration (ms) of a full switch-on; reduced motion uses a short fade. */
const ON_MS = 620;
const FADE_MS = 200;
/** How long the line takes to reach the frame (matches .work-line in work.css). */
const LINE_MS = 260;
/** Gap (px) between the line and the arrow at its start, and the frame at its end. */
const LINE_GAP = 20;

/** The optimised screenshot at 1080px (the frame is at most 880 device px at 2x), not the 2000px original. */
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

    const screens = new Map<string, Screen>();
    const rowFor = (key: string) => list.querySelector<HTMLElement>(`[data-project="${key}"]`);
    const screenFor = (key: string) => {
      let screen = screens.get(key);
      if (!screen) {
        const project = projects.find((p) => p.key === key);
        const canvas = rowFor(key)?.querySelector("canvas");
        if (!project || !canvas) return null;
        screen = new Screen(key, canvas, previewSrc(project.src));
        screens.set(key, screen);
      }
      return screen;
    };

    /**
     * Lines the frame up with the end of the name (centred on the line that holds the arrow) and
     * stretches the line from just past the arrow to the frame's left edge. Layout only, so it reads
     * the same whether or not the row is mid-transition.
     */
    const place = (row: HTMLElement) => {
      const frame = row.querySelector<HTMLElement>("[data-frame]");
      const line = row.querySelector<HTMLElement>("[data-line]");
      const end = row.querySelector<HTMLElement>("[data-tail]");
      if (!frame || !line || !end) return;
      const box = row.getBoundingClientRect();
      const tailBox = end.getBoundingClientRect();
      const y = tailBox.top + tailBox.height / 2 - box.top;
      frame.style.top = `${y - frame.offsetHeight / 2}px`;
      const start = tailBox.right - box.left + LINE_GAP;
      const stop = box.width - frame.offsetWidth - LINE_GAP;
      line.style.top = `${y}px`;
      line.style.left = `${start}px`;
      line.style.width = `${Math.max(0, stop - start)}px`;
    };

    let active: string | null = null;
    let raf = 0;
    let last = 0;

    const tick = (now: number) => {
      const dt = Math.max(0, Math.min(64, now - last));
      last = now;
      const reduced = reducedQuery.matches;
      let moving = false;
      for (const screen of screens.values()) {
        if (screen.step(dt, reduced ? FADE_MS : ON_MS)) moving = true;
        screen.draw(reduced);
      }
      raf = moving ? requestAnimationFrame(tick) : 0;
    };
    const run = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const show = (key: string | null) => {
      if (key === active) return;
      for (const screen of screens.values()) if (screen.key !== key) screen.leave();
      active = key;
      const row = key ? rowFor(key) : null;
      if (key && row) {
        place(row);
        screenFor(key)?.enter(reducedQuery.matches ? 0 : LINE_MS);
      }
      for (const item of list.children) (item as HTMLElement).toggleAttribute("data-current", item === row);
      run();
    };

    const rowKey = (target: EventTarget | null) =>
      target instanceof Element ? (target.closest<HTMLElement>("[data-project]")?.dataset.project ?? null) : null;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !fine.matches) return;
      show(rowKey(event.target));
    };
    const onLeave = () => show(null);
    const onFocus = (event: FocusEvent) => {
      const link = event.target;
      if (!fine.matches || !(link instanceof HTMLAnchorElement) || !link.matches(":focus-visible")) return;
      show(rowKey(link));
    };
    const onBlur = (event: FocusEvent) => {
      if (!list.contains(event.relatedTarget as Node | null)) show(null);
    };
    const onResize = () => {
      const row = active ? rowFor(active) : null;
      if (row) place(row);
    };
    // Fetch and decode the screenshots the first time the pointer comes near, so the first hover is ready.
    const warm = () => projects.forEach((project) => void loadImage(previewSrc(project.src)).catch(() => {}));

    list.addEventListener("pointerenter", warm, { once: true });
    list.addEventListener("pointermove", onMove);
    list.addEventListener("pointerleave", onLeave);
    list.addEventListener("focusin", onFocus);
    list.addEventListener("focusout", onBlur);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      list.removeEventListener("pointerenter", warm);
      list.removeEventListener("pointermove", onMove);
      list.removeEventListener("pointerleave", onLeave);
      list.removeEventListener("focusin", onFocus);
      list.removeEventListener("focusout", onBlur);
      window.removeEventListener("resize", onResize);
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
                  <span data-tail className="whitespace-nowrap">
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
          {/* The hover preview: a line from the name to a fixed frame on the right (fine pointers only). */}
          <span data-line aria-hidden="true" className="work-line" />
          <div data-frame aria-hidden="true" className="work-frame">
            <canvas />
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
