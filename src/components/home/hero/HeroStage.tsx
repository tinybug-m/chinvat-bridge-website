"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import { ThreeStage } from "@/components/three/core/ThreeStage";
import type { StageHandle } from "@/components/three/core/types";

/*
 * Client island for the hero object. It feeds the seam scene two inputs:
 * scroll progress through the hero and pointer tilt (fine pointers only).
 * Everything visible before WebGL arrives is server-rendered and passed in
 * as children.
 */

const loadSeamScene = () => import("@/components/three/scenes/seam");

interface HeroStageProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function HeroStage({ className, style, children }: HeroStageProps) {
  const handle = useRef<StageHandle>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Scroll: 0 at the top of the page, 1 once the stage's centre reaches the top
  // of the viewport. Read only while the stage is on screen, plus once on the
  // way in and out, so a fast scroll past still lands on 1.
  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    let frame = 0;
    let onScreen = false;
    const measure = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const anchor = rect.top + window.scrollY + rect.height / 2;
      handle.current?.set("progress", Math.min(1, Math.max(0, window.scrollY / Math.max(1, anchor))));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const onScroll = () => {
      if (onScreen) schedule();
    };
    const visibility = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting;
      schedule();
    });
    measure();
    visibility.observe(element);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Pointer tilt: fine pointers only, never under reduced motion; follows
  // both queries as they change (a tablet docks a mouse, a setting flips).
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let listening = false;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      handle.current?.set("tiltX", (event.clientX / window.innerWidth) * 2 - 1);
      handle.current?.set("tiltY", (event.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      handle.current?.set("tiltX", 0);
      handle.current?.set("tiltY", 0);
    };
    const start = () => {
      if (listening) return;
      listening = true;
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      window.addEventListener("blur", onLeave);
    };
    const stop = () => {
      if (!listening) return;
      listening = false;
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      onLeave();
    };
    const sync = () => (fine.matches && !reduce.matches ? start() : stop());
    sync();
    fine.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return (
    <div ref={rootRef} className={className} style={style}>
      <ThreeStage
        id="seam"
        load={loadSeamScene}
        handleRef={handle}
        className="size-full"
        mountMargin="25% 0px"
        releaseMargin="200% 0px"
      >
        {children}
      </ThreeStage>
    </div>
  );
}
