"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ButtonLink } from "@/components/system/Button";
import { Container } from "@/components/system/Container";
import { DuoChat } from "./DuoChat";
import { useDuo, type DogOut } from "./DuoHome";
import { useStore } from "./store";
import { DuoDog } from "./DuoDog";
import styles from "./duo.module.css";

export type DuoHeroContent = {
  eyebrow: string;
  titleLines: readonly string[];
  lede: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

/*
 * The hero: the copy on one side, the window on the other. The window is a sheet of tinted paper
 * with a hairline frame and corner marks; inside it the dog is in its own colours (the page's one
 * stage draws it there, see DuoDog), outside it the dog is drawn in ink. Its "Need anything?" comes from
 * its mouth. Clicking the dog (anywhere in the window) or the line swaps the copy for the chat, and
 * Back (or Escape) swaps it back.
 */
export function DuoHero({ content }: { content: DuoHeroContent }) {
  const duo = useDuo();
  const { heroChat, register, spot, stage } = duo;
  const [everChat, setEverChat] = useState(false);
  if (heroChat && !everChat) setEverChat(true);
  const bubble = useRef<HTMLButtonElement>(null);
  const home = spot === "hero";
  // The line appears a beat after the dog is drawn (or straight away without 3D).
  const [ask, setAsk] = useState(false);
  useEffect(() => {
    if (stage !== "live" && stage !== "fallback") return;
    const t = setTimeout(() => setAsk(true), stage === "live" ? 700 : 200);
    return () => clearTimeout(t);
  }, [stage]);

  const open = (from: HTMLElement | null) => duo.openHeroChat(from);

  return (
    <section ref={register("hero")} data-hero aria-labelledby="hero-title" className={styles.hero} data-chat={heroChat || undefined}>
      <Container className={styles.heroContainer}>
        <div className={styles.heroGrid}>
          <div className={styles.heroHead} inert={heroChat || undefined}>
            <p className="intro-rise text-small text-ink-muted">{content.eyebrow}</p>
            <h1 id="hero-title" className={`${styles.title} intro-rise font-display`}>
              <span className="block font-normal">{content.titleLines[0]}</span>{" "}
              <span className="block font-semibold">{content.titleLines[1]}</span>
            </h1>
          </div>

          <div className={styles.heroBelow} inert={heroChat || undefined}>
            <p className={`${styles.lede} intro-rise text-pretty text-ink-soft`} style={{ "--intro-delay": "120ms" } as CSSProperties}>
              {content.lede}
            </p>
            <div className={`${styles.actions} intro-rise`} style={{ "--intro-delay": "200ms" } as CSSProperties}>
              <ButtonLink href={content.primaryCta.href} size="lg" arrow="right" className="w-full sm:w-auto">
                {content.primaryCta.label}
              </ButtonLink>
              <ButtonLink href={content.secondaryCta.href} size="lg" variant="secondary" arrow="down" className="w-full sm:w-auto">
                {content.secondaryCta.label}
              </ButtonLink>
            </div>
          </div>

          <div
            className={styles.heroChat}
            inert={!heroChat || undefined}
            aria-hidden={!heroChat || undefined}
            onKeyDown={(event) => {
              // Escape goes back to the copy, as Back does (unless something inside used it, such as a menu).
              if (event.key === "Escape" && !event.defaultPrevented) duo.closeHeroChat();
            }}
          >
            {everChat ? (
              <div ref={register("heroChat")} className={styles.heroChatBody}>
                <DuoChat place="hero" onClose={duo.closeHeroChat} />
              </div>
            ) : null}
          </div>

          <div
            ref={register("window")}
            data-duo-frame=""
            className={styles.window}
            data-home={home || undefined}
            data-fallback={stage === "fallback" || undefined}
            data-live={stage === "live" || undefined}
            style={duo.chat ? undefined : { cursor: "auto" }}
            onClick={(event) => {
              if (!home || heroChat) return;
              // The bubble handles its own click; anywhere else in the window opens the chat too.
              if ((event.target as HTMLElement).closest("button")) return;
              open(bubble.current);
            }}
            onPointerEnter={() => home && !heroChat && duo.cue("wag")}
          >
            <span className={styles.windowGround} aria-hidden="true" />
            {(["tl", "tr", "bl", "br"] as const).map((at) => (
              <span key={at} className={styles.corner} data-at={at} aria-hidden="true" />
            ))}
            <p className={styles.caption} data-at="left" aria-hidden="true">
              Windy Pup
            </p>
            <p className={styles.caption} data-at="right" aria-hidden="true">
              AI assistant
            </p>
            {/* Only without WebGL: the dog as a still (with WebGL it walks in from outside). */}
            {/* eslint-disable-next-line @next/next/no-img-element -- a still sized by CSS; Next's image would add nothing here */}
            {stage === "fallback" ? <img className={styles.windowPoster} src="/windy-pop/duo/window.webp" alt="" decoding="async" /> : null}
            <p className="sr-only">Windy Pup, Chinvat Bridge’s AI assistant: a small dog drawn in fine coloured lines and points.</p>
            <Bubble
              ref={bubble}
              show={duo.chat && ask && home && !heroChat}
              onOpen={() => open(bubble.current)}
            />
          </div>

          {/* Where the energy wire into Services starts (EnergyFlow). */}
          <span aria-hidden="true" data-energy-origin="" className={styles.origin} />
        </div>
      </Container>
      <DuoDog where="hero" />
    </section>
  );
}

const NO_OUT: DogOut = { box: null, mouth: null, arrived: false, moving: false };

/**
 * "Need anything?": a speech bubble whose tail ends at the dog's mouth and rides with it as the head
 * moves (written straight to the element, so the page never re-renders for it). Until the scene says
 * where the mouth is (or without WebGL), it sits where the still's mouth is.
 */
function Bubble({ ref, show: wanted, onOpen }: { ref: React.Ref<HTMLButtonElement>; show: boolean; onOpen: () => void }) {
  const { out, head, stage } = useDuo();
  const o = useStore(out, NO_OUT);
  // It speaks once it stands in the window, never while it is on its way in.
  const show = wanted && (stage === "fallback" || (o.arrived && !o.moving));
  const [el, setEl] = useState<HTMLButtonElement | null>(null);
  const moving = useRef(o.moving);
  useEffect(() => {
    moving.current = o.moving;
  }, [o.moving]);
  useEffect(() => {
    const win = el?.offsetParent as HTMLElement | null;
    if (!el || !win) return;
    const follow = () => {
      const at = head.get();
      // While it walks the bubble is hidden: it keeps its last place rather than chasing the trot.
      if (!at || moving.current) return;
      const r = win.getBoundingClientRect();
      const x = at.x - r.left;
      const y = at.y - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) return;
      el.style.setProperty("--mx", `${x.toFixed(1)}px`);
      el.style.setProperty("--my", `${y.toFixed(1)}px`);
    };
    follow();
    return head.subscribe(follow);
  }, [el, head]);
  const setRef = (node: HTMLButtonElement | null) => {
    setEl(node);
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.RefObject<HTMLButtonElement | null>).current = node;
  };

  return (
    <button
      ref={setRef}
      type="button"
      className={styles.bubble}
      data-show={show || undefined}
      tabIndex={show ? undefined : -1}
      aria-hidden={show ? undefined : true}
      onClick={onOpen}
    >
      <span className={styles.bubbleText}>Need anything?</span>
      <span className="sr-only"> Chat with Windy Pup, our AI assistant</span>
    </button>
  );
}
