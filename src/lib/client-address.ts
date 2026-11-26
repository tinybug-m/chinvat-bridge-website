/*
 * The client's IP address for rate limiting. Pure (no imports) so tests run it directly.
 *
 * Only headers set by the hosting edge are trusted. On Vercel (VERCEL=1) the edge overwrites
 * X-Forwarded-For and sets x-vercel-forwarded-for / x-real-ip to the same client address, so a
 * visitor cannot choose their own (https://vercel.com/docs/headers/request-headers). Anywhere
 * else in production no proxy is known, so forwarding headers are ignored and every request
 * shares one bucket: stricter, never spoofable. Development uses one local bucket.
 *
 * IPv6 clients are keyed on their /64 (rateLimitKey), the unit an ISP hands one connection.
 *
 * RATE_LIMIT_TRUST_FORWARDED_FOR=1 is for the e2e servers only (pnpm start:e2e / dev:e2e), whose
 * tests give each case its own X-Forwarded-For address. It makes the header spoofable, so it is
 * ignored on Vercel (which always uses its own edge headers) and must never be set elsewhere.
 */
const IP_PATTERN = /^[0-9a-fA-F:.]{2,45}$/;

/**
 * One rate-limit key per IPv6 /64: a single connection is routinely given a whole /64, so keying on
 * the full address would let a client rotate through 2^64 buckets. IPv4 (also IPv4-mapped IPv6) is
 * kept as is. Null when the text is not an address.
 */
export function rateLimitKey(address: string): string | null {
  if (!IP_PATTERN.test(address)) return null;
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(address);
  if (mapped) return mapped[1];
  if (!address.includes(":")) return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(address) ? address : null;
  const halves = address.toLowerCase().split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 1 ? missing !== 0 : missing < 1) return null;
  const groups = [...head, ...Array<string>(halves.length === 2 ? missing : 0).fill("0"), ...tail];
  if (!groups.every((g) => /^[0-9a-f]{1,4}$/.test(g))) return null;
  return `${groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, "")).join(":")}::/64`;
}

function firstAddress(value: string | null): string | null {
  const first = value?.split(",")[0]?.trim();
  return first ? rateLimitKey(first) : null;
}

export function clientAddress(
  get: (name: string) => string | null,
  env: { VERCEL?: string; NODE_ENV?: string; RATE_LIMIT_TRUST_FORWARDED_FOR?: string },
): string {
  if (env.VERCEL === "1") {
    return (
      firstAddress(get("x-vercel-forwarded-for")) ?? firstAddress(get("x-real-ip")) ?? firstAddress(get("x-forwarded-for")) ?? "unknown"
    );
  }
  if (env.RATE_LIMIT_TRUST_FORWARDED_FOR === "1") {
    const forwarded = firstAddress(get("x-forwarded-for"));
    if (forwarded) return forwarded;
  }
  return env.NODE_ENV === "production" ? "unknown" : "local";
}
