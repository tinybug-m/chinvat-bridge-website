"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DuoDog } from "../duo/DuoDog";
import { useDuo } from "../duo/DuoHome";
import { useStore } from "../duo/store";
import styles from "./contact.module.css";

export type ContactProps = {
  heading: string;
  lede: string;
  email: string;
  /** What to say before the address when JavaScript is off. */
  noscriptLead?: string;
  /** The dog's only stage on the page (it is not on a Duo homepage). */
  solo?: boolean;
  /** Whether Windy Pup's chat can answer here. */
  chat?: boolean;
};

/** The section the variants share: it registers with the dog's director and holds the dog's stage. */
export function ContactShell({ email, noscriptLead = "The form needs JavaScript. Email", solo, children }: Pick<ContactProps, "email" | "noscriptLead" | "solo"> & { children: ReactNode }) {
  const { register } = useDuo();
  return (
    <section ref={register("contact")} id="contact" aria-labelledby="contact-title" className="relative scroll-mt-20 overflow-x-clip bg-haze py-section">
      <DuoDog where="contact" solo={solo} />
      {/* The dog turns to colour as it crosses into the page's container. */}
      <div data-duo-colour="" className="mx-auto w-full max-w-page px-gutter">
        {children}
        <noscript>
          <p className="mt-6 text-small text-ink-soft">
            {noscriptLead} <a href={`mailto:${email}`}>{email}</a>.
          </p>
        </noscript>
      </div>
    </section>
  );
}

type Invite = { text: string; onClick: () => void };

const STILL = { box: null, mouth: null, arrived: false, moving: false };

/**
 * A card with the dog standing on its top edge; the dog looks at it while it is being used.
 * `invite` gives the dog a line to say: clicking the line or the dog itself takes it up. Without one,
 * clicking the dog puts the caret in the card's message line.
 */
export function PerchedCard({ children, className, invite, onDog }: { children: ReactNode; className?: string; invite?: Invite; onDog?: () => void }) {
  const { register, stage, cue, kick } = useDuo();
  const card = useRef<HTMLDivElement | null>(null);
  const anchor = register("contactChat");
  return (
    <div className={cn("relative mt-20 lg:mt-12", className)}>
      <div
        ref={register("slot")}
        className={styles.perch}
        data-duo-frame=""
        data-fallback={stage === "fallback" || undefined}
        aria-hidden="true"
        onPointerEnter={() => cue("wag")}
        onClick={() => {
          cue("wag");
          if (onDog) onDog();
          else card.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- only without WebGL: the dog sitting, in ink */}
        <img className={styles.poster} src="/windy-pop/duo/ink.webp" alt="" loading="lazy" decoding="async" />
      </div>
      {invite ? <DogLine {...invite} /> : null}
      <div
        ref={(el) => {
          card.current = el;
          anchor(el);
        }}
        onFocus={() => kick(600)}
        className="rounded-xl border border-line bg-paper-raised shadow-[0_28px_60px_-40px_rgb(11_26_38/0.4)]"
      >
        {children}
      </div>
    </div>
  );
}

/** The dog's line, as in the hero: a bubble whose tail ends at its mouth, shown once it has settled. */
function DogLine({ text, onClick }: Invite) {
  const { spot, stage, head, out, cue } = useDuo();
  const { moving } = useStore(out, STILL);
  const [el, setEl] = useState<HTMLButtonElement | null>(null);
  const [settled, setSettled] = useState(false);
  // True once the mouth is really at the perch: the dog can be "still" before it has even set off.
  const [near, setNear] = useState(false);
  const here = spot === "contact" && !moving;
  // A short wait: on arrival the stores still hold the corner dog's last position.
  useEffect(() => {
    if (!here) return;
    const t = setTimeout(() => setSettled(true), 900);
    return () => {
      clearTimeout(t);
      setSettled(false);
    };
  }, [here]);
  useEffect(() => {
    const wrap = el?.parentElement;
    if (!el || !wrap || !settled) return;
    const follow = () => {
      const at = head.get();
      if (!at || out.get().moving) return;
      const r = wrap.getBoundingClientRect();
      const perch = wrap.querySelector("[data-duo-frame]")?.getBoundingClientRect();
      const inside = !!perch && at.x > perch.left && at.x < perch.right && at.y > perch.top - 24 && at.y < perch.bottom;
      setNear(inside);
      if (!inside) return;
      el.style.setProperty("--mx", `${(at.x - r.left).toFixed(1)}px`);
      el.style.setProperty("--my", `${(at.y - r.top).toFixed(1)}px`);
    };
    follow();
    return head.subscribe(follow);
  }, [el, settled, head, out]);
  return (
    <button ref={setEl} type="button" className={styles.line} data-show={(settled && near) || stage === "fallback" || undefined} onPointerEnter={() => cue("wag")} onClick={onClick}>
      {text}
    </button>
  );
}

/** The address as a link, with a copy button for people whose mail link opens the wrong thing. */
export function EmailLine({ email, className }: { email: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2400);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1", className)}>
      <a href={`mailto:${email}`} className="inline-flex min-h-11 items-center text-body font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
        {email}
      </a>
      <button
        type="button"
        className="min-h-11 rounded-[2px] px-3 text-small text-ink-soft shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:text-ink hover:shadow-[inset_0_0_0_1px_var(--color-ink)]"
        onClick={() => navigator.clipboard?.writeText(email).then(() => setCopied(true), () => {})}
      >
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        <span className="sr-only"> email address</span>
      </button>
    </div>
  );
}
