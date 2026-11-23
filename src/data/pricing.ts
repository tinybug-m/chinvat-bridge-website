import { cache } from "react";
import { unstable_cache } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";

export type PlanId = string;

export interface PlanSpec {
  label: string;
  value: string;
  /** Highlights the value in gold — used for standout inclusions. */
  emphasized?: boolean;
}

export interface PricingPlan {
  id: PlanId;
  /** Short descriptive line from plans.tier_label. Not rendered; never a decorative number. */
  tierLabel: string;
  name: string;
  priceLabel: string;
  billingPeriod: string;
  description: string;
  specs: PlanSpec[];
  capabilitiesLabel: string;
  capabilities: string[];
  highlighted?: boolean;
  stripePriceId: string | null;
}

interface PlanRow {
  id: string;
  tier_label: string;
  name: string;
  price_label: string;
  billing_period: string;
  description: string;
  specs: unknown;
  capabilities_label: string;
  capabilities: unknown;
  highlighted: boolean;
  stripe_price_id: string | null;
}

function mapRow(row: PlanRow): PricingPlan {
  return {
    id: row.id,
    tierLabel: row.tier_label,
    name: row.name,
    priceLabel: row.price_label,
    billingPeriod: row.billing_period,
    description: row.description,
    specs: (row.specs ?? []) as PlanSpec[],
    capabilitiesLabel: row.capabilities_label,
    capabilities: (row.capabilities ?? []) as string[],
    highlighted: row.highlighted,
    stripePriceId: row.stripe_price_id,
  };
}

/** How long a cached plan list may be served before it is re-read (on-demand: tag `plans`). */
const PLANS_REVALIDATE_SECONDS = 3600;

/**
 * One cookie-free anon read of every plan, cached across requests under the tag `plans`, so
 * /pricing renders statically and refreshes without a deploy (revalidateTag("plans", "max"), or
 * within an hour). A failed read throws instead of returning an empty list, so an empty catalogue
 * is never cached and a regenerating page keeps its last good version.
 */
const readPlans = unstable_cache(
  async (): Promise<PricingPlan[]> => {
    const { data, error } = await createPublicClient().from("plans").select("*").order("sort_order");
    if (error || !data) throw new Error(`plans read failed (${error?.code ?? "no data"})`);
    return data.map(mapRow);
  },
  ["plans:v1"],
  { tags: ["plans"], revalidate: PLANS_REVALIDATE_SECONDS }
);

/**
 * All subscription plans shown on /pricing, ordered for display. In production a failed read
 * throws (see readPlans); development returns an empty list so the page shows its no-plans state.
 */
export const getPlans = cache(async (): Promise<PricingPlan[]> => {
  try {
    return await readPlans();
  } catch (error) {
    unstable_rethrow(error);
    if (process.env.NODE_ENV === "production") throw error;
    console.error("Failed to load plans:", error instanceof Error ? error.message : error);
    return [];
  }
});

/** One plan by id, from the same cached list. Undefined when it does not exist or cannot be read. */
export const getPlanById = cache(async (planId: string): Promise<PricingPlan | undefined> => {
  try {
    return (await readPlans()).find((plan) => plan.id === planId);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Failed to load plan:", error instanceof Error ? error.message : error);
    return undefined;
  }
});
