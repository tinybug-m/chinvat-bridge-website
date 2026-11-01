import { CONTACT_EMAIL } from "@/lib/constants";

export const NEEDS = ["AI & Automation", "Workflows", "Software & Web", "SEO & Growth", "Not sure yet"] as const;

export interface BriefValues {
  name: string;
  email: string;
  company: string;
  needs: string[];
  message: string;
}

export const EMPTY_BRIEF: BriefValues = { name: "", email: "", company: "", needs: [], message: "" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isEmail = (value: string) => EMAIL_PATTERN.test(value.trim());

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
    "",
    values.message.trim(),
  ].join("\n");
  return {
    subject,
    body,
    mailto: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}
