import "server-only";
import { createClient } from "@/lib/supabase/server";

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  return adminEmails().includes(email.trim().toLowerCase());
}

/**
 * Returns the current signed-in user if — and only if — their email is on the
 * admin allow-list. Every admin Server Action must call this itself (not just
 * gate the page), since an action can be invoked directly regardless of what
 * page rendered the form that calls it.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email?.toLowerCase();

  // A confirmed address only: an account whose email nobody has proven never gets admin.
  if (!email || !user?.email_confirmed_at || !adminEmails().includes(email)) {
    return null;
  }

  return user;
}
