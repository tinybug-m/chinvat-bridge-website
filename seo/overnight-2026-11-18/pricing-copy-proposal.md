# /pricing copy proposal

**For owner approval. Nothing here has been applied.** Plan text lives in the production `plans` table (edited by hand in the Supabase dashboard, per its migration comment). **Prices are not changed.** Only wording, which [the on-page audit](04-on-page-audit.md#pricing) found contradictory or unclear.

## What's wrong now (as live on 18 Nov 2026)

| Plan | Issue |
|---|---|
| Starter | Spec "Technical SEO audit: Basic", but the capability list promises "Full technical SEO audit & continuous remediation" |
| All | Capability headings "Core Protocols", "Expanded Capability", "Full Scope" say nothing to a buyer |
| All | "8 / 15 / 35 assets / mo" with no definition of an asset |
| Growth | "content velocity", "dynamic schema engineering" |
| Scale | "Enterprise-grade positioning", "Bespoke SEO automation & schema pipelines", "Dedicated senior SEO consultant": claims to keep only if literally true for a small firm |
| All | No statement on VAT |

## Proposed wording

The owner must fill in the **[brackets]**; they are facts only the owner knows.

### Starter (£299 / month, unchanged)
- **Description:** "Technical foundations, on-page optimisation and steady content for a focused business in a defined market."
- **Specs:** Content: "[8] pieces / mo" · Keyword research: Included · Technical SEO audit: "Initial audit + monthly fixes" · On-page SEO: Included · Content strategy: Core · Competitor analysis: Core · Link building: — · Monthly report: Included · Support: Email
- **Capabilities label:** "Also included"
- **Capabilities:** "Technical fixes as issues arise" · "Core Web Vitals monitoring" · "Structured data on key pages"

### Growth (£499 / month, unchanged)
- **Description:** "Everything in Starter, with a full audit, more content, competitor research and link building through digital PR."
- **Specs:** Content: "[15] pieces / mo" · Keyword research: Advanced · Technical SEO audit: Full audit · On-page SEO: Included · Content strategy: Advanced · Competitor analysis: Included · Link building: 1 campaign / mo · Monthly report: Included · Support: Priority
- **Capabilities label:** "Adds"
- **Capabilities:** "Full crawl, site-structure and structured-data review" · "One digital PR or editorial outreach campaign each month" · "Strategy call every two weeks"

### Scale (£799 / month, unchanged)
- **Description:** "For larger or multi-market sites: the most content, two link-building campaigns a month, and international set-up."
- **Specs:** Content: "[35] pieces / mo" · Keyword research: Advanced · Technical SEO audit: Advanced · On-page SEO: Included · Content strategy: Full strategy · Competitor analysis: Ongoing · Link building: 2 campaigns / mo · Monthly report: Detailed · Support: "Priority, with a named lead"
- **Capabilities label:** "Adds"
- **Capabilities:** "Multi-region site structure and hreflang" · "Automated reporting and structured data at scale [keep only if delivered]" · "A named lead consultant [or: 'A senior consultant on every call', whichever is true]"

### Page-level additions (in code, `src/components/organisms/sections/Pricing.tsx`, when approved)
- Under the plans: **"Prices [exclude / include] VAT. Billed monthly; cancel with 30 days' notice."**
- A definition line: **"A ‘piece’ is [one optimised page or article of about N words / …]."**
- Under the custom card: **"AI, automation and software projects are quoted individually."** with links to the three service pages.

## SQL to apply after approval (Supabase SQL editor)

Fill in the brackets, then review the result on a preview deploy before production.

```sql
update public.plans set
  description = 'Technical foundations, on-page optimisation and steady content for a focused business in a defined market.',
  capabilities_label = 'Also included',
  capabilities = '["Technical fixes as issues arise", "Core Web Vitals monitoring", "Structured data on key pages"]'::jsonb,
  specs = jsonb_set(jsonb_set(specs, '{0,value}', '"[8] pieces / mo"'), '{2,value}', '"Initial audit + monthly fixes"')
where id = 'starter';

update public.plans set
  description = 'Everything in Starter, with a full audit, more content, competitor research and link building through digital PR.',
  capabilities_label = 'Adds',
  capabilities = '["Full crawl, site-structure and structured-data review", "One digital PR or editorial outreach campaign each month", "Strategy call every two weeks"]'::jsonb,
  specs = jsonb_set(specs, '{0,value}', '"[15] pieces / mo"')
where id = 'growth';

update public.plans set
  description = 'For larger or multi-market sites: the most content, two link-building campaigns a month, and international set-up.',
  capabilities_label = 'Adds',
  capabilities = '["Multi-region site structure and hreflang", "[Automated reporting and structured data at scale]", "[A named lead consultant]"]'::jsonb,
  specs = jsonb_set(jsonb_set(specs, '{0,value}', '"[35] pieces / mo"'), '{8,value}', '"Priority, with a named lead"')
where id = 'scale';
```

The `specs` array indexes (0 = Content, 2 = Technical SEO audit, 8 = Support) follow the seed in `supabase/migrations/20260915090000_create_plans_and_updates.sql`. Check them against the live rows first (`select id, specs from plans;`), in case they were edited by hand since.

## After applying

- Update the plan paragraph in the [SEO cost article](editorial/articles/how-much-does-seo-cost-uk.md#what-our-plans-cost) to match.
- Update the `/services/seo` FAQ "What is included in your SEO services?" if any inclusion changed.
