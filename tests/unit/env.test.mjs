// Environment rules (src/lib/env-rules.ts): required variables per deployment, and the split
// between the canonical SEO origin and the redirect/auth origin.
import assert from "node:assert/strict";
import { test } from "node:test";
import { appOrigins, assertEnv, canonicalOrigin, deploymentOf, envProblems, resolveAppOrigin } from "../../src/lib/env-rules.ts";

const SECRET = "s".repeat(40);
const complete = {
  NODE_ENV: "production",
  VERCEL_ENV: "production",
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
  SUPABASE_SERVICE_ROLE_KEY: "service",
  STRIPE_SECRET_KEY: "sk_test_x",
  STRIPE_WEBHOOK_SECRET: "whsec_x",
  RATE_LIMIT_SECRET: SECRET,
  NEXT_PUBLIC_SITE_URL: "https://www.chinvatbridge.com",
};

test("a complete production configuration passes", () => {
  assert.deepEqual(envProblems(complete), []);
  assert.doesNotThrow(() => assertEnv(complete));
});

test("production fails fast naming each missing variable, never a value", () => {
  const { RATE_LIMIT_SECRET, STRIPE_WEBHOOK_SECRET, ...rest } = complete;
  void RATE_LIMIT_SECRET;
  void STRIPE_WEBHOOK_SECRET;
  assert.throws(
    () => assertEnv(rest),
    (error) => /RATE_LIMIT_SECRET is not set/.test(error.message) && /STRIPE_WEBHOOK_SECRET is not set/.test(error.message) && !error.message.includes("sk_test_x")
  );
});

test("RATE_LIMIT_SECRET must be long and must not reuse the service-role key", () => {
  assert.match(envProblems({ ...complete, RATE_LIMIT_SECRET: "short" }).join(), /shorter than 32/);
  const reused = { ...complete, SUPABASE_SERVICE_ROLE_KEY: SECRET };
  assert.match(envProblems(reused).join(), /must not reuse SUPABASE_SERVICE_ROLE_KEY/);
  assert.ok(!envProblems(reused).join().includes(SECRET));
});

test("the canonical origin must be https in production", () => {
  assert.match(envProblems({ ...complete, NEXT_PUBLIC_SITE_URL: "http://www.chinvatbridge.com" }).join(), /not an https URL/);
});

test("build phase checks only what the build reads", () => {
  assert.deepEqual(envProblems({ NODE_ENV: "production", NEXT_PUBLIC_SUPABASE_URL: "https://p.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "a" }, "build"), []);
  assert.match(envProblems({ NODE_ENV: "production" }, "build").join(), /NEXT_PUBLIC_SUPABASE_URL is not set/);
});

test("development and previews do not require production secrets", () => {
  assert.deepEqual(envProblems({ NODE_ENV: "development" }), []);
  const preview = { NODE_ENV: "production", VERCEL_ENV: "preview", NEXT_PUBLIC_SUPABASE_URL: "https://p.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "a" };
  assert.deepEqual(envProblems(preview), []);
  assert.equal(deploymentOf(preview), "preview");
  assert.equal(deploymentOf({ NODE_ENV: "production" }), "production");
});

test("Preview redirects to its own Vercel host but canonical URLs stay on the .com", () => {
  const preview = { VERCEL_ENV: "preview", VERCEL_URL: "site-abc123.vercel.app", VERCEL_BRANCH_URL: "site-git-feat.vercel.app", NEXT_PUBLIC_SITE_URL: "https://www.chinvatbridge.com" };
  const origins = appOrigins(preview);
  assert.equal(origins.primary, "https://site-git-feat.vercel.app");
  assert.deepEqual(origins.allowed, ["https://site-git-feat.vercel.app", "https://site-abc123.vercel.app"]);
  assert.equal(canonicalOrigin(preview), "https://www.chinvatbridge.com");
  assert.equal(resolveAppOrigin(origins, "site-abc123.vercel.app"), "https://site-abc123.vercel.app");
  assert.equal(resolveAppOrigin(origins, "evil.example"), "https://site-git-feat.vercel.app");
  assert.equal(resolveAppOrigin(origins, "evil.example/x@site-abc123.vercel.app"), "https://site-git-feat.vercel.app");
});

test("production redirects to the canonical origin; APP_ORIGIN overrides for self-hosting; development uses the request", () => {
  assert.deepEqual(appOrigins(complete), { primary: "https://www.chinvatbridge.com", allowed: ["https://www.chinvatbridge.com"] });
  assert.equal(appOrigins({ ...complete, VERCEL_ENV: undefined, APP_ORIGIN: "http://localhost:3100/" }).primary, "http://localhost:3100");
  assert.equal(appOrigins({ NODE_ENV: "development" }), null);
  assert.equal(canonicalOrigin({}), "https://www.chinvatbridge.com");
});
