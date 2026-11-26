import type { WindyErrorCode } from "./chat-schema";

/** Carries only a code: never the upstream message, which could echo request details. */
export class WindyError extends Error {
  readonly code: WindyErrorCode;
  constructor(code: WindyErrorCode) {
    super(code);
    this.code = code;
  }
}

/** Maps anything thrown by the Gemini SDK or fetch to a safe code. `timedOut` is set by our own timer. */
export function classifyError(err: unknown, timedOut = false): WindyErrorCode {
  if (err instanceof WindyError) return err.code;
  if (timedOut) return "timeout";
  const e = err as { status?: unknown; name?: string; code?: unknown; cause?: { code?: unknown } } | null;
  if (typeof e?.status === "number") return e.status === 429 ? "rate_limited" : "upstream_error";
  if (e?.name === "AbortError" || e?.name === "TimeoutError") return "timeout";
  const c = String(e?.code ?? e?.cause?.code ?? "");
  if (/^(ECONNREFUSED|ECONNRESET|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|UND_ERR)/.test(c) || (e instanceof TypeError && /fetch failed/i.test(e.message))) return "network";
  return "upstream_error";
}
