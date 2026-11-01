"use server";

import { headers } from "next/headers";
import nodemailer from "nodemailer";
import { NEEDS, isEmail } from "@/components/home/contact/brief";
import { CONTACT_EMAIL } from "@/lib/constants";

/*
 * Sends the contact conversation straight to the team's inbox through Gmail
 * (Google Workspace) SMTP, so the visitor never leaves the page. Reply-To is
 * the visitor, so answering is one click in Gmail.
 *
 * Configure GMAIL_USER and GMAIL_APP_PASSWORD (see .env.example). Without them
 * a development server logs the email instead of sending it, and production
 * answers "unavailable" so the page can offer the email address instead.
 */

export interface EnquiryInput {
  name: string;
  email: string;
  company: string;
  need: string;
  message: string;
  /** Honeypot: a field people never see. Anything in it means a bot. */
  website: string;
  /** Milliseconds between the conversation opening and sending. */
  elapsed: number;
}

export type EnquiryResult = { status: "sent" } | { status: "invalid" | "limited" | "unavailable" | "error"; message: string };

const LIMITS = { name: 120, email: 254, company: 160, message: 5000 };
/** Nobody reads the greeting, picks a topic, writes and fills in details in under three seconds. */
const MIN_ELAPSED = 3000;
/** Per address: at most this many sends per window. In-memory, so per server instance: a speed bump, not a wall. */
const RATE = { max: 5, windowMs: 10 * 60 * 1000 };
const recent = new Map<string, number[]>();

const clean = (value: unknown, max: number) => (typeof value === "string" ? value.replace(/[\r\n]+/g, " ").trim().slice(0, max) : "");

function limited(key: string) {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((at) => now - at < RATE.windowMs);
  if (recent.size > 5000) recent.clear();
  recent.set(key, [...hits, now]);
  return hits.length >= RATE.max;
}

export async function sendEnquiry(input: EnquiryInput): Promise<EnquiryResult> {
  const name = clean(input?.name, LIMITS.name);
  const email = clean(input?.email, LIMITS.email);
  const company = clean(input?.company, LIMITS.company);
  const need = (NEEDS as readonly string[]).includes(input?.need) ? input.need : "";
  const message = typeof input?.message === "string" ? input.message.trim().slice(0, LIMITS.message) : "";

  if (!name || !isEmail(email) || !message) {
    return { status: "invalid", message: "Something was missing. Check your name, email and message." };
  }
  // Bots get a quiet success, so they learn nothing.
  if (input.website || typeof input.elapsed !== "number" || input.elapsed < MIN_ELAPSED) return { status: "sent" };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) {
    return { status: "limited", message: "That’s a few messages in a row. Please wait a few minutes and try again." };
  }

  const subject = `New enquiry: ${need || "General"} – ${name}${company ? `, ${company}` : ""}`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${company || "—"}`,
    `Interested in: ${need || "—"}`,
    "",
    message,
    "",
    "—",
    "Sent from the contact conversation on chinvatbridge.uk. Reply to this email to answer them directly.",
  ].join("\n");

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[enquiry] GMAIL_USER / GMAIL_APP_PASSWORD not set; not sending.\nSubject: ${subject}\n\n${text}`);
      return { status: "sent" };
    }
    console.error("[enquiry] GMAIL_USER / GMAIL_APP_PASSWORD missing in production");
    return { status: "unavailable", message: "Our messages aren’t going through right now." };
  }

  try {
    const transport = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
    await transport.sendMail({
      from: { name: "Chinvat Bridge website", address: user },
      to: process.env.ENQUIRY_TO || CONTACT_EMAIL,
      replyTo: { name, address: email },
      subject,
      text,
    });
    return { status: "sent" };
  } catch (error) {
    console.error("[enquiry] sendMail failed:", error);
    return { status: "error", message: "That didn’t go through." };
  }
}
