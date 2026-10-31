"use client";

import { useRef, useState } from "react";
import { StudyPicture } from "./StudyPicture";
import { REST_VIEW, type StudyView, clampView } from "./StudyStage";
import { STUDY_BY_ID, type StudyId } from "./studies";
import { ViewControls } from "./ViewControls";

/*
 * A single study at full width: its stage, the today-to-future slider and
 * the view buttons. Full screen takes the stage and its controls together,
 * so the slider still works there.
 */
export function StudyViewer({ study }: { study: StudyId }) {
  const { name, states, medium } = STUDY_BY_ID[study];
  const turns = medium === "webgl";
  const [view, setView] = useState<StudyView>(REST_VIEW);
  const [built, setBuilt] = useState(1);
  const frame = useRef<HTMLDivElement>(null);

  function fullscreen() {
    const element = frame.current;
    if (!element) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void element.requestFullscreen?.();
  }

  return (
    <div
      ref={frame}
      className="group/viewer flex flex-col bg-paper-raised [&:fullscreen]:h-full [&:fullscreen]:p-4 sm:[&:fullscreen]:p-6"
    >
      <StudyPicture
        stageId={`study-${study}`}
        study={study}
        view={view}
        built={built}
        onViewChange={setView}
        className="aspect-[4/3] w-full sm:aspect-[16/9] xl:aspect-[2/1] group-[&:fullscreen]/viewer:aspect-auto group-[&:fullscreen]/viewer:flex-1"
        sizes="(min-width: 1440px) 1280px, 100vw"
      />
      <ViewControls
        className="mt-3"
        states={states}
        built={built}
        onBuiltChange={setBuilt}
        onReset={turns ? () => setView(REST_VIEW) : undefined}
        onZoom={turns ? (factor) => setView((current) => clampView({ ...current, zoom: current.zoom * factor })) : undefined}
        onFullscreen={fullscreen}
        label={`${name}: today to future`}
      />
    </div>
  );
}
