"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { sendMagicLink, type SendMagicLinkResult } from "@/actions/auth";

const initialState: SendMagicLinkResult | null = null;

export function LoginForm() {
  const [state, formAction] = useActionState(sendMagicLink, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="email" className="block font-mono text-[10px] text-parchment-200 tracking-technical uppercase mb-1.5">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@company.com"
          className="w-full bg-obsidian-900 border border-stone-borderLight px-4 py-3 font-sans text-sm text-parchment-100 focus:border-gold-500 focus:ring-0 focus:outline-none transition-colors rounded-sm placeholder:text-parchment-dim/60"
        />
      </div>

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
