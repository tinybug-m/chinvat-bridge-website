import { headers } from "next/headers";
import { SITE_URL } from "@/lib/constants";

/**
 * Absolute origin to build redirect URLs from (Stripe success/cancel URLs,
 * Supabase magic-link redirects). In production this must be the app's own
 * configured URL, not whatever Host header the request arrived with — trusting
 * that header would let anyone embed an attacker-controlled origin into a real
 * payment redirect or auth email. Locally there's no untrusted proxy in front
 * of the dev server, so deriving it from the request keeps `pnpm dev` working
 * against whatever port it's actually running on.
 */
export async function getSiteOrigin(): Promise<string> {
  if (process.env.NODE_ENV === "production") {
    return SITE_URL;
  }

  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`;
}
