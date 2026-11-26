"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { WindyPopStage } from "@/components/windy-pop/WindyPopStage";
import type { StageState } from "@/components/three/core/types";
import { HERO_SPOT, useDuo, type DogFrame, type DogMind, type DogOut, type Spot } from "./DuoHome";
import type { Place } from "./compat";
import { useStore, type Rect } from "./store";
import styles from "./duo.module.css";

const NO_FRAME: DogFrame = { place: null, window: null, look: null, talk: 0, heading: -1, sit: false };
const NO_OUT: DogOut = { box: null, mouth: null, arrived: false, moving: false };
const NO_MIND: DogMind = { attention: "idle", mood: "neutral", cue: undefined };

/** The dog's box on screen: what the scene reports, or an estimate from where it was asked to stand. */
export function useDogBox(): Rect | null {
  const { frame, out } = useDuo();
  const f = useStore(frame, NO_FRAME);
  const o = useStore(out, NO_OUT);
  if (o.box && o.box.width > 0) return o.box;
  const p = f.place;
  if (!p) return null;
  return { x: p.x - p.height * 0.62, y: p.y - p.height, width: p.height * 1.24, height: p.height };
}

/** The container's size, kept by a ResizeObserver. */
function useSize(el: HTMLElement | null) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    if (!el) return;
    const watch = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    watch.observe(el);
    return () => watch.disconnect();
  }, [el]);
  return size;
}

/*
 * One stage per place, so the dog scrolls with the page wherever the page holds it:
 *   "hero"     inside the window, in the page's flow: it scrolls away with the hero.
 *   "contact"  inside the contact section's slot, in flow too.
 *   "corner"   fixed over the viewport, mounted only between the two: it walks in from the right
 *              edge once the hero has gone and walks back out when the hero or contact returns.
 * Hero and contact stages cover their section and pass the frame as the duo window: the dog walks in
 * from beyond the right edge in ink and turns to colour as it crosses into the frame. The corner is
 * in colour throughout.
 */
export function DuoDog({ where, solo }: { where: Spot; /** The page's only stage: it reports the page's stage state, as the hero's does. */ solo?: boolean }) {
  const duo = useDuo();
  const { frame, out, mind, spot, panel, stage } = duo;
  const f = useStore(frame, NO_FRAME);
  const m = useStore(mind, NO_MIND);
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const size = useSize(where === "corner" ? null : el);
  const active = spot === where;
  // Hero and contact: the stage covers the whole section; the frame (window or slot) is where the dog
  // stands and where it is in colour. Outside it, it is drawn in ink.
  const [frameEl, setFrameEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (where === "corner" || !el) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- finds the frame once the layer is in the section
    setFrameEl(el.parentElement?.querySelector<HTMLElement>("[data-duo-frame]") ?? null);
  }, [where, el]);
  const frameSize = useSize(frameEl);
  // `win`: the frame (where it stands); `tint`: where it is in colour, the frame unless the section
  // marks another element `data-duo-colour` (contact: the page container's content box).
  const [win, setWin] = useState<Rect | null>(null);
  const [tint, setTint] = useState<Rect | null>(null);
  useEffect(() => {
    if (!el || !frameEl) return;
    const a = el.getBoundingClientRect();
    const local = (node: HTMLElement) => {
      const b = node.getBoundingClientRect();
      const cs = getComputedStyle(node);
      const l = parseFloat(cs.paddingLeft) || 0;
      const r = parseFloat(cs.paddingRight) || 0;
      return { x: b.left - a.left + l, y: b.top - a.top, width: b.width - l - r, height: b.height };
    };
    const colour = el.parentElement?.querySelector<HTMLElement>("[data-duo-colour]");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the rects in the stage, after a resize
    setWin(local(frameEl));
    // The container's sides are the line; top to bottom it is the whole section, so no paw drops out.
    setTint(colour ? { ...local(colour), y: 0, height: a.height } : local(frameEl));
  }, [el, frameEl, size, frameSize]);

  // The corner stage: mounted while the dog is there and while it walks out; it enters off-screen
  // right and is then asked to stand in the corner, so it walks in.
  const [mounted, setMounted] = useState(false);
  const [live, setLive] = useState(false);
  const [entered, setEntered] = useState(false);
  // Hero and contact: the dog walks in from beyond the section's right edge each time the spot
  // becomes this one, and walks back out when it leaves.
  useEffect(() => {
    if (where === "corner") return;
    if (!active || !live) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- leaves when the spot moves on
      setEntered(false);
      return;
    }
    const t = setTimeout(() => setEntered(true), 120);
    return () => clearTimeout(t);
  }, [where, active, live]);
  // The corner stage is built once, early and off-screen (where it sleeps), and kept: building it on
  // demand compiled its shaders mid-scroll and froze the page for a moment.
  useEffect(() => {
    if (where !== "corner" || mounted || (stage !== "live" && !active)) return;
    const t = setTimeout(() => setMounted(true), active ? 0 : 1500);
    return () => clearTimeout(t);
  }, [where, mounted, stage, active]);
  useEffect(() => {
    if (where !== "corner") return;
    if (active && live) {
      const t = setTimeout(() => setEntered(true), 120);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- walks out when the spot moves on
    if (!active) setEntered(false);
  }, [where, active, live]);

  let place: Place | undefined;
  let heading = f.heading;
  let sit = f.sit;
  if (where !== "corner" && size && win) {
    const spotAt: Place =
      where === "hero"
        ? { anchor: "window", x: win.x + win.width * HERO_SPOT.x, y: win.y + win.height * HERO_SPOT.ground, height: Math.min(win.height * HERO_SPOT.height, win.width * 0.7) }
        : { anchor: "contact", x: win.x + win.width * 0.5, y: win.y + win.height - 12, height: Math.min(win.height * 0.82, win.width * 1.05) };
    const away: Place = { anchor: entered ? "exit" : "enter", x: size.w + spotAt.height * (where === "hero" ? 0.8 : 1.4), y: spotAt.y, height: spotAt.height };
    place = entered ? spotAt : away;
    heading = where === "contact" && entered && !duo.wide ? 0 : -1;
    sit = where === "contact" && entered;
  } else if (where === "corner" && typeof window !== "undefined") {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const h = vw >= 1024 ? 116 : 84;
    const offstage: Place = { anchor: entered || !active ? "exit" : "enter", x: vw + h * 1.4, y: vh - (vw >= 1024 ? 20 : 10), height: h };
    place = entered && active && f.place?.anchor?.startsWith("corner") ? f.place : offstage;
    if (!entered || !active) sit = false;
  }

  // Look and outputs: the director works in viewport px; this stage in its own.
  const origin = () => {
    if (where === "corner" || !el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top };
  };
  const o0 = active ? origin() : { x: 0, y: 0 };
  const look = active && f.look ? { x: f.look.x - o0.x, y: f.look.y - o0.y } : null;
  const report = useRef(active);
  useEffect(() => {
    report.current = active;
  }, [active]);

  const onState = (state: StageState) => {
    if (where === "hero" || solo) duo.setStage(state);
    if (state === "live") setLive(true);
  };

  const dog =
    place && (where !== "corner" || mounted) ? (
      <WindyPopStage
        id={`windy-pop-duo-${where}`}
        intro={false}
        // The hero dog opens the page: loaded at once, and quicker on its feet.
        eager={where === "hero"}
        pace={where === "hero" ? 1.7 : 1}
        palette="duo"
        window={where === "corner" || !tint ? undefined : tint}
        place={place}
        heading={heading}
        sit={sit}
        attention={active ? m.attention : "idle"}
        mood={m.mood}
        talk={active ? f.talk : 0}
        look={look}
        cue={active ? m.cue : undefined}
        className={styles.stage}
        onStateChange={onState}
        onBoxChange={(b) => {
          if (!report.current) return;
          const at = origin();
          const next = { x: b.x + at.x, y: b.y + at.y, width: b.w, height: b.h };
          // Only a real move: the head's sway would re-render the badge every frame and shake it.
          const prev = out.get().box;
          if (prev && Math.abs(prev.x - next.x) < 12 && Math.abs(prev.y - next.y) < 12 && Math.abs(prev.width - next.width) < 12 && Math.abs(prev.height - next.height) < 12) return;
          out.set({ ...out.get(), box: next });
        }}
        onMouthChange={(mouth) => {
          if (!report.current) return;
          const at = origin();
          const next = mouth && { x: mouth.x + at.x, y: mouth.y + at.y };
          duo.head.set(next);
          // Only a real move: reporting every sway re-rendered the page's listeners every frame.
          const prev = out.get().mouth;
          if (prev && next && Math.abs(prev.x - next.x) < 12 && Math.abs(prev.y - next.y) < 12) return;
          out.set({ ...out.get(), mouth: next });
        }}
        onArrivedChange={(arrived) => {
          if (report.current) out.set({ ...out.get(), arrived });
        }}
        onMovingChange={(moving) => {
          if (report.current) out.set({ ...out.get(), moving });
        }}
      />
    ) : null;

  if (where !== "corner") {
    return (
      <div ref={setEl} className={styles.dogIn} aria-hidden="true">
        {dog}
      </div>
    );
  }
  return (
    <>
      <div className={styles.stageLayer} aria-hidden="true">
        {dog}
      </div>
      <CornerHit fallback={stage === "fallback"} show={duo.chat && active && (entered || stage === "fallback")} panel={panel} />
    </>
  );
}

/** A real button over the corner dog: it opens the compact chat. */
function CornerHit({ fallback, show, panel }: { fallback: boolean; show: boolean; panel: boolean }) {
  const duo = useDuo();
  const box = useDogBox();
  const o = useStore(duo.out, NO_OUT);

  // The corner dog says hello once each time it settles there, then folds the line into a small badge.
  const [hello, setHello] = useState(false);
  const atCorner = show && !panel;
  useEffect(() => {
    if (!atCorner) return;
    const on = setTimeout(() => setHello(true), 1400);
    const off = setTimeout(() => setHello(false), 5600);
    return () => {
      clearTimeout(on);
      clearTimeout(off);
      setHello(false);
    };
  }, [atCorner]);

  // The line rides with the head: its tail stays at the mouth as the dog breathes and looks about.
  const [wrap, setWrap] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!wrap) return;
    const follow = () => {
      const at = duo.head.get();
      if (!at || duo.out.get().moving) return;
      const r = wrap.getBoundingClientRect();
      wrap.style.setProperty("--mx", `${(at.x - r.left).toFixed(1)}px`);
      wrap.style.setProperty("--my", `${(at.y - r.top).toFixed(1)}px`);
    };
    follow();
    return duo.head.subscribe(follow);
  }, [wrap, duo.head, duo.out]);

  if (!show || !box) return null;
  return (
    <div
      ref={setWrap}
      className={styles.hitWrap}
      data-spot="corner"
      data-fallback={fallback || undefined}
      data-moving={o.moving || undefined}
      style={{ "--x": `${box.x}px`, "--y": `${box.y}px`, "--w": `${box.width}px`, "--h": `${box.height}px` } as CSSProperties}
    >
      <button
        type="button"
        className={styles.hit}
        aria-label="Chat with Windy Pup, our AI assistant"
        aria-expanded={panel}
        aria-controls="duo-panel"
        onPointerEnter={() => duo.cue("wag")}
        onClick={() => (panel ? duo.closePanel() : duo.openPanel())}
      >
        {fallback ? (
          // eslint-disable-next-line @next/next/no-img-element -- only without WebGL: the dog as a still
          <img className={styles.hitPoster} src="/windy-pop/duo/ink.webp" alt="" decoding="async" />
        ) : null}
        {!panel ? (
          <span className={styles.badge} data-open={hello || undefined} aria-hidden="true">
            <span className={styles.badgeDots}>
              <i />
              <i />
              <i />
            </span>
            <span className={styles.badgeText}>
              <span>
                <span className={styles.badgeLine}>Need anything?</span>
              </span>
            </span>
          </span>
        ) : null}
      </button>
    </div>
  );
}
