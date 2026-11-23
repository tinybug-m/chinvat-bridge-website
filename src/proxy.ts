import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 renamed "middleware" to "proxy" — this file replaces the old middleware.ts.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  /*
   * Only the routes that read the signed-in user's session. Marketing pages, /pricing, /insights,
   * /client-portal (static example data) and /api/* never do, so they skip the Supabase Auth round
   * trip entirely. Authorisation never depends on this: each page and Server Action checks the user
   * itself (requireAdmin(), auth.getUser()).
   */
  matcher: ["/dashboard/:path*", "/admin/:path*", "/subscribe/:path*", "/auth/:path*", "/login"],
};
