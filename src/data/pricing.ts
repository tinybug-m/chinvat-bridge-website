import { createClient } from "@/lib/supabase/server";

export type PlanId = string;

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

/** All subscription plans shown on /pricing, ordered for display. */
export async function getPlans(): Promise<PricingPlan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("plans").select("*").order("sort_order");

  if (error || !data) {
    console.error("Failed to load plans:", error);
    return [];
  }

  return data.map(mapRow);
}

export async function getPlanById(planId: string): Promise<PricingPlan | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("plans").select("*").eq("id", planId).maybeSingle();

  if (error || !data) {
    return undefined;
  }

  return mapRow(data);
}
