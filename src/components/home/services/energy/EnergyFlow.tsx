"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { SWEEP_FROM, sweepSpan } from "../../bridge/sweep";
import { aimPlate } from "../current";
import { headAt, pointAt, routeWire, type Box, type Port, type Stop, type Wire } from "./route";
import "./energy.css";

/**
 * Where the wire meets a stop: the ports it may enter and leave by, and the
 * artwork it must not cross. Set as data-energy-ports on a plate's SVG, in
 * its board units (the viewBox), or on any other element, in shares of its
 * box (the Approach stage, whose seam carries the energy across).
 */
export interface EnergyPorts {
  ins: Port[];
  outs: Port[];
  /** One box [x0, y0, x1, y1] or several. */
  keepout: [number, number, number, number] | [number, number, number, number][];
}

/** The head sits on this line of the viewport (share of its height from the top). */
const LINE = 0.62;
/** Smoothing of the head towards its scroll position (ms). */
const TAU = 110;
/** How long a plate without a timed story (a Method plate's one-shot draw-in) holds the energy before passing it on (ms). */
const SETTLE_MS = 900;
/** The energy reaches the seam this far (px of scrolling) before its sweep starts. */
const SEAM_LEAD = 40;
/** A hold lets go once the scroll position is this share of the viewport past it. */
const HOLD_REACH = 0.5;
/** The travelling current: a short bright run with a fainter tail behind it. */
const COMETS = [
  { length: 84, opacity: 0.22 },
  { length: 44, opacity: 0.45 },
  { length: 16, opacity: 1 },
];

interface Layout {
  top: number;
  width: number;
  height: number;
  wire: Wire;
  /** Per stop: the element its arrival powers (a plate's figure, or the stop itself), and its ports as authored. */
  targets: HTMLElement[];
  ports: EnergyPorts[];
}

/** The box of an element's visible text: screen-reader-only text is laid out off its line and would widen it. */
function textBox(el: Element) {
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let box: { left: number; right: number; top: number; bottom: number } | null = null;
  for (let node = walk.nextNode(); node; node = walk.nextNode()) {
    if (!node.textContent?.trim() || node.parentElement?.closest(".sr-only")) continue;
    range.selectNodeContents(node);
    const r = range.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    box = box
      ? {
          left: Math.min(box.left, r.left),
          right: Math.max(box.right, r.right),
          top: Math.min(box.top, r.top),
          bottom: Math.max(box.bottom, r.bottom),
        }
      : { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
  }
  return box;
}

/** The box of an element's text (or, for a link or button, its whole box), where it will land. */
const tight = (el: Element) => {
  const box = (el.matches("a, button") ? null : textBox(el)) ?? el.getBoundingClientRect();
  // An unrevealed Reveal still sits lower by its rise; measure where it will land.
  const reveal = el.closest("[data-reveal]");
  const shift = reveal ? Number.parseFloat(getComputedStyle(reveal).translate.split(" ")[1] ?? "0") || 0 : 0;
  return {
    left: box.left,
    right: box.right,
    top: box.top - shift,
    bottom: box.bottom - shift,
  };
};

/** Text the wire keeps clear of, in every section it runs through. */
const TEXT = ":is(h1, h2, h3, p, a, button, [data-energy-text]):not(svg *)";

/** Measure the hero's origin, the text and every stop on the page, and route the wire through them. */
function measure(section: HTMLElement): Layout | null {
  const nodes = [...document.querySelectorAll<HTMLElement | SVGSVGElement>("[data-energy-ports]")];
  const targets = nodes.map((node) => (node instanceof SVGSVGElement ? node.closest<HTMLElement>(".svc-fig") : node));
  if (!nodes.length || targets.some((t) => !t)) return null;

  const sr = section.getBoundingClientRect();
  const marker = document.querySelector("[data-energy-origin]");
  const mr = marker?.getBoundingClientRect();
  const originY = mr ? mr.bottom - sr.top : 0;
  const top = Math.min(0, originY - 24);
  const toLayer = (x: number, y: number) => ({
    x: x - sr.left,
    y: y - sr.top - top,
  });
  const origin = mr ? toLayer(mr.left + mr.width / 2, mr.bottom) : toLayer(sr.left + 16, sr.top);
  const vh = window.innerHeight;

  const box = (r: { left: number; right: number; top: number; bottom: number }): Box => {
    const a = toLayer(r.left, r.top);
    const b = toLayer(r.right, r.bottom);
    return { x0: a.x, y0: a.y, x1: b.x, y1: b.y };
  };
  const last = nodes[nodes.length - 1].getBoundingClientRect().bottom;
  const text = [...document.querySelectorAll(`[data-hero] ${TEXT}, section ${TEXT}`)]
    .map(tight)
    .filter((r) => r.right > r.left && r.bottom > r.top && r.top < last + vh && r.bottom > (mr?.top ?? 0) - vh)
    .map(box);

  const all = nodes.map((node) => JSON.parse(node.dataset.energyPorts!) as EnergyPorts);
  const stops: Stop[] = nodes.map((node, i) => {
    const ports = all[i];
    const r = node.getBoundingClientRect();
    let at: (x: number, y: number) => { x: number; y: number };
    if (node instanceof SVGSVGElement) {
      const vb = node.viewBox.baseVal;
      at = (x, y) => toLayer(r.left + ((x - vb.x) * r.width) / vb.width, r.top + ((y - vb.y) * r.height) / vb.height);
    } else {
      // Shares of the box; a port on its edge is kept 4px inside the box and the page, where the wire
      // can run (the seam's rails end on the same 4px, bridge.css).
      const lo = Math.max(4, toLayer(r.left + 4, 0).x);
      const hi = Math.min(sr.width - 4, toLayer(r.right - 4, 0).x);
      at = (x, y) => {
        const p = toLayer(r.left + x * r.width, r.top + y * r.height);
        return { x: Math.min(hi, Math.max(lo, p.x)), y: p.y };
      };
    }
    const port = (p: Port): Port => ({ ...p, ...at(p.x, p.y) });
    const boxes = typeof ports.keepout[0] === "number" ? [ports.keepout as number[]] : (ports.keepout as number[][]);
    const stop: Stop = {
      ins: ports.ins.map(port),
      outs: ports.outs.map(port),
      keepout: boxes.map(([x0, y0, x1, y1]) => {
        const a = at(x0, y0);
        const b = at(x1, y1);
        return { x0: a.x, y0: a.y, x1: b.x, y1: b.y };
      }),
    };
    if (node.hasAttribute("data-energy-sweep")) {
      // Arrive as the seam starts to sweep (a little before, so the smoothed head is there first) and
      // leave as it finishes (sweep.ts): the trigger line is at LINE of the viewport, the stage's
      // centre at SWEEP_FROM, then the span higher.
      const start = toLayer(0, r.top + r.height / 2).y - (SWEEP_FROM - LINE) * vh;
      stop.arriveY = start - SEAM_LEAD;
      stop.leaveY = start + sweepSpan(vh);
    }
    return stop;
  });

  const wire = routeWire(origin, stops, text, sr.width);
  const height = Math.max(...wire.segments.flatMap((s) => s.points.map((p) => p.y))) + 32;
  return {
    top,
    width: sr.width,
    height,
    wire,
    targets: targets as HTMLElement[],
    ports: all,
  };
}

/**
 * The energy wire: one thread from the foot of the hero's pyramid down the
 * homepage, through every stop in page order (see route.ts for the routing):
 * the four Services plates, the Approach seam, which carries it across the
 * bridge as it sweeps, and the four Method plates, ending on the last. Ahead
 * of the energy the wire is a drawn, dashed hairline; behind it, a built ink
 * line. The head follows scroll (one line of the viewport, smoothed), and a
 * stop is powered only when the energy reaches its in port: this sets its
 * data-energized, once. A plate is also revealed by it (plates opt out of
 * the scroll reveal with data-reveal-by), its nodes timed outward from the
 * port the energy came in by (aimPlate); the seam is powered (bridge.css).
 * A plate holds the energy until it is built as far as its way out, then
 * passes it on, so the next stop is powered by a finished one. The layer
 * lives in Services and runs on below it.
 *
 * No per-frame work at rest: the scroll listener is attached only while the
 * wire is on screen, and the frame loop runs only while the head moves.
 * Under reduced motion the wire is drawn built, without a head, and the
 * plates are not hidden in the first place (reveal-runtime.ts).
 */
export function EnergyFlow() {
  const layerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const reduce = useReducedMotion();
  const shown = useRef(0);
  const fired = useRef(new Set<number>());

  useEffect(() => {
    const section = layerRef.current?.closest("section");
    if (!section) return;
    let frame = 0;
    const relayout = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setLayout(measure(section)));
    };
    const ro = new ResizeObserver(relayout);
    ro.observe(section);
    // Every section the wire runs through: the hero, and each one holding a stop.
    for (const el of document.querySelectorAll("[data-hero], [data-energy-ports]"))
      ro.observe(el.closest("section") ?? el);
    document.fonts?.ready.then(relayout);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layout || !layer) return;
    const { wire, targets, ports: authored } = layout;
    const wires = [...layer.querySelectorAll<SVGPathElement>(".energy-wire")];
    const comets = [...layer.querySelectorAll<SVGPathElement>(".energy-comet")];
    const ports = [...layer.querySelectorAll<SVGGElement>(".energy-port")];
    const head = layer.querySelector<SVGGElement>(".energy-head")!;
    // A plate the energy has just reached holds it until it is built as far as its way out: stop -> release time.
    const holds = new Map<number, number>();
    const timers: number[] = [];

    const draw = (h: number, live: boolean) => {
      wire.segments.forEach((s, k) => {
        const e = Math.min(s.length, Math.max(0, h - s.start));
        wires[k].style.strokeDashoffset = `${s.length - e}`;
        const active = e > 0 && e < s.length;
        COMETS.forEach((c, j) => {
          const comet = comets[k * COMETS.length + j];
          comet.style.strokeDashoffset = `${c.length - e}`;
          comet.style.opacity = active ? `${c.opacity}` : "0";
        });
      });
      wire.arrivals.forEach((a, i) => {
        const lit = h >= a.at - 0.5;
        ports[i].toggleAttribute("data-lit", lit);
        if (!lit) return;
        // The energy arriving is what powers the stop, once. A plate is revealed by it, built outward from the port.
        const target = targets[a.stop];
        if (!target.hasAttribute("data-energized")) {
          if (target.matches(".svc-fig[data-reveal-by='energy']:not([data-revealed])")) {
            const exit = authored[a.stop].outs[0];
            const built = aimPlate(target, authored[a.stop].ins[a.port], exit) ?? SETTLE_MS;
            target.setAttribute("data-revealed", "");
            if (live && exit) {
              holds.set(a.stop, performance.now() + built);
              timers.push(window.setTimeout(() => kick(), built + 16));
            }
          }
          target.setAttribute("data-energized", "");
        }
        if (live && !fired.current.has(i)) ports[i].setAttribute("data-fired", "");
        fired.current.add(i);
      });
      const p = h <= 0 ? wire.segments[0].points[0] : pointAt(wire.segments, h);
      const away = !p || h >= wire.total - 0.5;
      head.toggleAttribute("data-away", away);
      if (p) head.setAttribute("transform", `translate(${p.x} ${p.y})`);
    };

    if (reduce) {
      draw(wire.total, false);
      head.setAttribute("data-away", "");
      return;
    }

    const target = () => {
      const top = layer.getBoundingClientRect().top;
      return headAt(wire.keys, window.innerHeight * LINE - top);
    };

    let frame = 0;
    let last = 0;
    /**
     * The scroll position's head, held inside any plate still building (just short of its way out, so
     * hidden). A reader who has scrolled well past it is not kept waiting: the hold lets go, so what
     * is on screen (the seam's own sweep, the next plate) is never left unpowered behind it.
     */
    const held = (h: number, now: number) => {
      for (const [stop, until] of holds) {
        const out = wire.segments[stop + 1].start - 1;
        if (now >= until || h - out > window.innerHeight * HOLD_REACH) holds.delete(stop);
        else h = Math.min(h, out);
      }
      return h;
    };
    const step = (now: number) => {
      const goal = held(target(), now);
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      shown.current += (goal - shown.current) * (1 - Math.exp(-dt / TAU));
      if (Math.abs(goal - shown.current) < 0.4) shown.current = goal;
      draw(shown.current, true);
      frame = shown.current === goal ? 0 : requestAnimationFrame(step);
    };
    const kick = () => {
      if (frame) return;
      last = 0;
      frame = requestAnimationFrame(step);
    };

    // A fresh layout (first paint, resize) starts where the page already is, without replaying.
    shown.current = target();
    draw(shown.current, false);

    // The wire fades in as the hero's sweep reaches the last tier (energy.css). Scrolling before
    // then starts the fade at once, so the energy is never moving unseen.
    const scroll = () => {
      for (const a of layer.getAnimations()) {
        const { delay = 0 } = a.effect!.getTiming();
        if (Number(a.currentTime ?? 0) < delay) a.currentTime = delay;
      }
      kick();
    };

    let listening = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !listening) window.addEventListener("scroll", scroll, { passive: true });
        else if (!entry.isIntersecting && listening) window.removeEventListener("scroll", scroll);
        listening = entry.isIntersecting;
        kick();
      },
      { rootMargin: "50% 0px" },
    );
    io.observe(layer);

    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      io.disconnect();
      window.removeEventListener("scroll", scroll);
    };
  }, [layout, reduce]);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="energy pointer-events-none absolute left-0 z-[1] w-full"
      style={{ top: layout?.top ?? 0, height: layout?.height ?? 0 }}
    >
      {layout ? (
        <svg
          width={layout.width}
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="block overflow-visible"
        >
          <defs>
            <radialGradient id="energy-halo">
              <stop offset="0" stopColor="var(--color-cobalt-600)" stopOpacity="0.32" />
              <stop offset="1" stopColor="var(--color-cobalt-600)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {layout.wire.segments.map((s, k) => (
            <g key={k}>
              <path className="energy-track" d={s.d} />
              <path className="energy-wire" d={s.d} pathLength={s.length} strokeDasharray={`${s.length} ${s.length}`} />
              {COMETS.map((c) => (
                <path
                  key={c.length}
                  className="energy-comet"
                  d={s.d}
                  pathLength={s.length}
                  strokeDasharray={`${c.length} ${s.length + c.length}`}
                  strokeWidth={c.length < 20 ? 2 : 1.5}
                />
              ))}
            </g>
          ))}
          {layout.wire.arrivals.map((a, i) => (
            <g key={i} className="energy-port" transform={`translate(${a.x} ${a.y})`}>
              <circle className="energy-ring" r="3" />
              <circle className="energy-dot" r="2.25" />
            </g>
          ))}
          <g className="energy-head" data-away="">
            <circle r="12" fill="url(#energy-halo)" />
            <circle className="energy-bead" r="2.25" />
          </g>
        </svg>
      ) : null}
    </div>
  );
}
