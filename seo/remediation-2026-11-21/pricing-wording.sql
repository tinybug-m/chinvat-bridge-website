-- /pricing plan wording, per the owner's decisions of 21 Nov 2026. NOT APPLIED.
-- Run in the Supabase SQL editor against production `public.plans`, only after the owner approves.
--
-- Untouched: prices, Stripe price IDs, plan names, tier labels, sort order, the "Recommended" flag,
-- and the Content counts (8 / 15 / 35 "assets" / mo), which wait for the owner's own definition.
--
-- Every UPDATE matches on the seeded wording (supabase/migrations/20260915090000_create_plans_and_updates.sql),
-- so a row edited by hand since then is left alone (that statement changes nothing). The final SELECT shows
-- all three plans as they stand after the run; if any row still shows its old wording, it had been edited
-- by hand, and needs a look before anything else is done to it.

begin;

-- Starter: audit stays "Basic"; the contradicting "Full technical SEO audit" line becomes ongoing fixes.
update public.plans set
  description = 'Technical foundations, on-page optimisation and regular content for a business in a focused market.',
  capabilities_label = 'Also included',
  capabilities = '["Ongoing technical fixes", "Core Web Vitals & performance monitoring", "Schema markup implementation"]'::jsonb
where id = 'starter'
  and capabilities = '["Full technical SEO audit & continuous remediation", "Core Web Vitals & performance monitoring", "Schema markup implementation"]'::jsonb
  and specs->2 = '{"label": "Technical SEO audit", "value": "Basic"}'::jsonb;

-- Growth: plain-English description and capability wording; no deliverable added or removed.
update public.plans set
  description = 'Everything in Starter, plus a full technical audit, more content, competitor analysis and one link-building campaign a month.',
  capabilities_label = 'Adds',
  capabilities = '["Full crawl, site-structure and structured-data review", "Digital PR and editorial outreach to earn links", "Fortnightly strategy briefings"]'::jsonb
where id = 'growth'
  and capabilities = '["Deep crawl architecture & dynamic schema engineering", "Targeted digital PR & editorial backlink acquisition", "Fortnightly strategy briefings"]'::jsonb;

-- Scale: description without "Enterprise-grade"; audit "Advanced" -> "Full audit" (no additional scope is
-- documented); "Dedicated senior SEO consultant" -> "Named lead consultant"; "Bespoke SEO automation &
-- schema pipelines" removed (not a documented deliverable).
update public.plans set
  description = 'For larger or multi-market sites: the most content, two link-building campaigns a month, and multi-region set-up.',
  capabilities_label = 'Adds',
  capabilities = '["Multi-region site architecture & hreflang", "Named lead consultant"]'::jsonb,
  specs = jsonb_set(specs, '{2,value}', '"Full audit"')
where id = 'scale'
  and capabilities = '["Multi-region site architecture & hreflang", "Bespoke SEO automation & schema pipelines", "Dedicated senior SEO consultant"]'::jsonb
  and specs->2 = '{"label": "Technical SEO audit", "value": "Advanced"}'::jsonb;

-- Check before committing: three rows, wording as intended.
select id, description, specs->2->>'value' as audit, specs->0->>'value' as content, capabilities_label, capabilities
from public.plans order by sort_order;

commit;
