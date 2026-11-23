import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabasePublicConfig } from "@/lib/env-rules";

/** Supabase's auth cookies are `sb-<project>-auth-token`, possibly split into `.0`, `.1`, … chunks. */
export function hasSupabaseSession(request: NextRequest): boolean {
  return request.cookies.getAll().some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"));
}

/**
 * Refreshes the Supabase session cookie. Runs only on the routes that use a session (matcher in
 * src/proxy.ts), and only when the browser has a session to refresh: an anonymous visitor costs no
 * call to Supabase Auth.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!hasSupabaseSession(request)) return response;

  const { url, anonKey } = supabasePublicConfig(process.env);
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Refreshes the session token if it's expired — required for SSR auth to keep working.
  await supabase.auth.getUser();

  return response;
}
