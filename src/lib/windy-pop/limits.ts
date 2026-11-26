// In-memory sliding-window limiter for the lab only. One process, resets on restart; deliberately not the Supabase limiter.
const PER_MINUTE = 10;
const PER_HOUR = 60;
const MAX_KEYS = 2000;

const hits = new Map<string, number[]>();

export function isLabEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.WINDY_POP_LAB_ENABLED === "1";
}

export function clientKey(get: (name: string) => string | null): string {
  const xff = get("x-forwarded-for")?.split(",")[0]?.trim();
  const raw = xff || get("x-real-ip")?.trim() || "local";
  return raw.slice(0, 64);
}

export type LimitResult = { ok: true } | { ok: false; retryAfter: number };

export function checkLimit(key: string, now = Date.now()): LimitResult {
  const list = (hits.get(key) ?? []).filter((t) => now - t < 3_600_000);
  const lastMinute = list.filter((t) => now - t < 60_000);
  if (lastMinute.length >= PER_MINUTE) return { ok: false, retryAfter: Math.max(1, Math.ceil((lastMinute[0] + 60_000 - now) / 1000)) };
  if (list.length >= PER_HOUR) return { ok: false, retryAfter: Math.max(1, Math.ceil((list[0] + 3_600_000 - now) / 1000)) };
  list.push(now);
  hits.delete(key);
  hits.set(key, list);
  while (hits.size > MAX_KEYS) hits.delete(hits.keys().next().value as string);
  return { ok: true };
}

export function resetLimits(): void {
  hits.clear();
}
