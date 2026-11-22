/*
 * The client's IP address for rate limiting. Pure (no imports) so tests run it directly.
 *
 * Only headers set by the hosting edge are trusted. On Vercel (VERCEL=1) the edge overwrites
 * X-Forwarded-For and sets x-vercel-forwarded-for / x-real-ip to the same client address, so a
 * visitor cannot choose their own (https://vercel.com/docs/headers/request-headers). Anywhere
 * else in production no proxy is known, so forwarding headers are ignored and every request
 * shares one bucket: stricter, never spoofable. Development uses one local bucket.
 */
const IP_PATTERN = /^[0-9a-fA-F:.]{2,45}$/;

function firstAddress(value: string | null): string | null {
  const first = value?.split(",")[0]?.trim();
  return first && IP_PATTERN.test(first) ? first : null;
}

export function clientAddress(get: (name: string) => string | null, env: { VERCEL?: string; NODE_ENV?: string }): string {
  if (env.VERCEL === "1") {
    return (
      firstAddress(get("x-vercel-forwarded-for")) ?? firstAddress(get("x-real-ip")) ?? firstAddress(get("x-forwarded-for")) ?? "unknown"
    );
  }
  return env.NODE_ENV === "production" ? "unknown" : "local";
}
