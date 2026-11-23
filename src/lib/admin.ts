import "server-only";
import { cache } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export interface AdminContext {
  user: User;
  /** The admin's own session client: Row Level Security (public.is_admin()) decides what it may do. */
  supabase: SupabaseClient<Database>;
}

/**
 * Returns the signed-in user and their session client if — and only if — the database says they
 * are an administrator (public.admin_users, checked by public.is_admin() under their own session).
 * ADMIN_EMAILS is not read here: it only seeds admin_users (scripts/db/seed-admins.mjs).
 *
 * Every admin Server Action must call this itself (not just gate the page), since an action can be
 * invoked directly regardless of what page rendered the form that calls it. RLS enforces the same
 * rule again on every read and write the returned client makes.
 */
export const requireAdmin = cache(async (): Promise<AdminContext | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // A confirmed address only: an account whose email nobody has proven never gets admin.
  if (!user || !user.email_confirmed_at) return null;

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error) {
    console.error(`[admin] is_admin check failed (code=${error.code ?? "unknown"})`);
    return null;
  }
  return isAdmin === true ? { user, supabase } : null;
});
