import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 renamed "middleware" to "proxy" — this file replaces the old middleware.ts.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets, image optimization files, and
     * /api routes — no API route in this app reads the user's session cookie (the
     * Stripe webhook uses the service-role admin client instead), so running the
     * cookie-refresh auth check on every webhook delivery would just add latency.
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
