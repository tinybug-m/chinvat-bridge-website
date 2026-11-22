import type { Metadata } from "next";
import { CheckoutShell } from "@/components/templates/CheckoutShell";
import { Container } from "@/components/system/Container";
import { LoginForm } from "@/components/organisms/auth/LoginForm";

export const metadata: Metadata = {
  title: "Client Sign In",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed: "That sign-in link didn’t work — it may have expired. Please try again.",
  google_auth_failed: "We couldn’t start Google sign-in just now. Please try again.",
};

/** Outcomes of the post-checkout sign-in (src/app/auth/checkout-login/route.ts). Fixed text only. */
const NOTICES: Record<string, string> = {
  checkout_email_sent: "Your subscription is set up. We’ve emailed you a secure sign-in link — open it on this device to reach your portal.",
  checkout_sign_in: "Enter the email you used at checkout and we’ll send you a secure sign-in link.",
  checkout_payment_pending:
    "Your payment is still being confirmed. We’ll email you once it clears; you can also request a sign-in link below.",
  checkout_unavailable: "We couldn’t sign you in automatically just now. Request a sign-in link below and it will arrive by email.",
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string; notice?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, notice } = await searchParams;
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? "Something went wrong. Please try again.") : null;
  const noticeMessage = !errorMessage && notice ? (NOTICES[notice] ?? null) : null;

  return (
    <CheckoutShell>
      <Container className="grid grid-cols-1 gap-y-12 py-section lg:min-h-[min(44rem,calc(100svh-9rem))] lg:grid-cols-12 lg:items-center lg:gap-x-6">
        <div className="lg:col-span-5">
          <div aria-hidden="true" className="mb-10 h-px w-24 bg-line-strong" />
          <p className="text-small font-medium text-ink-muted">Client portal</p>
          <h1 className="mt-4 font-display text-title font-medium text-balance text-ink [font-stretch:100%] lg:[font-stretch:112%]">
            Sign in
          </h1>
          <p className="mt-6 max-w-[30rem] text-lede text-pretty text-ink-soft">
            Enter the email you subscribed with — we&rsquo;ll send you a secure sign-in link.
          </p>
        </div>

        <div className="w-full max-w-[28rem] lg:col-span-5 lg:col-start-8 lg:max-w-none">
          <div className="rounded-[2px] border border-line bg-paper-raised p-6 sm:p-8">
            {errorMessage ? (
              <p role="alert" className="mb-6 border-l-2 border-signal-error pl-4 text-small text-ink">
                {errorMessage}
              </p>
            ) : null}
            {noticeMessage ? (
              <p role="status" className="mb-6 border-l-2 border-line-strong pl-4 text-small text-ink">
                {noticeMessage}
              </p>
            ) : null}
            <LoginForm />
          </div>
        </div>
      </Container>
    </CheckoutShell>
  );
}
