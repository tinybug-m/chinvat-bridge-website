import type { Metadata } from "next";
import { SiteShell } from "@/components/templates/SiteShell";
import { PageHeader } from "@/components/system/PageHeader";
import { Container } from "@/components/system/Container";
import { Prose } from "@/components/system/Prose";
import { EmailLink } from "@/components/atoms/EmailLink";
import { SHARED_OPEN_GRAPH } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Chinvat Bridge collects, uses and protects your information when you visit our site or subscribe to a plan, and your rights under UK data protection law.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    ...SHARED_OPEN_GRAPH,
    url: "/privacy",
    title: "Privacy Policy — Chinvat Bridge",
    description:
      "How Chinvat Bridge collects, uses and protects your information when you visit our site or subscribe to a plan, and your rights under UK data protection law.",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <SiteShell>
      <PageHeader kicker="Legal" title="Privacy policy" />
      <Container className="grid grid-cols-1 gap-y-10 pt-10 pb-section lg:grid-cols-12 lg:gap-x-6 lg:pt-16">
        <aside aria-label="About this document" className="lg:col-span-3">
          <p className="text-small text-ink-muted lg:sticky lg:top-28">Last updated: 14 September 2026</p>
        </aside>
        <Prose className="lg:col-span-7 lg:col-start-4">
          <p className="text-lede text-ink">
            Chinvat Bridge (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a UK-based technology consultancy. This
            policy explains what information we collect when you enquire about or subscribe to our
            services, and how we use it.
          </p>

          <h2>Information we collect</h2>
          <p>When you contact us, request a plan, or subscribe to a service, we may collect:</p>
          <ul>
            <li>Your name, company name, business email address and phone number</li>
            <li>Your website URL and, optionally, your target market and project notes</li>
            <li>Billing information processed directly by our payment provider, Stripe (we do not
              store your card details ourselves)</li>
          </ul>

          <h2>How we use it</h2>
          <p>We use this information only to:</p>
          <ul>
            <li>Set up and deliver the service you&rsquo;ve subscribed to or enquired about</li>
            <li>Correspond with you about your account, project or enquiry</li>
            <li>Process payments and manage your subscription, via Stripe</li>
            <li>Meet our legal and accounting obligations</li>
          </ul>
          <p>We do not sell your data, and we do not use it for advertising or share it with third
            parties except the service providers strictly necessary to run our business (such as
            Stripe for payment processing).</p>

          <h2>Payment processing</h2>
          <p>
            Subscription payments are handled entirely by{" "}
            <a
              href="https://stripe.com/gb/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Stripe
            </a>
            . We never see or store your full card details. Stripe&rsquo;s own privacy policy governs
            how it handles your payment data.
          </p>

          <h2>Data retention</h2>
          <p>
            We retain your information for as long as needed to provide our services and meet our legal
            and accounting obligations, after which it is deleted or anonymised.
          </p>

          <h2>Your rights</h2>
          <p>
            Under UK GDPR, you have the right to access, correct, or request deletion of your personal
            data. To exercise any of these rights, contact us at <EmailLink />.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this policy or your data can be sent to <EmailLink />.
          </p>
        </Prose>
      </Container>
    </SiteShell>
  );
}
