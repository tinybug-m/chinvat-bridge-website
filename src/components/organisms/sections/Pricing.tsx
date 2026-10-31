import { PageHeader } from "@/components/system/PageHeader";
import { Container } from "@/components/system/Container";
import { TextLink } from "@/components/system/TextLink";
import { ArrowIcon } from "@/components/system/ArrowIcon";
import { PricingCard } from "@/components/organisms/sections/PricingCard";
import { getPlans } from "@/data/pricing";

/**
 * /pricing: the page header, then the plans as columns on paper split by
 * hairlines. On lg each column is a subgrid spanning the four rows set here,
 * so the price block, spec rows, capability list and button line up across
 * plans whatever the copy length.
 */
export async function Pricing() {
  const plans = await getPlans();

  return (
    <>
      <PageHeader
        kicker="SEO & content retainers"
        title="SEO & content plans"
        lede="Ongoing content, technical SEO and link building — delivered on a predictable monthly retainer. For AI, automation or custom software work, get in touch for a scoped quote."
      />

      <section id="pricing" aria-label="Plans" className="border-b border-line">
        <Container>
          <ul className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-[auto_auto_1fr_auto]">
            {plans.map((plan, index) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                position={index === 0 ? "first" : index === plans.length - 1 ? "last" : "middle"}
              />
            ))}
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
