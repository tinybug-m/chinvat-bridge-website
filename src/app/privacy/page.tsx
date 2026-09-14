import type { Metadata } from "next";
import { SiteShell } from "@/components/templates/SiteShell";
import { Section } from "@/components/molecules/Section";
import { EmailLink } from "@/components/atoms/EmailLink";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Chinvat Bridge collects, uses and protects your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <SiteShell>
      <Section containerSize="4xl" containerWide={false}>
        <div className="space-y-8 font-serif-monument text-parchment-200 leading-relaxed">
          <div>
            <span className="font-mono text-[10px] text-gold-500 uppercase tracking-technical block mb-2">
              Legal
            </span>
            <h1 className="font-serif-monument text-3xl sm:text-4xl text-parchment-50 uppercase tracking-tight">
              Privacy Policy
            </h1>
            <p className="font-mono text-[11px] text-parchment-dim uppercase tracking-technical mt-3">
              Last updated: 14 September 2026
            </p>
          </div>

          <p>
            Chinvat Bridge (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a UK-based technology consultancy. This
            policy explains what information we collect when you enquire about or subscribe to our
            services, and how we use it.
          </p>

          <div className="space-y-3">
            <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">Information We Collect</h2>
            <p>When you contact us, request a plan, or subscribe to a service, we may collect:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your name, company name, business email address and phone number</li>
              <li>Your website URL and, optionally, your target market and project notes</li>
              <li>Billing information processed directly by our payment provider, Stripe (we do not
                store your card details ourselves)</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">How We Use It</h2>
            <p>We use this information only to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Set up and deliver the service you&rsquo;ve subscribed to or enquired about</li>
              <li>Correspond with you about your account, project or enquiry</li>
              <li>Process payments and manage your subscription, via Stripe</li>
              <li>Meet our legal and accounting obligations</li>
            </ul>
            <p>We do not sell your data, and we do not use it for advertising or share it with third
              parties except the service providers strictly necessary to run our business (such as
              Stripe for payment processing).</p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">Payment Processing</h2>
            <p>
              Subscription payments are handled entirely by{" "}
              <a
                className="text-gold-300 hover:text-gold-400 underline underline-offset-4"
                href="https://stripe.com/gb/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Stripe
              </a>
              . We never see or store your full card details. Stripe&rsquo;s own privacy policy governs
              how it handles your payment data.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">Data Retention</h2>
            <p>
              We retain your information for as long as needed to provide our services and meet our legal
              and accounting obligations, after which it is deleted or anonymised.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">Your Rights</h2>
            <p>
              Under UK GDPR, you have the right to access, correct, or request deletion of your personal
              data. To exercise any of these rights, contact us at <EmailLink />.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">Contact</h2>
            <p>
              Questions about this policy or your data can be sent to <EmailLink />.
            </p>
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}
