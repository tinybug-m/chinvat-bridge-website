"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { StudyPicture } from "./StudyPicture";
import { REST_VIEW, type StudyView, clampView } from "./StudyStage";
import { STUDIES, STUDY_BY_ID, type StudyId } from "./studies";
import { ViewControls } from "./ViewControls";

/*
 * Any two studies next to each other, built together (and turned together
 * where both are 3D): one view and one slider drive both. Two stages is the page's whole WebGL
 * budget (core/budget.ts), so the single-study stages above and below are
 * suspended while this is on screen. Changing a side remounts its stage (a
 * stage keeps its scene for life).
 */
export function CompareStudio() {
  const [sides, setSides] = useState<[StudyId, StudyId]>(["original", "miniature"]);
  const [view, setView] = useState<StudyView>(REST_VIEW);
  const [built, setBuilt] = useState(1);

  const pick = (side: 0 | 1) => (next: string) => {
    if (!next) return;
    setSides((current) => (side === 0 ? [next as StudyId, current[1]] : [current[0], next as StudyId]));
  };

  return (
    <div>
      <div className="grid gap-x-6 gap-y-10 lg:grid-cols-2">
        {([0, 1] as const).map((side) => {
          const study = STUDY_BY_ID[sides[side]];
          return (
            <figure key={side} className="m-0 min-w-0">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-small text-ink-muted" id={`compare-${side}-label`}>
                  {side === 0 ? "Left" : "Right"}
                </p>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  size="sm"
                  value={sides[side]}
                  onValueChange={pick(side)}
                  aria-labelledby={`compare-${side}-label`}
                >
                  {STUDIES.map((option) => (
                    <ToggleGroupItem
                      key={option.id}
                      value={option.id}
                      aria-label={`${option.number} ${option.name}`}
                      className="font-label text-label tabular-nums"
                    >
                      {option.number}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
              <StudyPicture
                key={study.id}
                stageId={`compare-${side}`}
                study={study.id}
                view={view}
                built={built}
                onViewChange={setView}
                className="aspect-[4/3] w-full"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <figcaption className="mt-4 flex items-baseline gap-3">
                <span className="font-label text-label text-ink-muted">{study.number}</span>
                <span className="text-subheading font-medium text-ink">{study.name}</span>
              </figcaption>
              <p className="mt-1 max-w-measure text-small text-ink-soft">{study.thesis}</p>
            </figure>
          );
        })}
      </div>
      <ViewControls
        className="mt-8 border-t border-line pt-4"
        states={["Today", "Future"]}
        built={built}
        onBuiltChange={setBuilt}
        onReset={() => setView(REST_VIEW)}
        onZoom={(factor) => setView((current) => clampView({ ...current, zoom: current.zoom * factor }))}
        label="Both studies: today to future"
      />
    </div>
  );
}
