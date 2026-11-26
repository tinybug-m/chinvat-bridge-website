"use client";

import { MinimalChat } from "../minimal-chat/MinimalChat";

/*
 * The Windy Pup chat as this page uses it, in the "Bubbles" design. The three places (hero, corner,
 * contact) show one conversation: DuoHome holds the WindyChatProvider and reads the activity and mood
 * from it. In the hero and contact it has no background; in the corner it floats over the page, so it
 * gets a plain sheet of paper to stay readable.
 */
export function DuoChat({ place, onClose }: { place: "hero" | "corner" | "contact"; onClose?: () => void }) {
  return (
    <div data-duo-chat={place} style={{ display: "contents" }}>
      <MinimalChat floating={place === "corner"} onClose={onClose} />
    </div>
  );
}
