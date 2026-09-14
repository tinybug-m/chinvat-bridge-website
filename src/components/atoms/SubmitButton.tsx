"use client";

import { useFormStatus } from "react-dom";
import { Icon, type IconName } from "@/components/atoms/icons";
import { buttonClassName, type ButtonSize, type ButtonVariant } from "@/components/atoms/buttonStyles";

interface SubmitButtonProps {
  children: string;
  pendingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  className?: string;
}

export function SubmitButton({
  children,
  pendingLabel = "Redirecting…",
  variant = "solid",
  size = "md",
  icon,
  className = "",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={buttonClassName(variant, size, className)}>
      <span>{pending ? pendingLabel : children}</span>
      {!pending && icon ? <Icon name={icon} className="text-sm shrink-0" /> : null}
    </button>
  );
}
