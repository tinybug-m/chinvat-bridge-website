import Link from "next/link";
import { Section } from "@/components/molecules/Section";
import { SectionIntro } from "@/components/molecules/SectionIntro";
import { PricingCard } from "@/components/organisms/sections/PricingCard";
import { PRICING_PLANS } from "@/data/pricing";

export function Pricing() {
  return (
    <Section id="pricing">
      <SectionIntro
        eyebrow="SEO & Content Retainers"
        heading="SEO & Content Plans"
        description="Ongoing content, technical SEO and link building — delivered on a predictable monthly retainer. For AI, automation or custom software work, get in touch for a scoped quote."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {PRICING_PLANS.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          href="/client-portal"
          className="font-mono text-xs text-gold-400 hover:text-gold-300 tracking-technical uppercase underline underline-offset-4 decoration-gold-500/40"
        >
          See what your client portal will look like &rarr;
        </Link>
      </div>
    </Section>
  );
}
