import type { ReactNode } from "react";
import { Container } from "@/components/atoms/Container";
import { BrandLockup } from "@/components/molecules/BrandLockup";
import { toRomanNumeral } from "@/lib/roman-numeral";

/**
 * Stripped-down shell for the checkout funnel (details/payment/confirmation) —
 * logo only, no primary nav, to keep the customer focused on completing checkout.
 */
export function CheckoutShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b border-stone-border bg-obsidian-950">
        <Container className="h-20 flex items-center">
          <BrandLockup />
        </Container>
      </header>
      <main className="grow bg-obsidian-950">{children}</main>
      <footer className="border-t border-stone-border bg-obsidian-950 py-6">
        <Container>
          <p className="font-mono text-[10px] text-parchment-dim text-center uppercase tracking-technical">
            &copy; {toRomanNumeral(new Date().getFullYear())} Chinvat Bridge Ltd. All rights reserved.
          </p>
        </Container>
      </footer>
    </>
  );
}
