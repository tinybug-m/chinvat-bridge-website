import { cookies, draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  (await draftMode()).disable();
  (await cookies()).delete("cb_preview");
  return new NextResponse(null, {
    status: 307,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex", Location: new URL("/", request.nextUrl.origin).toString() },
  });
}
