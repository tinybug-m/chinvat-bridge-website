"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface SendMagicLinkResult {
  status: "sent" | "error";
  message: string;
}

async function getSiteOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function sendMagicLink(_prevState: SendMagicLinkResult | null, formData: FormData): Promise<SendMagicLinkResult> {
  const email = formData.get("email");

  if (typeof email !== "string" || !email.includes("@")) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const origin = await getSiteOrigin();
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/dashboard` },
  });

  if (error) {
    console.error("signInWithOtp failed:", error);
    return { status: "error", message: "Something went wrong sending the link. Please try again." };
  }

  return { status: "sent", message: `Check ${email} for a sign-in link.` };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
