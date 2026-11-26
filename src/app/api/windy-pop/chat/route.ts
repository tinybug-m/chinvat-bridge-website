import "server-only";
import { getSiteChrome } from "@/lib/content/read";
import { EVENT_DELTA, EVENT_DONE, EVENT_ERROR, EVENT_MOOD, MAX_BODY_BYTES, chatRequestSchema, type WindyEvent } from "@/lib/windy-pop/chat-schema";
import { classifyError } from "@/lib/windy-pop/errors";
import { hasGeminiKey, streamGemini } from "@/lib/windy-pop/gemini";
import { checkLimit, clientKey, isLabEnabled } from "@/lib/windy-pop/limits";
import { mockStream } from "@/lib/windy-pop/mock";
import { withMood } from "@/lib/windy-pop/mood";
import { hasOpenAiKey, providerLabel, streamOpenAi } from "@/lib/windy-pop/openai-compatible";
import { FALLBACK_PROMPT, buildSystemPrompt } from "@/lib/windy-pop/prompt";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const mockOn = () => process.env.WINDY_POP_MOCK === "1";
/* An OpenAI-compatible key (LLM_API_KEY, Groq by default) wins over Gemini when both are set. */
const live = () => (hasOpenAiKey() ? { label: providerLabel(), stream: streamOpenAi } : hasGeminiKey() ? { label: "Google Gemini", stream: streamGemini } : null);

function json(body: unknown, status: number, headers?: Record<string, string>) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}
const err = (code: string, status: number, message?: string, headers?: Record<string, string>) =>
  json({ error: { code, ...(message ? { message } : {}) } }, status, headers);

export async function GET() {
  if (!isLabEnabled()) return new Response(null, { status: 404 });
  const provider = live();
  return json({ mode: mockOn() ? "mock" : provider ? "live" : "unconfigured", provider: provider?.label, lab: true }, 200);
}

export async function POST(request: Request) {
  if (!isLabEnabled()) return new Response(null, { status: 404 });
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return err("unsupported_media_type", 415);
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return err("payload_too_large", 413);
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return err("payload_too_large", 413);

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return err("invalid_request", 400, "Body must be valid JSON.");
  }
  const parsed = chatRequestSchema.safeParse(parsedJson);
  if (!parsed.success) return err("invalid_request", 400, "Messages did not match the expected shape or limits.");

  const mock = mockOn();
  const provider = live();
  if (!mock && !provider) return err("not_configured", 503, "Windy Pup has no model key in this environment.");

  const limit = checkLimit(clientKey((n) => request.headers.get(n)));
  if (!limit.ok) return err("rate_limited", 429, undefined, { "Retry-After": String(limit.retryAfter) });

  const { messages } = parsed.data;
  let systemPrompt = FALLBACK_PROMPT;
  if (!mock) {
    try {
      systemPrompt = buildSystemPrompt(await getSiteChrome());
    } catch {
      console.error("[windy-pop] site content unavailable, using fallback prompt");
    }
  }

  const source = mock
    ? mockStream(messages[messages.length - 1].content, request.signal)
    : provider!.stream({ messages, systemPrompt, signal: request.signal });
  const encoder = new TextEncoder();
  const line = (e: WindyEvent) => encoder.encode(`${JSON.stringify(e)}\n`);
  // One place strips the mood tag for every provider; the client sees a `mood` event, then clean text.
  const iterator = withMood(source)[Symbol.asyncIterator]();
  let sentText = false;

  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        // Keep reading until something is sent: a chunk can be empty once the tag is gone, and a pull
        // that sends nothing would never be called again.
        for (;;) {
          const { value, done } = await iterator.next();
          if (done) {
            // A reply that was only a tag is no reply.
            controller.enqueue(line(sentText ? { t: EVENT_DONE } : { t: EVENT_ERROR, code: "empty_response" }));
            controller.close();
            return;
          }
          if (value.kind === "mood") {
            controller.enqueue(line({ t: EVENT_MOOD, mood: value.mood }));
            return;
          }
          // The model sometimes opens with a blank line after the tag.
          const text = sentText ? value.text : value.text.replace(/^\s+/, "");
          if (text) {
            sentText = true;
            controller.enqueue(line({ t: EVENT_DELTA, text }));
            return;
          }
        }
      } catch (e) {
        if (request.signal.aborted) {
          controller.close();
          return;
        }
        const code = classifyError(e);
        console.error(`[windy-pop] model failed: ${code}`);
        controller.enqueue(line({ t: EVENT_ERROR, code }));
        controller.close();
      }
    },
    async cancel() {
      await iterator.return?.(undefined);
    },
  });

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
      "x-windy-pop-mode": mock ? "mock" : "live",
    },
  });
}
