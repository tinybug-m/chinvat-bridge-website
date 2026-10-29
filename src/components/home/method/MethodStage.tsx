"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { ThreeStage } from "@/components/three/core/ThreeStage";
import type { StageHandle } from "@/components/three/core/types";

/*
 * Client island for the Method stage. On the sticky layout (lg, motion
 * allowed) it reads where the four step blocks sit in the viewport and turns
 * that into one continuous value, 0..3, for the scene; it also writes the
 * nearest step to data-active on the section root, which method.css uses for
 * the poster, the caption and the step emphasis. Scrolling up runs
 * the same mapping backwards. Nothing is pinned: the stage is CSS sticky.
 * Scroll is only read while the section is on screen.
 */

const loadMethodScene = () => import("@/components/three/scenes/method");

const STICKY_LAYOUT = "(min-width: 64rem) and (prefers-reduced-motion: no-preference)";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (t: number) => t * t * (3 - 2 * t);

interface MethodStageProps {
  className?: string;
  children: ReactNode;
}

export function MethodStage({ className, children }: MethodStageProps) {
  const handle = useRef<StageHandle>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current?.closest<HTMLElement>("[data-method-root]");
    if (!root) return;
    const steps = Array.from(root.querySelectorAll<HTMLElement>("[data-method-step]"));
    const layout = window.matchMedia(STICKY_LAYOUT);
    let frame = 0;
    let active = -1;
    let onScreen = false;

    const measure = () => {
      frame = 0;
      const height = window.innerHeight;
      // A step takes over as its top crosses a line just below the middle of
      // the viewport; the change is spread over a band so the node morphs.
      const anchor = height * 0.55;
      const band = height * 0.3;
      let value = 0;
      for (let i = 1; i < steps.length; i++) {
        const top = steps[i].getBoundingClientRect().top;
        value += smooth(clamp((anchor - top) / band + 0.5));
      }
      handle.current?.set("step", value);
      const next = Math.round(value);
      if (next !== active) {
        active = next;
        root.dataset.active = String(next);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const onScroll = () => {
      if (onScreen) schedule();
    };
    // One last reading on the way in and out, so a fast scroll past still
    // leaves the stage on the first or last step.
    const visibility = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting;
      schedule();
    });
    const start = () => {
      measure();
      visibility.observe(root);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      visibility.disconnect();
      onScreen = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      active = -1;
      delete root.dataset.active;
    };
    const onLayout = () => (layout.matches ? start() : stop());

    if (layout.matches) start();
    layout.addEventListener("change", onLayout);
    return () => {
      layout.removeEventListener("change", onLayout);
      stop();
    };
  }, []);

  return (
    <div ref={rootRef} className={className}>
      <ThreeStage
        id="method"
        load={loadMethodScene}
        handleRef={handle}
        className="size-full"
        mountMargin="25% 0px"
        releaseMargin="150% 0px"
      >
        {children}
      </ThreeStage>
    </div>
  );
}
