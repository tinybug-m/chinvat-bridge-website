// Shared by the Windy Pup chat client and route. No server-only import: the browser uses the limits too.
import { z } from "zod";

export const MAX_MESSAGE_CHARS = 1500;
export const MAX_MESSAGES = 16;
export const MAX_TOTAL_CHARS = 9000;
export const MAX_BODY_BYTES = 40 * 1024;

/** NDJSON events, one JSON object per line. */
export const EVENT_DELTA = "delta" as const;
export const EVENT_DONE = "done" as const;
export const EVENT_ERROR = "error" as const;
export const EVENT_MOOD = "mood" as const;

/** How the model says it feels about its reply: the dog's face and body follow. */
export const MOODS = ["neutral", "happy", "curious", "sorry", "excited"] as const;
export type Mood = (typeof MOODS)[number];

export const ERROR_CODES = ["not_configured", "rate_limited", "timeout", "blocked", "empty_response", "upstream_error", "network"] as const;
export type WindyErrorCode = (typeof ERROR_CODES)[number];

/** `mood` always arrives once, before the first `delta`. */
export type WindyEvent =
  | { t: typeof EVENT_MOOD; mood: Mood }
  | { t: typeof EVENT_DELTA; text: string }
  | { t: typeof EVENT_DONE }
  | { t: typeof EVENT_ERROR; code: WindyErrorCode };

export type ChatMessage = { role: "user" | "assistant"; content: string };

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(MAX_MESSAGE_CHARS).refine((s) => s.trim().length > 0, "empty message"),
});

/** Parses and normalises: trims oldest messages past the count and character limits, keeps the last user message. */
export const chatRequestSchema = z
  .object({ messages: z.array(messageSchema).min(1).max(200) })
  .transform((v, ctx) => {
    const msgs = v.messages.map((m) => ({ role: m.role, content: m.content.trim() }));
    if (msgs[msgs.length - 1].role !== "user") {
      ctx.addIssue({ code: "custom", message: "last message must be from the user" });
      return z.NEVER;
    }
    return { messages: trimMessages(msgs) };
  });

export function trimMessages(msgs: ChatMessage[]): ChatMessage[] {
  let out = msgs.slice(-MAX_MESSAGES);
  const total = () => out.reduce((n, m) => n + m.content.length, 0);
  while (out.length > 1 && total() > MAX_TOTAL_CHARS) out = out.slice(1);
  // The conversation should open with a user turn.
  while (out.length > 1 && out[0].role !== "user") out = out.slice(1);
  return out;
}
