import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/constants";
import { cn } from "@/lib/utils";

type EmailLinkVariant = "subtle" | "underline";

const VARIANT_CLASSES: Record<EmailLinkVariant, string> = {
  subtle:
    "text-cobalt-700 underline decoration-cobalt-700/35 underline-offset-[0.22em] transition-[text-decoration-color] duration-200 ease-out-quart hover:decoration-cobalt-700",
  underline:
    "text-ink underline decoration-line-strong underline-offset-[0.22em] wrap-break-word transition-[color,text-decoration-color] duration-200 ease-out-quart hover:text-cobalt-700 hover:decoration-cobalt-700",
};

interface EmailLinkProps {
  variant?: EmailLinkVariant;
  className?: string;
}

export function EmailLink({ variant = "subtle", className = "" }: EmailLinkProps) {
  return (
    <a className={cn(VARIANT_CLASSES[variant], className)} href={CONTACT_MAILTO}>
      {CONTACT_EMAIL}
    </a>
  );
}
