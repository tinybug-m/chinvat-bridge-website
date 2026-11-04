import type { Metadata } from "next";
import { SiteShell } from "@/components/templates/SiteShell";
import { PageHeader } from "@/components/system/PageHeader";
import { Container } from "@/components/system/Container";
import { Prose } from "@/components/system/Prose";
import { EmailLink } from "@/components/atoms/EmailLink";
import { formatPostDate } from "@/lib/blog";
import { TERMS_UPDATED } from "@/lib/legal";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "The terms that govern your subscription to Chinvat Bridge's SEO and content services — billing, cancellation, scope of work and responsibilities.",
  path: "/terms",
});

export default function TermsOfServicePage() {
  return (
    <SiteShell>
      <PageHeader kicker="Legal" title="Terms of service" />
      <Container className="grid grid-cols-1 gap-y-10 pt-10 pb-section lg:grid-cols-12 lg:gap-x-6 lg:pt-16">
        <aside aria-label="About this document" className="lg:col-span-3">
          <p className="text-small text-ink-muted lg:sticky lg:top-28">
            Last updated: <time dateTime={TERMS_UPDATED}>{formatPostDate(TERMS_UPDATED)}</time>
          </p>
        </aside>
        <Prose className="lg:col-span-7 lg:col-start-4">
          <p className="text-lede text-ink">
            These terms govern your use of subscription services provided by Chinvat Bridge Ltd
            (&ldquo;we&rdquo;, &ldquo;us&rdquo;), a UK-based technology consultancy. By subscribing to a
            plan, you agree to these terms.
          </p>

          <h2>Subscriptions & billing</h2>
          <p>
            Subscriptions are billed monthly in advance via our payment processor, Stripe. Your
            subscription renews automatically each month until cancelled. Prices are shown exclusive of
            any applicable tax, which will be added at checkout where relevant.
          </p>

          <h2>Cancellation</h2>
          <p>
            There is no long-term lock-in contract. You may cancel your subscription at any time; we ask
            for 30 days&rsquo; notice so we can wind down active work in an orderly way. Cancellation
            requests should be sent to <EmailLink />.
          </p>

          <h2>Scope of service</h2>
          <p>
            The specific deliverables included in your plan are described on our{" "}
            <a href="/pricing">
              pricing page
            </a>{" "}
            at the time you subscribe. Work outside that scope &mdash; including AI, automation or
            custom software projects &mdash; is quoted and agreed separately.
          </p>

          <h2>Client responsibilities</h2>
          <p>
            You&rsquo;re responsible for providing accurate business information and timely access to any
            systems (such as analytics or search console) needed for us to deliver the service.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            We work to a high professional standard, but we do not guarantee specific search rankings,
            traffic, or revenue outcomes, as these depend on factors outside our control. Our liability
            in connection with the services is limited to the fees paid in the preceding three months.
          </p>

          <h2>Governing law</h2>
          <p>These terms are governed by the laws of England and Wales.</p>

          <h2>Contact</h2>
          <p>
            Questions about these terms can be sent to <EmailLink />.
          </p>
        </Prose>
      </Container>
    </SiteShell>
  );
}
