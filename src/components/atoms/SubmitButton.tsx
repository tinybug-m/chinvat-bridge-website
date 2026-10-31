"use client";

import { useFormStatus } from "react-dom";
import type { VariantProps } from "class-variance-authority";
import { ArrowIcon } from "@/components/system/ArrowIcon";
import { buttonVariants } from "@/components/system/Button";
import { cn } from "@/lib/utils";

interface SubmitButtonProps extends VariantProps<typeof buttonVariants> {
  children: string;
  pendingLabel?: string;
  /** Trailing arrow, hidden while the form is pending. */
  arrow?: "right" | "down" | "up-right";
  className?: string;
}

/** The system button as a form submit: disabled and relabelled while the action is pending. */
export function SubmitButton({
  children,
  pendingLabel = "Redirecting…",
  variant = "primary",
  size = "md",
  arrow,
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={cn(buttonVariants({ variant, size }), className)}>
      <span>{pending ? pendingLabel : children}</span>
      {!pending && arrow ? <ArrowIcon direction={arrow} /> : null}
    </button>
  );
}
