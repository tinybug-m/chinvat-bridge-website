// The mood tag. The model is asked to open each reply with `[mood:happy]`. Providers stream text in
// arbitrary chunks, so the tag may arrive split ("[mo", "od:ha", "ppy] Hello"). One filter, used by the
// route for every provider (and the mock), removes it and reports the mood. Pure: no I/O.
import { MOODS, type Mood } from "./chat-schema";

/** How much text may sit between `[` and `]` before it is clearly not a tag. */
const MAX_TAG = 28;
const TAG = /^\s*\[\s*mood\s*:\s*([^\]\n]{0,16}?)\s*\]\s*/i;
/** What the start of a reply may look like while it could still turn into a tag. */
const PREFIX = /^\s*(?:\[\s*(?:m(?:o(?:o(?:d(?:\s*(?::[^\]\n]*)?)?)?)?)?)?)?$/i;

export const isMood = (value: string): value is Mood => (MOODS as readonly string[]).includes(value);

/** A mood name from a tag, or "neutral" when it is not one of ours. */
export function parseMood(name: string): Mood {
  const n = name.trim().toLowerCase();
  return isMood(n) ? n : "neutral";
}

export type MoodStep = { mood?: Mood; text: string };

export type MoodFilter = {
  /** Feed a chunk. `mood` is set once, on the first step that decides it (always before any text). */
  push(chunk: string): MoodStep;
  /** The stream ended: releases anything held back. Decides "neutral" if nothing decided yet. */
  end(): MoodStep;
};

/**
 * Only a tag at the very start of the reply (after whitespace) is removed. A `[mood:x]` anywhere else is
 * the model's own text and is left alone. Missing or unknown moods become "neutral"; the tag is still hidden.
 */
export function createMoodFilter(): MoodFilter {
  let held = "";
  let decided = false;
  /** After a removed tag, the space or line break that followed it may arrive in a later chunk. */
  let trimLead = false;

  const decide = (text: string): MoodStep => {
    decided = true;
    held = "";
    return { mood: "neutral", text };
  };

  return {
    push(chunk) {
      if (decided) {
        if (!trimLead) return { text: chunk };
        const text = chunk.replace(/^\s+/, "");
        if (text) trimLead = false;
        return { text };
      }
      held += chunk;
      const tag = TAG.exec(held);
      if (tag) {
        const rest = held.slice(tag[0].length);
        decided = true;
        held = "";
        trimLead = !rest;
        return { mood: parseMood(tag[1]), text: rest };
      }
      // Still possibly a tag: wait for more, up to a sensible length.
      if (held.length <= MAX_TAG && PREFIX.test(held)) return { text: "" };
      return decide(held);
    },
    end() {
      if (decided) return { text: "" };
      return decide(held);
    },
  };
}

export type MoodEvent = { kind: "mood"; mood: Mood } | { kind: "text"; text: string };

/** The same filter over a whole stream: yields one mood event, then the text with the tag removed. */
export async function* withMood(source: AsyncIterable<string>): AsyncGenerator<MoodEvent, void, void> {
  const filter = createMoodFilter();
  let announced = false;
  const out = function* (step: MoodStep): Generator<MoodEvent> {
    if (step.mood && !announced) {
      announced = true;
      yield { kind: "mood", mood: step.mood };
    }
    if (step.text) yield { kind: "text", text: step.text };
  };
  for await (const chunk of source) yield* out(filter.push(chunk));
  yield* out(filter.end());
}
