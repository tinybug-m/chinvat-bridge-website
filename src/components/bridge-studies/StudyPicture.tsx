"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Blueprint } from "./illustrations/Blueprint";
import { Miniature } from "./illustrations/Miniature";
import { Poster } from "./illustrations/Poster";
import { StudyStage, type StudyView } from "./StudyStage";
import { STUDY_BY_ID, type StudyId } from "./studies";

/*
 * Any study in its frame: a WebGL stage (StudyStage) or a flat SVG
 * illustration. The illustrations take `built` eased the way the scenes
 * ease it, with the same one-time build-in from today, so the slider feels
 * the same whichever medium is on show; reduced motion jumps instead.
 */

const ILLUSTRATIONS = { miniature: Miniature, blueprint: Blueprint, poster: Poster } as const;

/** `target` eased over time; starts from 0 the first time, so the drawing builds itself in. */
function useEased(target: number) {
  const [value, setValue] = useState(0);
  const current = useRef(0);
  useEffect(() => {
    const jump = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      current.current += (target - current.current) * (1 - Math.exp((-4.5 * dt) / 1000));
      if (jump || Math.abs(target - current.current) < 0.003) current.current = target;
      setValue(current.current);
      if (current.current !== target) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

interface StudyPictureProps {
  stageId: string;
  study: StudyId;
  view: StudyView;
  built: number;
  onViewChange: (view: StudyView) => void;
  className?: string;
  sizes?: string;
}

export function StudyPicture({ study, built, className, ...stage }: StudyPictureProps) {
  if (STUDY_BY_ID[study].medium === "webgl") return <StudyStage study={study} built={built} className={className} {...stage} />;
  return <Illustration study={study as keyof typeof ILLUSTRATIONS} built={built} className={className} />;
}

function Illustration({ study, built, className }: { study: keyof typeof ILLUSTRATIONS; built: number; className?: string }) {
  const Drawing = ILLUSTRATIONS[study];
  const eased = useEased(built);
  return (
    <div className={cn("relative", className)}>
      <Drawing built={eased} />
    </div>
  );
}

/** The finished state, still, for the overview cards. */
export function StudyThumbnail({ study }: { study: keyof typeof ILLUSTRATIONS }) {
  const Drawing = ILLUSTRATIONS[study];
  return <Drawing built={1} />;
}
