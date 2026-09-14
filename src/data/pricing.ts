export type PlanId = "starter" | "growth" | "scale";

export interface PlanSpec {
  label: string;
  value: string;
  /** Highlights the value in gold — used for standout inclusions. */
  emphasized?: boolean;
}

export interface PricingPlan {
  id: PlanId;
  tierLabel: string;
  name: string;
  priceLabel: string;
  billingPeriod: string;
  description: string;
  specs: PlanSpec[];
  capabilitiesLabel: string;
  capabilities: string[];
  highlighted?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    tierLabel: "Tier I",
    name: "Starter",
    priceLabel: "£299",
    billingPeriod: "/month",
    description: "Essential technical foundations and structured search visibility for focused businesses.",
    specs: [
      { label: "Content", value: "8 assets / mo" },
      { label: "Keyword research", value: "Included", emphasized: true },
      { label: "Technical SEO audit", value: "Basic" },
      { label: "On-page SEO", value: "Included", emphasized: true },
      { label: "Content strategy", value: "Basic" },
      { label: "Competitor analysis", value: "Basic" },
      { label: "Link building", value: "—" },
      { label: "Monthly report", value: "Included", emphasized: true },
      { label: "Support", value: "Email" },
    ],
    capabilitiesLabel: "Core Protocols",
    capabilities: [
      "Full technical SEO audit & continuous remediation",
      "Core Web Vitals & performance monitoring",
      "Schema markup implementation",
    ],
  },
  {
    id: "growth",
    tierLabel: "Tier II",
    name: "Growth",
    priceLabel: "£499",
    billingPeriod: "/month",
    description:
      "Comprehensive organic expansion combining technical architecture, content velocity and outreach.",
    specs: [
      { label: "Content", value: "15 assets / mo" },
      { label: "Keyword research", value: "Advanced", emphasized: true },
      { label: "Technical SEO audit", value: "Full audit" },
      { label: "On-page SEO", value: "Included", emphasized: true },
      { label: "Content strategy", value: "Advanced" },
      { label: "Competitor analysis", value: "Included", emphasized: true },
      { label: "Link building", value: "1 campaign / mo", emphasized: true },
      { label: "Monthly report", value: "Included", emphasized: true },
      { label: "Support", value: "Priority", emphasized: true },
    ],
    capabilitiesLabel: "Expanded Capability",
    capabilities: [
      "Deep crawl architecture & dynamic schema engineering",
      "Targeted digital PR & editorial backlink acquisition",
      "Fortnightly strategy briefings",
    ],
    highlighted: true,
  },
  {
    id: "scale",
    tierLabel: "Tier III",
    name: "Scale",
    priceLabel: "£799",
    billingPeriod: "/month",
    description:
      "Enterprise-grade positioning, international architecture, and bespoke content and outreach.",
    specs: [
      { label: "Content", value: "35 assets / mo" },
      { label: "Keyword research", value: "Advanced" },
      { label: "Technical SEO audit", value: "Advanced" },
      { label: "On-page SEO", value: "Included", emphasized: true },
      { label: "Content strategy", value: "Full strategy" },
      { label: "Competitor analysis", value: "Advanced / ongoing" },
      { label: "Link building", value: "2 campaigns / mo" },
      { label: "Monthly report", value: "Detailed", emphasized: true },
      { label: "Support", value: "Priority + lead", emphasized: true },
    ],
    capabilitiesLabel: "Full Scope",
    capabilities: [
      "Multi-region site architecture & hreflang",
      "Bespoke SEO automation & schema pipelines",
      "Dedicated senior SEO consultant",
    ],
  },
];

export function getPlanById(planId: string): PricingPlan | undefined {
  return PRICING_PLANS.find((plan) => plan.id === planId);
}

/**
 * Maps each plan to its Stripe Price ID via environment variable.
 * Set these in .env.local once the corresponding test/live Products exist in Stripe.
 */
export function getStripePriceId(planId: PlanId): string | undefined {
  const envKeyByPlan: Record<PlanId, string | undefined> = {
    starter: process.env.STRIPE_PRICE_ID_STARTER,
    growth: process.env.STRIPE_PRICE_ID_GROWTH,
    scale: process.env.STRIPE_PRICE_ID_SCALE,
  };

  return envKeyByPlan[planId];
}
