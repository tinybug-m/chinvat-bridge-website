import { PageHeader } from "@/components/system/PageHeader";
import { Container } from "@/components/system/Container";
import { TextLink } from "@/components/system/TextLink";
import { ArrowIcon } from "@/components/system/ArrowIcon";
import { PricingCard } from "@/components/organisms/sections/PricingCard";
import { CustomPlanCard } from "@/components/organisms/sections/CustomPlanCard";
import { EmailLink } from "@/components/atoms/EmailLink";
import { LinkList, ServiceSection, TextGrid } from "@/components/services/ServiceBlocks";
import { Reveal } from "@/components/motion/Reveal";
import { getPlans } from "@/data/pricing";
import type { PricingPage, ServicesCollection } from "@/lib/content/schema";
import "./pricing.css";

/** The page copy (page:/pricing) and what it lists; the plans themselves come from public.plans. */
export interface PricingContent {
  page: PricingPage;
  /** collection:services, for the custom package's "Ask us about" list. */
  services: ServicesCollection["items"];
  /** The services quoted per project, each from its page document (service name and meta description). */
  otherServices: { href: string; title: string; reason: string }[];
  contactEmail: string;
}

/**
 * /pricing: the page header, then the plans as cards, each with its own tier
 * identity, and the custom package last. One column up to xl, every card a
 * wide row from md, so no plan stands alone or larger; from xl the three plans
 * in a row with the custom card as a band beneath. From xl every plan card is
 * a subgrid spanning five of the row tracks repeated here, so the plate, price
 * block, spec rows, capability list and button line up across the plans.
 */
export async function Pricing({ content }: { content: PricingContent }) {
  const plans = await getPlans();
  const { page } = content;

  return (
    <>
      <PageHeader
        ruled={false}
        kicker={page.header.kicker}
        title={page.header.title}
        lede={page.header.lede}
      >
        <TextLink href={page.header.link.href} className="inline-flex min-h-11 items-center gap-2 text-body">
          <span>{page.header.link.label}</span>
          <ArrowIcon />
        </TextLink>
      </PageHeader>

      <section id="pricing" aria-label="Plans" className="border-b border-line pb-12 lg:pb-16">
        <Container>
          {plans.length === 0 ? (
            // No plans came back (none published, or the database could not be reached): say so
            // plainly rather than show prices from anywhere else. The custom package still stands.
            <p role="status" className="mb-4 max-w-[40rem] text-body text-pretty text-ink-soft lg:mb-5">
              {page.plans.emptyState.beforeEmail} <EmailLink email={content.contactEmail} /> {page.plans.emptyState.afterEmail}
            </p>
          ) : null}
          <ul className="grid grid-cols-1 gap-4 lg:gap-5 xl:auto-rows-[auto_auto_auto_1fr_auto] xl:grid-cols-3">
            {plans.map((plan, index) => (
              <PricingCard key={plan.id} plan={plan} index={index} />
            ))}
            <CustomPlanCard content={page.plans.custom} services={content.services} />
          </ul>
        </Container>
      </section>

      <ServiceSection id={page.billing.anchor} ruled={false} title={page.billing.title} intro={page.billing.intro}>
        {/* The short version of the terms page's own positions (page:/terms); change both together. */}
        <TextGrid items={page.billing.items} />
        <Reveal>
          <p className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-8">
            {page.billing.links.map((link) => (
              <TextLink key={link.href} href={link.href} className="inline-flex min-h-11 items-center gap-2 text-body">
                <span>{link.label}</span>
                <ArrowIcon />
              </TextLink>
            ))}
          </p>
        </Reveal>
      </ServiceSection>

      <ServiceSection id={page.otherServices.anchor} title={page.otherServices.title} intro={page.otherServices.intro}>
        <LinkList items={content.otherServices} />
      </ServiceSection>
    </>
  );
}
