import type { Metadata } from "next";
import { CheckoutShell } from "@/components/templates/CheckoutShell";
import { Container } from "@/components/atoms/Container";
import { CornerFrame } from "@/components/atoms/CornerFrame";
import { LoginForm } from "@/components/organisms/auth/LoginForm";

export const metadata: Metadata = {
  title: "Client Sign In",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
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
          <LoginForm />
        </CornerFrame>
      </Container>
    </CheckoutShell>
  );
}
