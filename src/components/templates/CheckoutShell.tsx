import type { ReactNode } from "react";
import { Lockup } from "@/components/brand/Lockup";
import { Container } from "@/components/system/Container";

/**
 * Stripped-down shell for the checkout funnel (details/payment/confirmation) —
 * lockup only, no primary nav, to keep the customer focused on completing checkout.
 */
export function CheckoutShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:inline-flex focus:min-h-11 focus:items-center focus:bg-ink focus:px-5 focus:text-paper"
      >
        Skip to content
      </a>
      <header className="border-b border-line bg-paper">
        <Container className="flex h-16 items-center lg:h-18">
          <Lockup className="min-h-11" />
        </Container>
      </header>
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <footer className="border-t border-line bg-paper-raised">
        <Container className="py-6">
          <p className="text-small text-ink-muted">
            &copy; {new Date().getFullYear()} Chinvat Bridge Ltd. All rights reserved.
          </p>
        </Container>
      </footer>
    </>
  );
}
