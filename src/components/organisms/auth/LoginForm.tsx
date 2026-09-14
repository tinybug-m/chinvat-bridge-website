"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { FormField } from "@/components/molecules/FormField";
import { sendMagicLink, type SendMagicLinkResult } from "@/actions/auth";

const initialState: SendMagicLinkResult | null = null;

export function LoginForm() {
  const [state, formAction] = useActionState(sendMagicLink, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Email Address" name="email" type="email" required placeholder="you@company.com" />

      {state ? (
        <p
          className={`font-serif-monument text-sm ${
            state.status === "sent" ? "text-gold-300" : "text-red-400"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <SubmitButton size="lg" className="w-full" pendingLabel="Sending…">
        Send Sign-In Link
      </SubmitButton>
    </form>
  );
}
