"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { FormField } from "@/components/molecules/FormField";
import { sendMagicLink, signInWithGoogle, type SendMagicLinkResult } from "@/actions/auth";

const initialState: SendMagicLinkResult | null = null;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-4 h-4 shrink-0" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.5 0-14 4.2-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 35.1 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.9 39.6 16.4 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.6 5.6C41.3 36 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(sendMagicLink, initialState);

  return (
    <div className="space-y-6">
      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-3 bg-parchment-50 hover:bg-parchment-100 text-obsidian-950 font-mono font-semibold text-xs tracking-monumental uppercase py-3.5 rounded-sm transition-colors"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-stone-border" />
        <span className="font-mono text-[10px] text-parchment-dim uppercase tracking-technical">Or</span>
        <div className="h-px flex-1 bg-stone-border" />
      </div>

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
    </div>
  );
}
