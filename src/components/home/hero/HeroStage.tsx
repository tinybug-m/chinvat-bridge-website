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

  // Scroll: 0 at the top of the page, 1 once the stage's centre reaches the top of the viewport.
  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const anchor = rect.top + window.scrollY + rect.height / 2;
      handle.current?.set("progress", Math.min(1, Math.max(0, window.scrollY / Math.max(1, anchor))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Pointer tilt: fine pointers only, never under reduced motion.
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      handle.current?.set("tiltX", (event.clientX / window.innerWidth) * 2 - 1);
      handle.current?.set("tiltY", (event.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      handle.current?.set("tiltX", 0);
      handle.current?.set("tiltY", 0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
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
