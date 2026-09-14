import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/constants";

type EmailLinkVariant = "subtle" | "underline";

const VARIANT_CLASSES: Record<EmailLinkVariant, string> = {
  subtle: "text-gold-300 hover:text-gold-400 transition-colors",
  underline: "text-parchment-200 hover:text-gold-300 underline-offset-2 hover:underline wrap-break-word",
};

interface EmailLinkProps {
  variant?: EmailLinkVariant;
  className?: string;
}

export function EmailLink({ variant = "subtle", className = "" }: EmailLinkProps) {
  return (
    <a className={`${VARIANT_CLASSES[variant]} ${className}`} href={CONTACT_MAILTO}>
      {CONTACT_EMAIL}
    </a>
  );
}
