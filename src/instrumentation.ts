import { assertEnv } from "@/lib/env-rules";

/*
 * Runs once when a server instance starts. Production refuses to start with an incomplete
 * configuration (the error names the missing variables, never their values; rules in
 * src/lib/env-rules.ts). The build phase is skipped: runtime secrets are not part of the build
 * environment.
 */
export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  assertEnv(process.env, "runtime");
}
