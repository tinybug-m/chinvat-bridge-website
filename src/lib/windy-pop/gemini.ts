// Streaming from Gemini via the official SDK. Failures become short codes (WindyError); the key and raw
// upstream text never leave this module.
import { GoogleGenAI } from "@google/genai";
import type { ChatMessage } from "./chat-schema";
import { WindyError, classifyError } from "./errors";

export const DEFAULT_MODEL = "gemini-3.6-flash"; // unverified: override with GEMINI_MODEL
export const OVERALL_TIMEOUT_MS = 25_000;
const MAX_OUTPUT_TOKENS = 1024;

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export async function* streamGemini(opts: {
  messages: ChatMessage[];
  systemPrompt: string;
  signal?: AbortSignal;
  timeoutMs?: number;
}): AsyncGenerator<string, void, void> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new WindyError("not_configured");

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, opts.timeoutMs ?? OVERALL_TIMEOUT_MS);
  const onClientAbort = () => controller.abort();
  if (opts.signal?.aborted) controller.abort();
  opts.signal?.addEventListener("abort", onClientAbort, { once: true });

  try {
    const baseUrl = process.env.GEMINI_API_BASE_URL?.trim(); // tests only: points at a local fake
    const ai = new GoogleGenAI({ apiKey, ...(baseUrl ? { httpOptions: { baseUrl } } : {}) });
    const stream = await ai.models.generateContentStream({
      model: process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL,
      contents: opts.messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
      config: { systemInstruction: opts.systemPrompt, maxOutputTokens: MAX_OUTPUT_TOKENS, temperature: 0.6, abortSignal: controller.signal },
    });

    let any = false;
    let finish: string | undefined;
    let blocked = false;
    for await (const chunk of stream) {
      if (chunk.promptFeedback?.blockReason) blocked = true;
      const reason = chunk.candidates?.[0]?.finishReason as string | undefined;
      if (reason) finish = reason;
      const text = chunk.candidates?.[0]?.content?.parts?.map((p) => (typeof p.text === "string" && !p.thought ? p.text : "")).join("") ?? "";
      if (text) {
        any = true;
        yield text;
      }
    }
    if (!any) {
      if (blocked || (finish && finish !== "STOP" && finish !== "MAX_TOKENS")) throw new WindyError("blocked");
      throw new WindyError("empty_response");
    }
    if (finish && finish !== "STOP" && finish !== "MAX_TOKENS") throw new WindyError("blocked");
  } catch (err) {
    if (opts.signal?.aborted && !timedOut) throw err; // client left: the caller ignores it
    throw new WindyError(classifyError(err, timedOut));
  } finally {
    clearTimeout(timer);
    opts.signal?.removeEventListener("abort", onClientAbort);
    controller.abort();
  }
}
