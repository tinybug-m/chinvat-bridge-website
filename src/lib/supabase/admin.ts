import "server-only";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { supabaseConfig, supabaseServiceRoleKey } from "@/lib/env";

let adminClient: SupabaseClient<Database> | null = null;

/**
 * Service-role Supabase client — bypasses Row Level Security entirely.
 * Server-only. Never import this into a Client Component or expose its key to the browser.
 * Use it only where no user session exists (Stripe webhook, checkout sign-in, rate limiting);
 * signed-in reads and admin work go through the user's own client (src/lib/supabase/server.ts).
 */
export function createAdminClient() {
  if (!adminClient) {
    const { url } = supabaseConfig();
    adminClient = createSupabaseClient<Database>(url, supabaseServiceRoleKey(), {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return adminClient;
}
