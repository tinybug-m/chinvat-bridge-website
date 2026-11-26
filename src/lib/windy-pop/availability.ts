import "server-only";
import { hasGeminiKey } from "./gemini";
import { isLabEnabled } from "./limits";
import { hasOpenAiKey } from "./openai-compatible";

/** Whether the chat API will answer here: switched on, with a model key or the labelled mock. Pages offer the chat only then. */
export function isChatAvailable(): boolean {
  return isLabEnabled() && (process.env.WINDY_POP_MOCK === "1" || hasOpenAiKey() || hasGeminiKey());
}
