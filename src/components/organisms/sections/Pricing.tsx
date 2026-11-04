import { PageHeader } from "@/components/system/PageHeader";
import { Container } from "@/components/system/Container";
import { TextLink } from "@/components/system/TextLink";
import { ArrowIcon } from "@/components/system/ArrowIcon";
import { PricingCard } from "@/components/organisms/sections/PricingCard";
import { CustomPlanCard } from "@/components/organisms/sections/CustomPlanCard";
import { EmailLink } from "@/components/atoms/EmailLink";
import { getPlans } from "@/data/pricing";
import "./pricing.css";

/**
 * /pricing: the page header, then the plans as cards, each with its own tier
 * identity, and the custom package last. One column up to xl, every card a
 * wide row from md, so no plan stands alone or larger; from xl the three plans
 * in a row with the custom card as a band beneath. From xl every plan card is
 * a subgrid spanning five of the row tracks repeated here, so the plate, price
 * block, spec rows, capability list and button line up across the plans.
 */
export async function Pricing() {
  const plans = await getPlans();

  return (
    <>
      <PageHeader
        ruled={false}
        kicker="SEO & content retainers"
        title="SEO & content plans"
        lede="Ongoing content, technical SEO and link building — delivered on a predictable monthly retainer. For AI, automation or custom software work, get in touch for a scoped quote."
      />

      <section id="pricing" aria-label="Plans" className="border-b border-line pb-12 lg:pb-16">
        <Container>
          {plans.length === 0 ? (
            // No plans came back (none published, or the database could not be reached): say so
            // plainly rather than show prices from anywhere else. The custom package still stands.
            <p role="status" className="mb-4 max-w-[40rem] text-body text-pretty text-ink-soft lg:mb-5">
              Our plan details can&rsquo;t be shown right now. Please try again shortly, or email <EmailLink /> and
              we&rsquo;ll send you current pricing.
            </p>
          ) : null}
          <ul className="grid grid-cols-1 gap-4 lg:gap-5 xl:auto-rows-[auto_auto_auto_1fr_auto] xl:grid-cols-3">
            {plans.map((plan, index) => (
              <PricingCard key={plan.id} plan={plan} index={index} />
            ))}
            <CustomPlanCard />
          </ul>
        </Container>
      </section>

      <Container className="py-12 lg:py-16">
        <TextLink href="/client-portal" className="inline-flex min-h-11 items-center gap-2 text-body">
          <span>See what your client portal will look like</span>
          <ArrowIcon />
        </TextLink>
      </Container>
    </>
  );
}
