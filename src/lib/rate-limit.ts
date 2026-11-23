import "server-only";
import { createHmac } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimitSecret } from "@/lib/env";

/*
 * Shared rate limiting through Supabase (migration 20261122121000_rate_limit_buckets.sql): one
 * atomic database function call per window, so the limit holds across every Vercel instance.
 * Bucket keys are an HMAC of the address keyed by a server secret, so the table never holds an
 * IP address and a leaked table cannot be reversed by hashing all IPv4 addresses. The key is the
 * dedicated RATE_LIMIT_SECRET (required in production, checked at startup by src/instrumentation.ts);
 * it never falls back to another credential.
 */

export interface RateWindow {
  name: string;
  limit: number;
  windowSeconds: number;
}

function bucketKey(scope: string, window: RateWindow, address: string): string {
  const secret = rateLimitSecret();
  const digest = createHmac("sha256", secret).update(`rate-limit:v1:${scope}:${address}`).digest("hex").slice(0, 40);
  return `${scope}:${window.name}:${digest}`;
}

/** In-process fallback, used only when the shared store cannot be reached. */
const local = new Map<string, number[]>();
function localLimited(key: string, window: RateWindow): boolean {
  const now = Date.now();
  const hits = (local.get(key) ?? []).filter((at) => now - at < window.windowSeconds * 1000);
  if (local.size > 5000) local.clear();
  local.set(key, [...hits, now]);
  return hits.length >= window.limit;
}

/**
 * Counts this request in every window; true when any window is over its limit. If the shared
 * store fails (e.g. the migration is not applied yet) it falls back to a per-instance limit, so a
 * database hiccup degrades the protection instead of blocking real customers.
 */
export async function isRateLimited(scope: string, address: string, windows: RateWindow[]): Promise<boolean> {
  let limited = false;
  for (const window of windows) {
    const key = bucketKey(scope, window, address);
    try {
      const { data, error } = await createAdminClient().rpc("consume_rate_limit", {
        p_bucket: key,
        p_limit: window.limit,
        p_window_seconds: window.windowSeconds,
      });
      if (error) throw error;
      if (data === false) limited = true;
    } catch {
      console.error(`[rate-limit] shared store unavailable for ${scope}; using the per-instance limit`);
      if (localLimited(key, window)) limited = true;
    }
  }
  return limited;
}
