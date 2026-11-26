"use client";

import { useEffect, useState } from "react";
import { DuoChat } from "./DuoChat";
import { useDuo } from "./DuoHome";
import styles from "./duo.module.css";

/*
 * The compact chat the corner dog opens. On a wide screen it stands just left of the dog, at the
 * bottom of the viewport, so the dog keeps listening beside it; on a phone it is a sheet along the
 * bottom with the dog sitting on its top edge. It is not modal: the page stays readable and
 * scrollable; Escape or the close button put it away and the focus goes back to the dog.
 */
export function CornerPanel() {
  const { panel, closePanel, register, kick } = useDuo();
  // Mounted on first use, then kept (closed and inert), so it opens instantly the next time.
  const [ever, setEver] = useState(false);
  if (panel && !ever) setEver(true);

  // Opening puts the caret in the message line with a mouse and keyboard; on touch it would throw up
  // the keyboard over the page, so the focus goes to the panel itself.
  useEffect(() => {
    if (!panel) return;
    const frame = requestAnimationFrame(() => {
      const root = document.getElementById("duo-panel");
      const field = root?.querySelector<HTMLTextAreaElement>("textarea");
      if (field && window.matchMedia("(pointer: fine)").matches) field.focus({ preventScroll: true });
      else root?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [panel]);

  useEffect(() => {
    if (!panel) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      closePanel();
      requestAnimationFrame(() => document.querySelector<HTMLElement>(`.${styles.hit}`)?.focus({ preventScroll: true }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, closePanel]);

  if (!ever) return null;
  return (
    <div
      ref={register("panel")}
      id="duo-panel"
      role="dialog"
      aria-modal="false"
      aria-label="Chat with Windy Pup"
      tabIndex={-1}
      className={styles.panel}
      data-open={panel || undefined}
      inert={!panel || undefined}
      onTransitionEnd={() => kick(100)}
    >
      <DuoChat place="corner" onClose={closePanel} />
    </div>
  );
}
