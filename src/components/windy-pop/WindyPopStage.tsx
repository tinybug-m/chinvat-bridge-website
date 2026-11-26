"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { ThreeStage } from "@/components/three/core/ThreeStage";
import type { StageHandle, StageState } from "@/components/three/core/types";
import { ATTENTIONS, CUES, MOODS, type Attention, type CueName, type Mood } from "./pose";

export type { Attention as WindyPopAttention, CueName as WindyPopCueName, Mood as WindyPopMood } from "./pose";

const load = () => import("./scene");

/** Headings, in radians about the vertical: which way the dog faces while standing still. */
export const HEADING = {
  /** Straight at the visitor. */
  visitor: 0,
  /** Side on, nose to the right of the screen. */
  right: Math.PI / 2,
  /** Side on, nose to the left of the screen. */
  left: -Math.PI / 2,
  /** The lab's three-quarter view, nose to the left, head turned to the visitor. */
  threeQuarter: -1,
} as const;

export type WindyPopSide = "left" | "right";

/** Where the dog stands, CSS px in the stage: its feet (the middle of its footprint) and its standing height. */
export interface WindyPopPlace {
  x: number;
  y: number;
  /** Ground to the top of its head while standing, CSS px. */
  height: number;
  /**
   * What the place is pinned to, e.g. "window", "corner", "contact". While it stays the same, the
   * dog moves rigidly with the place (the page scrolling); when it changes (or is not given) a change
   * of place is a journey: walked across, eased in height and up or down.
   */
  anchor?: string;
}

/** A rectangle in CSS px relative to the stage. */
export interface WindyPopRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The dog's extent on screen, CSS px relative to the stage. */
export interface WindyPopBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WindyPopStageProps {
  /**
   * Play the formation script (forms sitting, wakes, stands, yawns, asks). `false` starts it formed,
   * standing and awake, for pages that bring it in already made. Read once, when the stage loads.
   */
  intro?: boolean;
  /**
   * Where it stands, in frame units: 0 is home, -1 and 1 are just out of sight to the left and the
   * right (whatever the stage's size); values between are proportional. Changing it makes the dog
   * turn, trot there and stop. Default 0.
   */
  x?: number;
  /** When it is out of sight and `x` brings it back, the side it walks in from. Default: the side it left by. */
  enterFrom?: WindyPopSide;
  /** Which way it faces while standing still, radians (see HEADING). Default HEADING.threeQuarter. */
  heading?: number;
  /** How much faster than its natural trot it covers a journey. Default 1. */
  pace?: number;
  /** Load the scene at once, not after the page has gone idle. Read once. */
  eager?: boolean;
  /** 0..1: trot on the spot, on top of any walking to reach `x`. Default 0. */
  walk?: number;
  /** Sit down once it has arrived. Default false. */
  sit?: boolean;
  /** Home position right of the stage's centre, as a fraction of its width. Default: the lab's layout. */
  aside?: number;
  /**
   * "night" (default): light on dark glass. "ink": drawn in navy ink with saffron and blue accents,
   * for the paper site. "duo": in colour (cyan, azure, saffron) inside `window`, in ink outside it.
   * Read once, when the stage loads.
   */
  palette?: "night" | "ink" | "duo";
  /**
   * Duo only: the colour window, CSS px relative to the stage. The dog is in colour inside it and in
   * ink outside, with a soft edge of a few px. A rect with no area (or wholly off the stage) is all
   * ink; unset, the whole stage is the window. Pass it whenever it moves (scroll, resize).
   */
  window?: WindyPopRect;
  /**
   * Where the dog stands, in CSS px: replaces `x` and `aside`. A change walks it there (trotting,
   * facing the way it goes) while its height and level ease; see WindyPopPlace.anchor.
   */
  place?: WindyPopPlace;
  /** idle; listening (the visitor is typing); thinking (waiting for the reply); talking (the reply is streaming). */
  attention?: Attention;
  /** 0..1, a speech envelope: pulse it on each streamed chunk. Drives the mouth while talking. */
  talk?: number;
  mood?: Mood;
  /** A point to look at, CSS px relative to the stage (the head turns, within natural limits); null faces the visitor. */
  look?: { x: number; y: number } | null;
  /** A one-shot gesture; a new id plays it again. */
  cue?: { name: CueName; id: number };
  /** Ink only: the drawn-to-built seam, as a fraction of the stage's width; right of it the dog is built (night light on dark glass). Default: none, all drawn. */
  seam?: number;
  id?: string;
  className?: string;
  /** Under the canvas: the poster for no-WebGL. */
  children?: ReactNode;
  /** Everything the scene reports: ask, x and y (the mouth on screen), moving, away. */
  onOutput?: (key: string, value: number) => void;
  onStateChange?: (state: StageState) => void;
  /** True while it walks or turns. */
  onMovingChange?: (moving: boolean) => void;
  /** True while it is wholly out of sight (it then stops drawing until it is called back). */
  onAwayChange?: (away: boolean) => void;
  /** True once it has reached `place` (or `x`), false while it is on its way. */
  onArrivedChange?: (arrived: boolean) => void;
  /** The dog's extent on screen, whenever it changes by half a pixel or more. */
  onBoxChange?: (box: WindyPopBox) => void;
  /** The middle of its mouth on screen, CSS px relative to the stage, whenever it moves. */
  onMouthChange?: (mouth: { x: number; y: number }) => void;
}

const PALETTES = { night: 0, ink: 1, duo: 2 } as const;

/** A stable number for an anchor name (scene inputs are numbers). */
function anchorKey(anchor: string | undefined) {
  if (anchor === undefined) return Number.NaN;
  let hash = 5381;
  for (let i = 0; i < anchor.length; i += 1) hash = ((hash * 33) ^ anchor.charCodeAt(i)) >>> 0;
  return hash;
}

/** Sets an input when the prop is given; when it is taken away again, puts back `fallback`. */
function useInput(handle: RefObject<StageHandle | null>, key: string, value: number | undefined, fallback: number) {
  useEffect(() => {
    const stage = handle.current;
    if (!stage) return;
    if (value !== undefined) stage.set(key, value);
    else if (stage.get(key) !== undefined) stage.set(key, fallback);
  }, [handle, key, value, fallback]);
}

/**
 * Windy Pup's stage, drivable from a page. Every prop is a target: the scene eases towards it, so a
 * page only says where the dog should be and which way it should face.
 *
 *   <WindyPopStage intro={false} x={-1} />                         walk out to the left
 *   <WindyPopStage intro={false} x={0} enterFrom="right" heading={HEADING.visitor} sit />
 *                                                                   walk in from the right and sit facing you
 *
 * Under prefers-reduced-motion it does not walk: it glides and fades.
 */
export function WindyPopStage({
  intro = true,
  x = 0,
  enterFrom,
  heading = HEADING.threeQuarter,
  walk = 0,
  pace = 1,
  eager,
  sit = false,
  aside,
  palette = "night",
  seam,
  id = "windy-pop",
  className,
  children,
  onOutput,
  onStateChange,
  onMovingChange,
  onAwayChange,
  place,
  window: frame,
  attention,
  talk,
  mood,
  look,
  cue,
  onArrivedChange,
  onBoxChange,
  onMouthChange,
}: WindyPopStageProps) {
  const handle = useRef<StageHandle>(null);
  const listeners = useRef({ onOutput, onMovingChange, onAwayChange, onArrivedChange, onBoxChange, onMouthChange });
  useEffect(() => {
    listeners.current = { onOutput, onMovingChange, onAwayChange, onArrivedChange, onBoxChange, onMouthChange };
  });
  // The latest box and mouth, assembled from the scene's numeric outputs.
  const outputs = useRef({ bboxX: 0, bboxY: 0, bboxW: 0, bboxH: 0, mouthX: 0, mouthY: 0 });

  // Inputs set before the scene exists are kept and applied when it loads, `intro` included.
  useEffect(() => handle.current?.set("intro", intro ? 1 : 0), [intro]);
  useEffect(() => handle.current?.set("x", x), [x]);
  useEffect(() => handle.current?.set("from", enterFrom === "left" ? -1 : enterFrom === "right" ? 1 : 0), [enterFrom]);
  useEffect(() => handle.current?.set("heading", heading), [heading]);
  useEffect(() => handle.current?.set("walk", walk), [walk]);
  useEffect(() => handle.current?.set("pace", pace), [pace]);
  useEffect(() => handle.current?.set("sit", sit ? 1 : 0), [sit]);
  useEffect(() => {
    if (aside !== undefined) handle.current?.set("aside", aside);
  }, [aside]);
  useEffect(() => handle.current?.set("palette", PALETTES[palette]), [palette]);
  useEffect(() => {
    if (seam !== undefined) handle.current?.set("seam", seam);
  }, [seam]);

  // Placement: the anchor first, so the scene sees it with the new place.
  const placeKey = anchorKey(place?.anchor);
  useEffect(() => {
    const stage = handle.current;
    if (!stage) return;
    if (!place) {
      if ((stage.get("placeH") ?? 0) > 0) stage.set("placeH", 0);
      return;
    }
    stage.set("placeKey", placeKey);
    stage.set("placeX", place.x);
    stage.set("placeY", place.y);
    stage.set("placeH", Math.max(6, place.height));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the place's numbers are its identity
  }, [place?.x, place?.y, place?.height, placeKey, place === undefined]);

  useEffect(() => {
    const stage = handle.current;
    if (!stage) return;
    if (frame) {
      stage.set("winX", frame.x);
      stage.set("winY", frame.y);
      stage.set("winW", frame.width);
      stage.set("winH", frame.height);
    } else if (stage.get("winW") !== undefined) stage.set("winW", Number.NaN);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the rect's numbers are its identity
  }, [frame?.x, frame?.y, frame?.width, frame?.height, frame === undefined]);

  useInput(handle, "attention", attention === undefined ? undefined : ATTENTIONS.indexOf(attention), 0);
  useInput(handle, "mood", mood === undefined ? undefined : MOODS.indexOf(mood), 0);
  useInput(handle, "talk", talk, 0);
  useEffect(() => {
    const stage = handle.current;
    if (!stage) return;
    if (look) {
      stage.set("lookX", look.x);
      stage.set("lookY", look.y);
      stage.set("look", 1);
    } else if (stage.get("look") !== undefined) stage.set("look", 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the point's numbers are its identity
  }, [look?.x, look?.y, !look]);
  useEffect(() => {
    const stage = handle.current;
    if (!stage || !cue) return;
    stage.set("cueName", CUES.indexOf(cue.name));
    stage.set("cue", cue.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a new id is a new cue
  }, [cue?.id, cue?.name]);

  return (
    <ThreeStage
      id={id}
      load={load}
      handleRef={handle}
      reducedMotion="static"
      eager={eager}
      className={className}
      onOutput={(key, value) => {
        const { onOutput: output, onMovingChange: moving, onAwayChange: away, onArrivedChange: arrived, onBoxChange: box, onMouthChange: mouth } = listeners.current;
        output?.(key, value);
        const latest = outputs.current;
        if (key === "moving") moving?.(value === 1);
        else if (key === "away") away?.(value === 1);
        else if (key === "arrived") arrived?.(value === 1);
        else if (key in latest) {
          latest[key as keyof typeof latest] = value;
          // The scene sends a box as its four numbers, then "bbox"; a mouth as two, then "mouth".
        } else if (key === "bbox") box?.({ x: latest.bboxX, y: latest.bboxY, w: latest.bboxW, h: latest.bboxH });
        else if (key === "mouth") mouth?.({ x: latest.mouthX, y: latest.mouthY });
      }}
      onStateChange={onStateChange}
    >
      {children}
    </ThreeStage>
  );
}
