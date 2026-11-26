// Streaming from any OpenAI-compatible chat completions API (Groq by default; also OpenRouter, Mistral,
// Cerebras...). Same contract as gemini.ts: failures become short codes, the key never leaves this module.
import type { ChatMessage } from "./chat-schema";
import { WindyError, classifyError } from "./errors";

export const DEFAULT_BASE_URL = "https://api.groq.com/openai/v1";
export const DEFAULT_MODEL = "openai/gpt-oss-120b"; // Groq's free tier; override with LLM_MODEL
const OVERALL_TIMEOUT_MS = 25_000;
const MAX_OUTPUT_TOKENS = 1024;

export function hasOpenAiKey(): boolean {
  return Boolean(process.env.LLM_API_KEY?.trim());
}

/** A short label for the disclaimer: the provider's host, e.g. "Groq". */
export function providerLabel(): string {
  const host = new URL(process.env.LLM_BASE_URL?.trim() || DEFAULT_BASE_URL).hostname;
  const known: Record<string, string> = { "api.groq.com": "Groq", "openrouter.ai": "OpenRouter", "api.mistral.ai": "Mistral", "api.cerebras.ai": "Cerebras" };
  return known[host] ?? host;
}

export async function* streamOpenAi(opts: {
  messages: ChatMessage[];
  systemPrompt: string;
  signal?: AbortSignal;
  timeoutMs?: number;
}): AsyncGenerator<string, void, void> {
  const apiKey = process.env.LLM_API_KEY?.trim();
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
    const base = (process.env.LLM_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, "");
    const model = process.env.LLM_MODEL?.trim() || DEFAULT_MODEL;
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        // gpt-oss reasons before it answers; a short think keeps the first word quick and inside the token budget.
        ...(/gpt-oss/i.test(model) ? { reasoning_effort: "low" } : {}),
        messages: [{ role: "system", content: opts.systemPrompt }, ...opts.messages.map((m) => ({ role: m.role, content: m.content }))],
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0.6,
        stream: true,
      }),
      signal: controller.signal,
    });
    if (!response.ok || !response.body) throw Object.assign(new Error("upstream"), { status: response.status });

    const decoder = new TextDecoder();
    const reader = response.body.getReader();
    let buffer = "";
    let any = false;
    let finish: string | undefined;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") continue;
        let chunk: { choices?: { delta?: { content?: string | null }; finish_reason?: string | null }[] };
        try {
          chunk = JSON.parse(data);
        } catch {
          continue;
        }
        const choice = chunk.choices?.[0];
        if (choice?.finish_reason) finish = choice.finish_reason;
        const text = choice?.delta?.content;
        if (text) {
          any = true;
          yield text;
        }
      }
    }
    if (finish === "content_filter") throw new WindyError("blocked");
    if (!any) throw new WindyError("empty_response");
  } catch (err) {
    if (opts.signal?.aborted && !timedOut) throw err; // client left: the caller ignores it
    throw new WindyError(classifyError(err, timedOut));
  } finally {
    clearTimeout(timer);
    opts.signal?.removeEventListener("abort", onClientAbort);
    controller.abort();
  }
}
