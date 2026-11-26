"use client";

import { useEffect, type ReactNode } from "react";
import { CornerPanel } from "../duo/CornerPanel";
import { DuoDog } from "../duo/DuoDog";
import { DuoHome, useDuo } from "../duo/DuoHome";

/*
 * Wraps the whole of /windy-pup: one DuoHome for the hero (OpenHero) and the corner dog, who trots
 * out to the bottom corner on scroll and walks off when the contact section (its own dog, its own
 * DuoHome) arrives.
 */
export function PupHome({ chat, children }: { chat: boolean; children: ReactNode }) {
  return (
    <DuoHome chat={chat}>
      {children}
      <DuoDog where="corner" />
      <CornerPanel />
      <ContactHandOver />
    </DuoHome>
  );
}

/*
 * The contact section has its own dog. Registering it as this director's contact spot makes the
 * corner dog walk off as it arrives and come back as it leaves, so there is one dog on screen at a
 * time. The contact section's chat is a separate conversation.
 */
function ContactHandOver() {
  const { register } = useDuo();
  useEffect(() => {
    const contact = document.getElementById("contact");
    if (!contact) return;
    register("contact")(contact);
    return () => register("contact")(null);
  }, [register]);
  return null;
}
