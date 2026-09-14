import type { Metadata } from "next";
import { CheckoutShell } from "@/components/templates/CheckoutShell";
import { Container } from "@/components/atoms/Container";
import { CornerFrame } from "@/components/atoms/CornerFrame";
import { LoginForm } from "@/components/organisms/auth/LoginForm";

export const metadata: Metadata = {
  title: "Client Sign In",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed: "That sign-in link didn't work — it may have expired. Please try again.",
  google_auth_failed: "We couldn't start Google sign-in just now. Please try again.",
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? "Something went wrong. Please try again.") : null;

  return (
    <CheckoutShell>
      <Container size="4xl" wide={false} className="py-16 lg:py-24">
        <CornerFrame className="border border-stone-border bg-obsidian-900 rounded-sm p-8 sm:p-12 max-w-md mx-auto">
          <div className="text-center mb-8">
            <span className="font-mono text-[10px] text-gold-500 uppercase tracking-technical block mb-2">
              Client Portal
            </span>
            <h1 className="font-serif-monument text-3xl text-parchment-50 uppercase tracking-tight">Sign In</h1>
            <p className="font-serif-monument text-sm text-parchment-muted mt-2">
              Enter the email you subscribed with — we&rsquo;ll send you a secure sign-in link.
            </p>
          </div>
          {errorMessage ? (
            <p role="alert" className="mb-6 text-center font-serif-monument text-sm text-red-400">
              {errorMessage}
            </p>
          ) : null}
          <LoginForm />
        </CornerFrame>
      </Container>
    </CheckoutShell>
  );
}
