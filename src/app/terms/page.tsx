import type { Metadata } from "next";
import { SiteShell } from "@/components/templates/SiteShell";
import { Section } from "@/components/molecules/Section";
import { EmailLink } from "@/components/atoms/EmailLink";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern use of Chinvat Bridge's services.",
};

export default function TermsOfServicePage() {
  return (
    <SiteShell>
      <Section containerSize="4xl" containerWide={false}>
        <div className="space-y-8 font-serif-monument text-parchment-200 leading-relaxed">
          <div>
            <span className="font-mono text-[10px] text-gold-500 uppercase tracking-technical block mb-2">
              Legal
            </span>
            <h1 className="font-serif-monument text-3xl sm:text-4xl text-parchment-50 uppercase tracking-tight">
              Terms of Service
            </h1>
            <p className="font-mono text-[11px] text-parchment-dim uppercase tracking-technical mt-3">
              Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          <p>
            These terms govern your use of subscription services provided by Chinvat Bridge Ltd
            (&ldquo;we&rdquo;, &ldquo;us&rdquo;), a UK-based technology consultancy. By subscribing to a
            plan, you agree to these terms.
          </p>

          <div className="space-y-3">
            <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">Subscriptions & Billing</h2>
            <p>
              Subscriptions are billed monthly in advance via our payment processor, Stripe. Your
              subscription renews automatically each month until cancelled. Prices are shown exclusive of
              any applicable tax, which will be added at checkout where relevant.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">Cancellation</h2>
            <p>
              There is no long-term lock-in contract. You may cancel your subscription at any time; we ask
              for 30 days&rsquo; notice so we can wind down active work in an orderly way. Cancellation
              requests should be sent to <EmailLink />.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">Scope of Service</h2>
            <p>
              The specific deliverables included in your plan are described on our{" "}
              <a className="text-gold-300 hover:text-gold-400 underline underline-offset-4" href="/pricing">
                pricing page
              </a>{" "}
              at the time you subscribe. Work outside that scope &mdash; including AI, automation or
              custom software projects &mdash; is quoted and agreed separately.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">Client Responsibilities</h2>
            <p>
              You&rsquo;re responsible for providing accurate business information and timely access to any
              systems (such as analytics or search console) needed for us to deliver the service.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">Limitation of Liability</h2>
            <p>
              We work to a high professional standard, but we do not guarantee specific search rankings,
              traffic, or revenue outcomes, as these depend on factors outside our control. Our liability
              in connection with the services is limited to the fees paid in the preceding three months.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">Governing Law</h2>
            <p>These terms are governed by the laws of England and Wales.</p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">Contact</h2>
            <p>
              Questions about these terms can be sent to <EmailLink />.
            </p>
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}
