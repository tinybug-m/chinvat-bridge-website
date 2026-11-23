import "server-only";
import { randomBytes } from "node:crypto";
import {
  appOrigins,
  assertEnv,
  canonicalOrigin,
  deploymentOf,
  EnvConfigError,
  supabasePublicConfig,
  type AppOrigins,
  type Deployment,
} from "@/lib/env-rules";

/*
 * Typed, server-only access to the environment (rules in src/lib/env-rules.ts). Production
 * validates once at startup (src/instrumentation.ts) and every accessor here also fails with a
 * message that names the missing variable, never its value. Nothing in this module reaches the
 * browser.
 */

const source = process.env;

export function deployment(): Deployment {
  return deploymentOf(source);
}

export const isProduction = () => deployment() === "production";

/** Throws on incomplete configuration (src/instrumentation.ts runs the same check at startup). */
export function validateServerEnv(): void {
  assertEnv(source, "runtime");
}

function required(name: string): string {
  const value = source[name]?.trim();
  if (!value) throw new EnvConfigError([`${name} is not set`]);
  return value;
}

/** Canonical SEO origin (the .com). Never a Preview host. */
export function canonicalSiteOrigin(): string {
  return canonicalOrigin(source);
}

/** Redirect/auth origins for this deployment; null in development (use the request host). */
export function deploymentAppOrigins(): AppOrigins | null {
  return appOrigins(source);
}

export function supabaseConfig() {
  return supabasePublicConfig(source);
}

export function supabaseServiceRoleKey(): string {
  return required("SUPABASE_SERVICE_ROLE_KEY");
}

export function stripeSecretKey(): string {
  return required("STRIPE_SECRET_KEY");
}

export function stripeWebhookSecret(): string | null {
  return source.STRIPE_WEBHOOK_SECRET?.trim() || null;
}

let devRateLimitSecret: string | null = null;

/**
 * Key for the rate limiter's IP pseudonymisation. Production requires RATE_LIMIT_SECRET; there is
 * deliberately no fallback to another credential. Development and previews without one use a
 * random per-process key, so buckets simply reset on restart.
 */
export function rateLimitSecret(): string {
  const configured = source.RATE_LIMIT_SECRET?.trim();
  if (configured) return configured;
  if (isProduction()) throw new EnvConfigError(["RATE_LIMIT_SECRET is not set"]);
  devRateLimitSecret ??= randomBytes(32).toString("hex");
  return devRateLimitSecret;
}
