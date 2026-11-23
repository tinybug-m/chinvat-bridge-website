import "server-only";
import { headers } from "next/headers";
import { deploymentAppOrigins } from "@/lib/env";
import { resolveAppOrigin } from "@/lib/env-rules";

/**
 * Absolute origin to build redirect URLs from (Stripe success/cancel URLs, Supabase sign-in
 * links). This is the deployment's own origin, not the canonical SEO origin: production uses the
 * canonical .com, a Vercel Preview its Vercel-assigned host (rules: src/lib/env-rules.ts).
 *
 * Outside development the request's Host header is used only when it is one of this deployment's
 * own origins; trusting it otherwise would let anyone embed an attacker-controlled origin into a
 * real payment redirect or auth email. Locally there's no untrusted proxy in front of the dev
 * server, so deriving it from the request keeps `pnpm dev` working on whatever port it runs on.
 */
export async function getSiteOrigin(): Promise<string> {
  const headerList = await headers();
  const origins = deploymentAppOrigins();
  if (origins) {
    return origins.allowed.length > 1 ? resolveAppOrigin(origins, headerList.get("host")) : origins.primary;
  }

  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`;
}
