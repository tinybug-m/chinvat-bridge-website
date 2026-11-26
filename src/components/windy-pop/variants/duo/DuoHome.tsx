"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { StageState } from "@/components/three/core/types";
import { WindyChatProvider, useWindyChat } from "@/components/windy-pop/useWindyChat";
import type { CueName, Mood, Place, Attention } from "./compat";
import { createStore, moved, rectOf, type Point, type Rect, type Store } from "./store";
import styles from "./duo.module.css";

/*
 * Variation D, "Duo": the director. One transparent stage is fixed over the viewport and carries
 * the dog everywhere: in the hero's window (in colour), out of it (in ink) to the bottom corner, and
 * into the contact section. Where it should be is decided only by the scroll position (with a little
 * hysteresis), so scrolling back reverses everything. No scroll-jacking.
 *
 * Per-frame values (where the dog stands, the window's rect, where it looks, the speech envelope)
 * live in stores read by the dog's own component; the page re-renders only when the spot, a chat or
 * the stage's state changes.
 */

export type Spot = "hero" | "corner" | "contact";
const ANCHORS = ["hero", "window", "heroChat", "contact", "slot", "contactChat", "panel"] as const;
export type AnchorName = (typeof ANCHORS)[number];

export type DogFrame = { place: Place | null; window: Rect | null; look: Point | null; talk: number; heading: number; sit: boolean };
export type DogOut = { box: Rect | null; mouth: Point | null; arrived: boolean; moving: boolean };
export type DogMind = { attention: Attention; mood: Mood; cue: { name: CueName; id: number } | undefined };

type Duo = {
  /** Whether the chat can be offered (isChatAvailable()). */
  chat: boolean;
  spot: Spot;
  wide: boolean;
  stage: StageState;
  setStage: (state: StageState) => void;
  heroChat: boolean;
  openHeroChat: (opener?: HTMLElement | null) => void;
  closeHeroChat: () => void;
  panel: boolean;
  openPanel: () => void;
  closePanel: () => void;
  register: (name: AnchorName) => (el: HTMLElement | null) => void;
  frame: Store<DogFrame>;
  out: Store<DogOut>;
  /** The mouth on screen (viewport px) every frame it moves, unthrottled: for things that ride with the head. */
  head: Store<Point | null>;
  mind: Store<DogMind>;
  cue: (name: CueName) => void;
  /** Keeps the frame loop running for a while (after a layout change that animates). */
  kick: (ms?: number) => void;
};

const Context = createContext<Duo | null>(null);
export function useDuo() {
  const value = useContext(Context);
  if (!value) throw new Error("useDuo needs DuoHome");
  return value;
}

/** Breakpoint where the hero sets copy and window side by side (matches duo.module.css). */
const WIDE = 1024;

/** Headings (radians about the vertical): nose left with the head to the visitor; straight on. */
const LEFT = -1;
const FRONT = 0;

/** Where the dog stands in its window and its slot, as fractions of their rects. */
export const HERO_SPOT = { x: 0.56, ground: 0.822, height: 0.7 };
const SLOT_SPOT = { x: 0.5, ground: 1, groundOffset: 12, height: 0.82 };

/** The corner dog: its standing height and its margin from the viewport's edges. */
const corner = (vw: number, vh: number, panelOpen: boolean, panel: Rect | null): Place => {
  const wide = vw >= WIDE;
  const height = wide ? 116 : 84;
  const margin = wide ? 20 : 10;
  // On a phone the open chat is a sheet: the dog sits on its top edge, at the right.
  if (!wide && panelOpen && panel) return { anchor: "corner-sheet", x: vw - margin - height * 0.55, y: panel.y + 6, height: height * 0.9 };
  return { anchor: "corner", x: vw - margin - height * 0.55, y: vh - margin, height };
};

export function DuoHome({ chat = true, children }: { chat?: boolean; children: ReactNode }) {
  // One conversation for the whole page: the hero, the corner panel and the contact section show it.
  return (
    <WindyChatProvider>
      <Director chat={chat}>{children}</Director>
    </WindyChatProvider>
  );
}

function Director({ chat, children }: { chat: boolean; children: ReactNode }) {
  const [spot, setSpot] = useState<Spot>("hero");
  const [wide, setWide] = useState(true);
  const [stage, setStage] = useState<StageState>("idle");
  const [heroChat, setHeroChat] = useState(false);
  const [panel, setPanel] = useState(false);

  const [frame] = useState(() => createStore<DogFrame>({ place: null, window: null, look: null, talk: 0, heading: LEFT, sit: false }));
  const [out] = useState(() => createStore<DogOut>({ box: null, mouth: null, arrived: false, moving: false }));
  const [head] = useState(() => createStore<Point | null>(null));
  const [mind] = useState(() => createStore<DogMind>({ attention: "idle", mood: "neutral", cue: undefined }));

  const anchors = useRef<Partial<Record<AnchorName, HTMLElement | null>>>({});
  const live = useRef({ spot: "hero" as Spot, heroChat: false, panel: false, wide: true, talk: 0, until: 0, last: 0, pointer: null as (Point & { at: number }) | null });
  const raf = useRef(0);
  const opener = useRef<HTMLElement | null>(null);
  const cueId = useRef(0);

  const loop = useRef<(now: number) => void>(() => {});
  const kick = useCallback((ms = 700) => {
    const l = live.current;
    l.until = Math.max(l.until, performance.now() + ms);
    if (!raf.current) raf.current = requestAnimationFrame((t) => loop.current(t));
  }, []);

  // The frame loop: measures, decides the spot, and writes the dog's targets. It runs only while
  // something moves (a scroll, a resize, a transition, a reply being spoken).
  useEffect(() => {
    loop.current = (now) => {
      raf.current = 0;
      const l = live.current;
      const dt = l.last ? Math.min(0.1, (now - l.last) / 1000) : 1 / 60;
      l.last = now;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const a = anchors.current;

      // Where the dog is wanted. Hysteresis: it leaves the hero later than it comes back, and stays
      // in the contact section once there until most of it has gone.
      const hero = rectOf(a.hero);
      const contact = rectOf(a.contact);
      const scrolledIn = hero ? -hero.y : Infinity;
      const inHero = l.spot === "hero" ? scrolledIn < 0.3 * vh : scrolledIn < 0.14 * vh;
      const inContact = contact
        ? l.spot === "contact"
          ? contact.y < 0.95 * vh && contact.y + contact.height > 0.18 * vh
          : contact.y < 0.75 * vh && contact.y + contact.height > 0.4 * vh
        : false;
      const spotNow: Spot = inHero ? "hero" : inContact ? "contact" : "corner";
      if (spotNow !== l.spot) {
        // The conversation follows the dog: leaving the corner closes its panel; if it was open on
        // the way back to the top, the hero opens its chat instead.
        if (l.spot === "corner" && l.panel) {
          l.panel = false;
          setPanel(false);
          if (spotNow === "hero") {
            l.heroChat = true;
            setHeroChat(true);
          }
        }
        l.spot = spotNow;
        l.until = Math.max(l.until, now + 800);
        setSpot(spotNow);
      }
      const isWide = vw >= WIDE;
      if (isWide !== l.wide) {
        l.wide = isWide;
        setWide(isWide);
      }

      const win = rectOf(a.window);
      let place: Place | null = null;
      let heading = LEFT;
      let sit = false;
      if (spotNow === "hero" && win) {
        place = { anchor: "window", x: win.x + win.width * HERO_SPOT.x, y: win.y + win.height * HERO_SPOT.ground, height: Math.min(win.height * HERO_SPOT.height, win.width * 0.7) };
      } else if (spotNow === "contact") {
        const slot = rectOf(a.slot);
        if (slot) place = { anchor: "contact", x: slot.x + slot.width * SLOT_SPOT.x, y: slot.y + slot.height * SLOT_SPOT.ground - SLOT_SPOT.groundOffset, height: Math.min(slot.height * SLOT_SPOT.height, slot.width * 1.05) };
        heading = isWide ? LEFT : FRONT;
        sit = true;
      } else {
        place = corner(vw, vh, l.panel, rectOf(a.panel));
        // At rest in the corner it sits; with the chat open it stands to listen.
        sit = !l.panel;
      }

      // Where it looks: at the chat it is talking in, else at the pointer (in the hero), else at you.
      const centre = (r: Rect | null, fy = 0.5): Point | null => (r ? { x: r.x + r.width / 2, y: r.y + r.height * fy } : null);
      let look: Point | null = null;
      const m = mind.get();
      if (spotNow === "hero" && l.heroChat) look = centre(rectOf(a.heroChat), m.attention === "listening" ? 0.9 : 0.55);
      else if (spotNow === "corner" && l.panel) look = centre(rectOf(a.panel), m.attention === "listening" ? 0.9 : 0.5);
      else if (spotNow === "contact" && (m.attention !== "idle" || a.contactChat?.contains(document.activeElement))) look = centre(rectOf(a.contactChat), m.attention === "listening" ? 0.9 : 0.5);
      else if (spotNow === "hero" && l.pointer && now - l.pointer.at < 2600) look = { x: l.pointer.x, y: l.pointer.y };

      // The speech envelope falls between chunks.
      l.talk = Math.max(0, l.talk - dt * 4.5);

      const prev = frame.get();
      const changed =
        moved(prev.place && { x: prev.place.x, y: prev.place.y, h: prev.place.height }, place && { x: place.x, y: place.y, h: place.height }, 0.25) ||
        prev.place?.anchor !== place?.anchor ||
        moved(prev.window, win, 0.25) ||
        moved(prev.look, look, 2) ||
        Math.abs(prev.talk - l.talk) > 0.02 ||
        prev.heading !== heading ||
        prev.sit !== sit;
      if (changed) frame.set({ place, window: win ?? prev.window, look, talk: l.talk < 0.02 ? 0 : l.talk, heading, sit });

      if (now < l.until || l.talk > 0) raf.current = requestAnimationFrame((t) => loop.current(t));
      else l.last = 0;
    };
    kick(400);

    const onScroll = () => kick(400);
    const onResize = () => kick(600);
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      live.current.pointer = { x: event.clientX, y: event.clientY, at: performance.now() };
      if (live.current.spot === "hero" && !live.current.heroChat) kick(2700);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    const watch = new ResizeObserver(() => kick(300));
    watch.observe(document.body);
    return () => {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      watch.disconnect();
    };
  }, [frame, mind, kick]);

  // One stable ref callback per anchor.
  const [refs] = useState(() => {
    const make = (name: AnchorName) => (el: HTMLElement | null) => {
      anchors.current[name] = el;
      kick(300);
    };
    return Object.fromEntries(ANCHORS.map((name) => [name, make(name)])) as Record<AnchorName, (el: HTMLElement | null) => void>;
  });
  const register = useCallback((name: AnchorName) => refs[name], [refs]);

  const cue = useCallback(
    (name: CueName) => {
      mind.set({ ...mind.get(), cue: { name, id: ++cueId.current } });
    },
    [mind],
  );

  // The conversation drives the dog: what it is doing (listening, thinking, talking), the mood of
  // the reply, and a pulse of the mouth for each streamed piece of text.
  const { activity, mood, subscribe } = useWindyChat();
  useEffect(() => {
    const before = mind.get();
    if (before.attention === activity && before.mood === mood) return;
    // A reply that arrives excited gets a little hop; a happy one a wag.
    const cueNext = mood !== before.mood && (mood === "excited" || mood === "happy") ? { name: mood === "excited" ? ("hop" as const) : ("wag" as const), id: ++cueId.current } : before.cue;
    mind.set({ attention: activity, mood, cue: cueNext });
    kick(400);
  }, [activity, mood, mind, kick]);
  useEffect(
    () =>
      subscribe((chunk) => {
        live.current.talk = Math.min(1, live.current.talk + 0.55 + Math.min(0.35, chunk.length / 80));
        kick(200);
      }),
    [subscribe, kick],
  );

  const value = useMemo<Duo>(
    () => ({
      chat,
      spot,
      wide,
      stage,
      setStage,
      heroChat,
      openHeroChat: (from) => {
        if (!chat) return;
        opener.current = from ?? (document.activeElement as HTMLElement | null);
        live.current.heroChat = true;
        setHeroChat(true);
        cue("tilt");
        kick(900);
        // On a phone the window and the chat fill one screen: bring the hero's top into view.
        if (window.innerWidth < WIDE && window.scrollY > 0) {
          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        }
      },
      closeHeroChat: () => {
        live.current.heroChat = false;
        setHeroChat(false);
        kick(900);
        const back = opener.current;
        opener.current = null;
        requestAnimationFrame(() => (back?.isConnected ? back : anchors.current.window?.querySelector<HTMLElement>("button"))?.focus({ preventScroll: true }));
      },
      panel,
      openPanel: () => {
        live.current.panel = true;
        setPanel(true);
        cue("tilt");
        kick(900);
      },
      closePanel: () => {
        live.current.panel = false;
        setPanel(false);
        kick(900);
      },
      register,
      frame,
      out,
      head,
      mind,
      cue,
      kick,
    }),
    [chat, spot, wide, stage, heroChat, panel, register, frame, out, head, mind, cue, kick],
  );

  return (
    <Context.Provider value={value}>
      <div className={styles.root} data-duo-home="" data-spot={spot}>
        {children}
      </div>
    </Context.Provider>
  );
}
