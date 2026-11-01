"use client";

import { useCallback } from "react";
import { ONCE_FROM, ONCE_RATE, wireCurrent } from "./current";

/** Where a loop holds its END pose: inside the END hold of every plate's keyframes. */
const END = 0.8;
/**
 * Settling into END plays the loop at most this many times its normal speed,
 * so a far jump takes longer instead of racing through the keyframes.
 */
const SETTLE_SPEED = 2.2;
/** Settle duration bounds (ms). */
const SETTLE_MIN_MS = 420;
const SETTLE_MAX_MS = 1400;
/** easeInOutCubic: starts from the loop's motion, lands softly on END. */
/** Leaving hover, how long the loop takes to ramp from still to full speed. */
const RESUME_MS = 450;
const easeInOut = (k: number) => (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2);
/** On re-entry, how long the rest pose shows before the loop starts moving. */
const REPLAY_LEAD_MS = 300;

/**
 * Renders a hidden marker and sets data-loop="on" | "off" on its .svc-fig
 * figure. "on" only while the figure is revealed (data-revealed, set by the
 * reveal runtime), intersecting the viewport, and the tab is visible; never
 * under prefers-reduced-motion: reduce. loop.css reads the attribute. No
 * per-frame work: one IntersectionObserver, one MutationObserver on the
 * figure's own attributes, and two cheap listeners, all removed on unmount.
 *
 * The pointer can take over while the loop is on:
 *   hover (mouse or pen)  the loop settles into END and holds, and once it
 *                         has, the figure gets data-explore="on" for the
 *                         plate's hover details (explore.css); leaving
 *                         resumes the loop
 *   tap (touch)           the same, held until a tap lands outside the
 *                         figure or it scrolls away
 * Once the controller has driven the animations itself, CSS play-state no
 * longer reaches them (Web Animations), so sync() plays and pauses them too.
 *
 * A plate revealed by the energy wire (data-reveal-by="energy", see
 * EnergyFlow) plays its story once, from START to its END hold, and holds
 * there: the wire is plugged into its END artwork, and scrolling back and
 * forth never replays it. It starts moving as soon as the energy lands (no
 * start delay, no START hold), a pointer never interrupts it, and once it
 * holds, its details are live whenever the pointer is over it (or it was
 * tapped), including a pointer that was already there before it finished.
 */
export function PlateLoop() {
  const ref = useCallback((marker: HTMLSpanElement | null) => {
    const fig = marker?.parentElement;
    if (!marker || !fig) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const once = fig.getAttribute("data-reveal-by") === "energy";
    const unwire = wireCurrent(fig);
    let started = false;
    let held = false;
    let pointing = false;
    let watch = 0;
    let inView = false;
    let on = false;
    let owned = false;
    let hovering = false;
    let frame = 0;

    const loops = () =>
      fig.getAnimations({ subtree: true }).filter((a): a is CSSAnimation => {
        const target = (a.effect as KeyframeEffect | null)?.target;
        return "animationName" in a && !!target?.classList.contains("loop");
      });

    const stop = () => cancelAnimationFrame(frame);

    /** A once plate's details: live while it holds END, is on screen and has the pointer. */
    const explore = () => {
      if (held && on && pointing) fig.setAttribute("data-explore", "on");
      else fig.removeAttribute("data-explore");
    };

    /** Pin every loop at its first END hold: the story has been told. */
    const hold = () => {
      cancelAnimationFrame(watch);
      held = true;
      for (const a of loops()) {
        const { delay = 0, duration } = a.effect!.getTiming();
        a.pause();
        a.currentTime = delay + END * Number(duration);
        a.playbackRate = 1;
      }
      explore();
    };

    /**
     * A once plate's loops each stop on their own first END (the browser ends them there and keeps
     * that frame), so a node the activation wave reached early holds while later ones are still
     * building, instead of running on into its return to START. The plate holds when every loop has.
     */
    const stopAtEnd = () => {
      for (const a of loops()) a.effect!.updateTiming({ iterations: END, fill: "forwards" });
    };
    const watchEnd = () => {
      cancelAnimationFrame(watch);
      const check = () => {
        if (loops().every((a) => a.playState === "finished")) hold();
        else if (on) watch = requestAnimationFrame(check);
      };
      watch = requestAnimationFrame(check);
    };

    /** Each animation's time at its nearest END hold, forwards or back. */
    const endOf = (a: Animation) => {
      const { delay = 0, duration } = a.effect!.getTiming();
      const length = Number(duration);
      const t = Number(a.currentTime ?? 0) - delay;
      const lap = Math.max(0, Math.floor(t / length));
      return delay + (lap + END) * length;
    };

    const settle = () => {
      stop();
      owned = true;
      const moves = loops().map((a) => {
        a.pause();
        return { a, from: Number(a.currentTime ?? 0), to: endOf(a) };
      });
      const far = Math.max(0, ...moves.map(({ from, to }) => Math.abs(to - from)));
      const ms = Math.min(SETTLE_MAX_MS, Math.max(SETTLE_MIN_MS, far / SETTLE_SPEED));
      const begin = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - begin) / ms);
        const eased = easeInOut(k);
        for (const { a, from, to } of moves) a.currentTime = from + (to - from) * eased;
        if (k < 1) frame = requestAnimationFrame(step);
        else fig.setAttribute("data-explore", "on");
      };
      frame = requestAnimationFrame(step);
    };

    const resume = () => {
      stop();
      fig.removeAttribute("data-explore");
      if (once) {
        owned = true;
        for (const a of loops()) {
          if (held) {
            a.pause();
            continue;
          }
          a.playbackRate = ONCE_RATE;
          // A loop already stopped on its END stays there: play() would rewind it.
          if (a.playState === "finished") continue;
          if (on) a.play();
          else a.pause();
        }
        if (on && !held) watchEnd();
        explore();
        return;
      }
      if (!owned) return;
      const all = loops();
      for (const a of all) {
        if (on) a.play();
        else a.pause();
      }
      if (!on) {
        for (const a of all) a.playbackRate = 1;
        return;
      }
      // Ease out of the held END pose instead of snapping to full speed.
      const begin = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - begin) / RESUME_MS);
        const rate = 0.05 + 0.95 * k * k;
        for (const a of all) a.playbackRate = rate;
        if (k < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };

    /**
     * Each time the figure comes back on screen, rewind every loop to just
     * before its START so the story replays from the beginning (staggers kept).
     */
    const restart = () => {
      const all = loops();
      if (!all.length) return;
      const base = Math.min(...all.map((a) => a.effect!.getTiming().delay ?? 0));
      const at = Math.max(0, base - REPLAY_LEAD_MS);
      for (const a of all) a.currentTime = at;
    };

    /** A once plate's first start: straight to the moment its nodes leave START (staggers kept). */
    const jumpIn = () => {
      const all = loops();
      if (!all.length) return;
      const base = Math.min(...all.map((a) => a.effect!.getTiming().delay ?? 0));
      for (const a of all) a.currentTime = base + ONCE_FROM * Number(a.effect!.getTiming().duration);
      stopAtEnd();
    };

    const sync = () => {
      on =
        !reduce.matches &&
        inView &&
        document.visibilityState === "visible" &&
        fig.hasAttribute("data-revealed");
      const next = on ? "on" : "off";
      if (fig.getAttribute("data-loop") !== next) {
        fig.setAttribute("data-loop", next);
        if (!on) hovering = false;
        else if (!once) restart();
        else if (!started) {
          started = true;
          jumpIn();
        }
        resume();
      }
    };

    const enter = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (once) {
        pointing = true;
        return explore();
      }
      if (!on || hovering) return;
      hovering = true;
      settle();
    };
    const leave = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (once) {
        pointing = false;
        return explore();
      }
      if (!hovering) return;
      hovering = false;
      resume();
    };
    // Touch has no hover: a tap holds the figure in END and marks the part it
    // landed on (data-active, read like :hover by explore.css); a tap
    // elsewhere lets it go.
    const tap = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      const inside = fig.contains(e.target as Node);
      fig.querySelector(".pick[data-active]")?.removeAttribute("data-active");
      if (inside) (e.target as Element).closest(".pick")?.setAttribute("data-active", "");
      if (once) {
        pointing = inside;
        return explore();
      }
      if (inside && on && !hovering) {
        hovering = true;
        settle();
      } else if (!inside && hovering) {
        hovering = false;
        resume();
      }
    };

    const io = new IntersectionObserver((entries) => {
      inView = entries[entries.length - 1].isIntersecting;
      sync();
    });
    const mo = new MutationObserver(sync);
    io.observe(fig);
    mo.observe(fig, { attributes: true, attributeFilter: ["data-revealed"] });
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", sync);
    fig.addEventListener("pointerenter", enter);
    fig.addEventListener("pointerleave", leave);
    document.addEventListener("pointerdown", tap);
    sync();

    // React 19 runs the returned function when the ref detaches.
    return () => {
      stop();
      cancelAnimationFrame(watch);
      unwire();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", sync);
      fig.removeEventListener("pointerenter", enter);
      fig.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerdown", tap);
      fig.removeAttribute("data-loop");
      fig.removeAttribute("data-explore");
    };
  }, []);

  return <span ref={ref} hidden aria-hidden="true" />;
}
