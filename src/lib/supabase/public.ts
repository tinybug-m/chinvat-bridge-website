import "server-only";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { supabaseConfig } from "@/lib/env";

let publicClient: SupabaseClient<Database> | null = null;

/**
 * Cookie-free anon client for public data (plans, published content RPCs). It never reads the
 * request, so callers can be cached (unstable_cache) and the pages using them stay static or ISR.
 * Row Level Security applies as `anon`.
 */
export function createPublicClient() {
  if (!publicClient) {
    const { url, anonKey } = supabaseConfig();
    publicClient = createSupabaseClient<Database>(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });
  }
  return publicClient;
}
