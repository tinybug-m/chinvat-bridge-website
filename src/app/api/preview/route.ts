import { cookies, draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { MIN_SECRET_LENGTH, previewPath, verifyPreview } from "@/lib/editorial/preview";
import { fetchPreviewRevision } from "@/lib/editorial/preview-fetch";

export const dynamic = "force-dynamic";

const HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

export async function GET(request: NextRequest) {
  const secret = process.env.PREVIEW_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) return new NextResponse("Preview is not configured", { status: 503, headers: HEADERS });

  const q = request.nextUrl.searchParams;
  const sig = q.get("sig");
  const check = verifyPreview(secret, { rev: q.get("rev"), kind: q.get("kind"), exp: q.get("exp"), sig });
  if (!check.ok) return new NextResponse(check.reason, { status: 401, headers: HEADERS });

  let path: string | null;
  try {
    path = previewPath(check.kind, await fetchPreviewRevision(check.kind, check.rev));
  } catch {
    return new NextResponse("Preview revision unavailable", { status: 502, headers: HEADERS });
  }
  if (!path) return new NextResponse("Preview target invalid", { status: 502, headers: HEADERS });

  (await draftMode()).enable();
  (await cookies()).set("cb_preview", `${check.kind}.${check.rev}.${check.exp}.${sig}`, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(1, check.exp - Math.floor(Date.now() / 1000)),
  });
  return new NextResponse(null, { status: 307, headers: { ...HEADERS, Location: new URL(path, request.nextUrl.origin).toString() } });
}
