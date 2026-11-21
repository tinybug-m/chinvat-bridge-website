-- /pricing plan wording: proposed replacement. NOT APPLIED. For the owner to approve, then run in the
-- Supabase SQL editor (production `public.plans`). Prices, Stripe price IDs and plan names are untouched.
--
-- Why: the live page contradicts itself (Starter "Technical SEO audit: Basic" beside "Full technical SEO
-- audit & continuous remediation"), never says what an "asset" is, and uses labels a buyer can't
-- read ("Core Protocols", "content velocity", "Enterprise-grade positioning"). The published SEO cost
-- guide warns that "very high volumes at very low prices usually mean thin or generic content", which
-- reads against 35 undefined assets for £799. Background: seo/overnight-2026-11-18/pricing-copy-proposal.md.
--
-- Before running: `select id, description, specs, capabilities_label, capabilities from public.plans order by sort_order;`
-- and check the specs indexes below against the live rows (seeded order: 0 Content, 2 Technical SEO
-- audit, 8 Support), in case they were edited by hand.

begin;

-- ---------------------------------------------------------------------------------------------
-- Part 1: wording only. Says the same things in plain English; adds and removes no deliverable.
-- ---------------------------------------------------------------------------------------------

update public.plans set
  description = 'Technical foundations, on-page optimisation and regular content for a business in a focused market.',
  capabilities_label = 'Also included'
where id = 'starter';

update public.plans set
  description = 'Everything in Starter, plus a full technical audit, more content, competitor analysis and one link-building campaign a month.',
  capabilities_label = 'Adds',
  capabilities = '["Full crawl, site-structure and structured-data review", "Digital PR and editorial outreach to earn links", "Fortnightly strategy briefings"]'::jsonb
where id = 'growth';

update public.plans set
  description = 'For larger or multi-market sites: the most content, two link-building campaigns a month, and multi-region set-up.',
  capabilities_label = 'Adds'
where id = 'scale';

-- ---------------------------------------------------------------------------------------------
-- Part 2: needs the owner's facts. Leave commented out until each [bracket] is decided.
-- ---------------------------------------------------------------------------------------------

-- A. What one unit of content is. Replace "assets" everywhere with the real unit, e.g. "articles",
--    "optimised pages or articles". The counts 8 / 15 / 35 stay unless you change them.
-- update public.plans set specs = jsonb_set(specs, '{0,value}', '"8 [articles] / mo"')  where id = 'starter';
-- update public.plans set specs = jsonb_set(specs, '{0,value}', '"15 [articles] / mo"') where id = 'growth';
-- update public.plans set specs = jsonb_set(specs, '{0,value}', '"35 [articles] / mo"') where id = 'scale';

-- B. Starter's audit. Pick the one that is true.
--    B1, a basic audit (keeps Growth's "Full audit" as the step up):
-- update public.plans set
--   specs = jsonb_set(specs, '{2,value}', '"Initial audit + ongoing fixes"'),
--   capabilities = '["Technical fixes as issues arise", "Core Web Vitals & performance monitoring", "Schema markup implementation"]'::jsonb
-- where id = 'starter';
--    B2, a full audit (then Growth's audit row no longer differs from Starter's):
-- update public.plans set specs = jsonb_set(specs, '{2,value}', '"Full audit"') where id = 'starter';

-- C. Scale's people promise. Keep "Dedicated senior SEO consultant" only if a named senior person is
--    assigned to each Scale client. Otherwise:
-- update public.plans set
--   capabilities = '["Multi-region site architecture & hreflang", "[Automated reporting and structured data at scale]", "[A named lead consultant]"]'::jsonb,
--   specs = jsonb_set(specs, '{8,value}', '"Priority, with a named lead"')
-- where id = 'scale';
--    and keep "Bespoke SEO automation & schema pipelines" (here reworded as "Automated reporting and
--    structured data at scale") only if it is delivered; otherwise drop that item.

commit;

-- Afterwards: the page needs one code change to define the unit under the plans (Pricing.tsx), and the
-- SEO cost guide's "What our plans cost" paragraph should name the same unit. Both are prepared once
-- A is decided; see SEO_REMEDIATION_REGISTER.md.
