/*
 * QA switches read from the URL on the client. The homepage stays static:
 * nothing here runs on the server, and page.tsx never reads searchParams.
 *
 * - ?quality=high|low|none  force a quality tier (all environments, for QA)
 * - ?poster=1               poster capture mode (development only)
 */

const IS_DEV = process.env.NODE_ENV !== "production";

function param(name: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

export function qualityOverride(): "high" | "low" | "none" | null {
  const value = param("quality");
  return value === "high" || value === "low" || value === "none" ? value : null;
}

/** Poster capture mode: render the rest pose once into a transparent canvas. */
export function captureMode(): boolean {
  return IS_DEV && param("poster") === "1";
}

/** Dev-only parameter, null in production builds. */
export function devParam(name: string): string | null {
  return IS_DEV ? param(name) : null;
}
