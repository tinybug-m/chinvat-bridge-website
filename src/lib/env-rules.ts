/*
 * Environment rules: which variables each deployment needs, and which origins it may use. Pure (no
 * imports, no process access), so tests pass in a plain object; src/lib/env.ts applies it to
 * process.env on the server, and src/proxy.ts uses it for the Supabase pair.
 *
 * Two origins, never mixed:
 *  - The canonical origin (NEXT_PUBLIC_SITE_URL, the .com) is for SEO: canonical links, Open Graph,
 *    structured data, the sitemap and robots.txt. It is the same in every deployment.
 *  - The app origin is where this deployment receives redirects: Stripe success/cancel URLs and
 *    Supabase sign-in links. Production uses the canonical origin; a Vercel Preview uses its own
 *    Vercel-assigned host (VERCEL_BRANCH_URL / VERCEL_URL, set by the platform, not by the request).
 *
 * Messages name variables, never their values.
 */

export type EnvSource = Readonly<Record<string, string | undefined>>;

export type Deployment = "production" | "preview" | "development";

export const DEFAULT_SITE_URL = "https://www.chinvatbridge.com";

/** Shortest acceptable RATE_LIMIT_SECRET: 32 characters (e.g. `openssl rand -hex 32` gives 64). */
export const MIN_RATE_LIMIT_SECRET_LENGTH = 32;

/** Needed by every server deployment, and by the build (pricing is read at build time). */
export const SUPABASE_PUBLIC_VARS = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;

/** Needed at runtime in production. Anything missing stops the server from starting. */
export const PRODUCTION_REQUIRED_VARS = [
  ...SUPABASE_PUBLIC_VARS,
  "NEXT_PUBLIC_SITE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RATE_LIMIT_SECRET",
] as const;

/** Optional: features degrade (the contact form answers "unavailable") rather than fail. */
export const PRODUCTION_OPTIONAL_VARS = ["GMAIL_USER", "GMAIL_APP_PASSWORD"] as const;

function present(source: EnvSource, name: string): string | undefined {
  const value = source[name]?.trim();
  return value ? value : undefined;
}

/**
 * Production means a live deployment: Vercel's production environment, or `next start` anywhere
 * else. A Vercel Preview runs with NODE_ENV=production but is not production.
 */
export function deploymentOf(source: EnvSource): Deployment {
  const vercelEnv = present(source, "VERCEL_ENV");
  if (vercelEnv === "production" || vercelEnv === "preview" || vercelEnv === "development") return vercelEnv;
  return source.NODE_ENV === "production" ? "production" : "development";
}

/** Normalises an absolute http(s) URL to its origin; null when it is not one. */
export function toOrigin(value: string | undefined, { requireHttps = false } = {}): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && (requireHttps || url.protocol !== "http:")) return null;
    if (url.username || url.password) return null;
    return url.origin;
  } catch {
    return null;
  }
}

/** The canonical SEO origin. Falls back to the .com when unset (development, tests). */
export function canonicalOrigin(source: EnvSource): string {
  return toOrigin(present(source, "NEXT_PUBLIC_SITE_URL")) ?? DEFAULT_SITE_URL;
}

function hostOrigin(host: string | undefined): string | null {
  if (!host || !/^[a-z0-9.-]+(:\d+)?$/i.test(host)) return null;
  return `https://${host.toLowerCase()}`;
}

export interface AppOrigins {
  /** Where redirects go when the request's own host is not one of `allowed`. */
  primary: string;
  /** Every origin this deployment may redirect to (the request host is matched against these). */
  allowed: string[];
}

/**
 * The redirect/auth origins for this deployment, or null in development, where the dev server's
 * own Host header is used instead (no untrusted proxy sits in front of it).
 *
 * APP_ORIGIN, when set, overrides the default: for a self-hosted `next start` (for example a local
 * production build used by the E2E suite) whose address is not the canonical domain.
 */
export function appOrigins(source: EnvSource): AppOrigins | null {
  const deployment = deploymentOf(source);
  if (deployment === "development") return null;

  const override = toOrigin(present(source, "APP_ORIGIN"));
  if (override) return { primary: override, allowed: [override] };

  if (deployment === "preview") {
    const hosts = [hostOrigin(present(source, "VERCEL_BRANCH_URL")), hostOrigin(present(source, "VERCEL_URL"))].filter(
      (origin): origin is string => origin !== null
    );
    const allowed = [...new Set(hosts)];
    if (allowed.length > 0) return { primary: allowed[0], allowed };
  }

  const canonical = canonicalOrigin(source);
  return { primary: canonical, allowed: [canonical] };
}

/**
 * Picks the origin to redirect to for a request that arrived on `requestHost`: that host when this
 * deployment owns it, otherwise the primary origin. Never trusts a host outside `allowed`.
 */
export function resolveAppOrigin(origins: AppOrigins, requestHost: string | null | undefined): string {
  const fromRequest = hostOrigin(requestHost ?? undefined);
  return fromRequest && origins.allowed.includes(fromRequest) ? fromRequest : origins.primary;
}

/**
 * Problems with the configuration for this deployment, as messages that name variables (never
 * values). Empty when the configuration is complete. `phase` "build" checks only what the build
 * reads, since runtime secrets are often not present in the build environment.
 */
export function envProblems(source: EnvSource, phase: "build" | "runtime" = "runtime"): string[] {
  const deployment = deploymentOf(source);
  const problems: string[] = [];
  const required: readonly string[] =
    phase === "build" || deployment !== "production" ? SUPABASE_PUBLIC_VARS : PRODUCTION_REQUIRED_VARS;

  // In development everything may be missing: pages that need a variable say so when used.
  if (deployment === "development") return problems;

  for (const name of required) {
    if (!present(source, name)) problems.push(`${name} is not set`);
  }

  const supabaseUrl = present(source, "NEXT_PUBLIC_SUPABASE_URL");
  if (supabaseUrl && !toOrigin(supabaseUrl)) problems.push("NEXT_PUBLIC_SUPABASE_URL is not an http(s) URL");

  if (phase === "runtime" && deployment === "production") {
    const siteUrl = present(source, "NEXT_PUBLIC_SITE_URL");
    if (siteUrl && !toOrigin(siteUrl, { requireHttps: true })) problems.push("NEXT_PUBLIC_SITE_URL is not an https URL");

    const rateSecret = present(source, "RATE_LIMIT_SECRET");
    if (rateSecret && rateSecret.length < MIN_RATE_LIMIT_SECRET_LENGTH) {
      problems.push(`RATE_LIMIT_SECRET is shorter than ${MIN_RATE_LIMIT_SECRET_LENGTH} characters`);
    }
    if (rateSecret && rateSecret === present(source, "SUPABASE_SERVICE_ROLE_KEY")) {
      problems.push("RATE_LIMIT_SECRET must not reuse SUPABASE_SERVICE_ROLE_KEY");
    }

    const appOrigin = present(source, "APP_ORIGIN");
    if (appOrigin && !toOrigin(appOrigin)) problems.push("APP_ORIGIN is not an http(s) URL");
  }

  return problems;
}

export class EnvConfigError extends Error {
  constructor(problems: string[]) {
    super(`Server configuration is incomplete: ${problems.join("; ")}. See .env.example.`);
    this.name = "EnvConfigError";
  }
}

/** Throws EnvConfigError listing every problem (names only) when the configuration is incomplete. */
export function assertEnv(source: EnvSource, phase: "build" | "runtime" = "runtime"): void {
  const problems = envProblems(source, phase);
  if (problems.length > 0) throw new EnvConfigError(problems);
}

/** The Supabase URL and anon key. Throws a named error when either is missing. */
export function supabasePublicConfig(source: EnvSource): { url: string; anonKey: string } {
  const url = present(source, "NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = present(source, "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const missing = [!url && "NEXT_PUBLIC_SUPABASE_URL", !anonKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY"].filter(Boolean) as string[];
  if (missing.length > 0) throw new EnvConfigError(missing.map((name) => `${name} is not set`));
  return { url: url!, anonKey: anonKey! };
}
