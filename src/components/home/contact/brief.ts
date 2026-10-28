import { CONTACT_EMAIL } from "@/lib/constants";

export const NEEDS = ["AI & Automation", "Workflows", "Software & Web", "SEO & Growth", "Not sure yet"] as const;
export const TIMELINES = ["As soon as possible", "1–3 months", "3–6 months", "Just exploring"] as const;
export const MIN_MESSAGE = 20;

export interface BriefValues {
  name: string;
  email: string;
  company: string;
  needs: string[];
  timeline: string;
  message: string;
}

export type BriefField = "name" | "email" | "needs" | "message";
export type BriefErrors = Partial<Record<BriefField, string>>;

export const EMPTY_BRIEF: BriefValues = { name: "", email: "", company: "", needs: [], timeline: "", message: "" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateBrief(values: BriefValues): BriefErrors {
  const errors: BriefErrors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!values.email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Enter a valid email address, like name@company.com.";
  if (values.needs.length === 0) errors.needs = "Choose at least one option.";
  const length = values.message.trim().length;
  if (length === 0) errors.message = "Tell us a little about the project.";
  else if (length < MIN_MESSAGE) errors.message = `Add a little more detail: at least ${MIN_MESSAGE} characters (${length} so far).`;
  return errors;
}

export function describeErrors(count: number): string {
  return count === 1 ? "1 field needs attention" : `${count} fields need attention`;
}

export interface BriefMessage {
  subject: string;
  body: string;
  mailto: string;
}

export function buildMessage(values: BriefValues): BriefMessage {
  const needs = NEEDS.filter((need) => values.needs.includes(need));
  const subject = `Project enquiry: ${needs.length ? needs.join(", ") : "General"}`;
  const body = [
    `Name: ${values.name.trim()}`,
    `Email: ${values.email.trim()}`,
    `Company: ${values.company.trim() || "—"}`,
    `Interested in: ${needs.join(", ") || "—"}`,
    `Timeline: ${values.timeline || "—"}`,
    "",
    values.message.trim(),
  ].join("\n");
  return {
    subject,
    body,
    mailto: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}
