-- /pricing plan wording, per the owner's decisions of 21 Nov 2026. NOT APPLIED.
-- Run in the Supabase SQL editor against production `public.plans`, only after the owner approves.
--
-- Untouched: prices, Stripe price IDs, plan names, tier labels, sort order, the "Recommended" flag,
-- every spec row except Scale's audit, and the Content counts (8 / 15 / 35 "assets" / mo), which wait
-- for the owner's own definition.
--
-- Safety:
-- - Each UPDATE matches only if every field it overwrites still holds its original seeded value
--   (supabase/migrations/20260915090000_create_plans_and_updates.sql, which matched the live page on
--   21 Nov 2026).
-- - All three run inside one DO block. If any of them matches anything other than exactly one row, the
--   block raises an exception and none of the three changes is kept: the plans stay as they were.
-- - The SELECT at the end only reads. Run it on its own first to see the current wording, and again
--   afterwards to see the result.

do $$
declare
  changed integer;
begin
  -- Starter: audit stays "Basic"; the contradicting "Full technical SEO audit" line becomes ongoing fixes.
  update public.plans set
    description = 'Technical foundations, on-page optimisation and regular content for a business in a focused market.',
    capabilities_label = 'Also included',
    capabilities = '["Ongoing technical fixes", "Core Web Vitals & performance monitoring", "Schema markup implementation"]'::jsonb
  where id = 'starter'
    and description = 'Essential technical foundations and structured search visibility for focused businesses.'
    and capabilities_label = 'Core Protocols'
    and capabilities = '["Full technical SEO audit & continuous remediation", "Core Web Vitals & performance monitoring", "Schema markup implementation"]'::jsonb
    and specs->2 = '{"label": "Technical SEO audit", "value": "Basic"}'::jsonb;
  get diagnostics changed = row_count;
  if changed <> 1 then
    raise exception 'starter: expected 1 row with the original wording, matched %. Nothing was changed.', changed;
  end if;

  -- Growth: plain-English description and capability wording; no deliverable added or removed.
  update public.plans set
    description = 'Everything in Starter, plus a full technical audit, more content, competitor analysis and one link-building campaign a month.',
    capabilities_label = 'Adds',
    capabilities = '["Full crawl, site-structure and structured-data review", "Digital PR and editorial outreach to earn links", "Fortnightly strategy briefings"]'::jsonb
  where id = 'growth'
    and description = 'Comprehensive organic expansion combining technical architecture, content velocity and outreach.'
    and capabilities_label = 'Expanded Capability'
    and capabilities = '["Deep crawl architecture & dynamic schema engineering", "Targeted digital PR & editorial backlink acquisition", "Fortnightly strategy briefings"]'::jsonb;
  get diagnostics changed = row_count;
  if changed <> 1 then
    raise exception 'growth: expected 1 row with the original wording, matched %. Nothing was changed.', changed;
  end if;

  -- Scale: description without "Enterprise-grade"; audit "Advanced" -> "Full audit" (no additional scope is
  -- documented); "Dedicated senior SEO consultant" -> "Named lead consultant"; "Bespoke SEO automation &
  -- schema pipelines" removed (not a documented deliverable).
  update public.plans set
    description = 'For larger or multi-market sites: the most content, two link-building campaigns a month, and multi-region set-up.',
    capabilities_label = 'Adds',
    capabilities = '["Multi-region site architecture & hreflang", "Named lead consultant"]'::jsonb,
    specs = jsonb_set(specs, '{2,value}', '"Full audit"')
  where id = 'scale'
    and description = 'Enterprise-grade positioning, international architecture, and bespoke content and outreach.'
    and capabilities_label = 'Full Scope'
    and capabilities = '["Multi-region site architecture & hreflang", "Bespoke SEO automation & schema pipelines", "Dedicated senior SEO consultant"]'::jsonb
    and specs->2 = '{"label": "Technical SEO audit", "value": "Advanced"}'::jsonb;
  get diagnostics changed = row_count;
  if changed <> 1 then
    raise exception 'scale: expected 1 row with the original wording, matched %. Nothing was changed.', changed;
  end if;
end
$$;

-- Read-only: the three plans' wording as it now stands.
select id, description, specs->2->>'value' as audit, specs->0->>'value' as content, capabilities_label, capabilities
from public.plans
order by sort_order;
