import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";
import { supabaseConfig } from "@/lib/env";

/**
 * Request-scoped Supabase client for Server Components/Actions/Route Handlers.
 * Respects Row Level Security using the signed-in user's own session.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = supabaseConfig();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component with no request context to write to — safe to
          // ignore as long as the proxy refreshes the session on the routes that use one.
        }
      },
    },
  });
}
