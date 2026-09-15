import { createClient } from "@/lib/supabase/server";

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
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

  if (!email || !adminEmails().includes(email)) {
    return null;
  }

  return user;
}
