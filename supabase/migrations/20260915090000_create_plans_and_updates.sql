-- Plans: subscription tiers shown on /pricing and used to create Stripe checkout sessions.
-- Publicly readable (pricing is public info); managed by hand via the Supabase dashboard's
-- table editor, not through the app — no insert/update/delete policies are granted here.
create table if not exists public.plans (
  id text primary key,
  tier_label text not null,
  name text not null,
  price_label text not null,
  billing_period text not null,
  description text not null,
  specs jsonb not null default '[]'::jsonb,
  capabilities_label text not null,
  capabilities jsonb not null default '[]'::jsonb,
  highlighted boolean not null default false,
  stripe_price_id text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.plans is 'Subscription plan catalog shown on /pricing. Edited by hand in the Supabase dashboard.';

alter table public.plans enable row level security;

create policy "Plans are publicly readable"
  on public.plans
  for select
  using (true);

create trigger plans_set_updated_at
  before update on public.plans
  for each row
  execute function public.set_updated_at();

insert into public.plans (id, tier_label, name, price_label, billing_period, description, specs, capabilities_label, capabilities, highlighted, stripe_price_id, sort_order)
values
  (
    'starter', 'Tier I', 'Starter', '£299', '/month',
    'Essential technical foundations and structured search visibility for focused businesses.',
    '[
      {"label": "Content", "value": "8 assets / mo"},
      {"label": "Keyword research", "value": "Included", "emphasized": true},
      {"label": "Technical SEO audit", "value": "Basic"},
      {"label": "On-page SEO", "value": "Included", "emphasized": true},
      {"label": "Content strategy", "value": "Basic"},
      {"label": "Competitor analysis", "value": "Basic"},
      {"label": "Link building", "value": "—"},
      {"label": "Monthly report", "value": "Included", "emphasized": true},
      {"label": "Support", "value": "Email"}
    ]'::jsonb,
    'Core Protocols',
    '["Full technical SEO audit & continuous remediation", "Core Web Vitals & performance monitoring", "Schema markup implementation"]'::jsonb,
    false, 'price_1UFVhkRqQ4us3gclvLFhMlOX', 1
  ),
  (
    'growth', 'Tier II', 'Growth', '£499', '/month',
    'Comprehensive organic expansion combining technical architecture, content velocity and outreach.',
    '[
      {"label": "Content", "value": "15 assets / mo"},
      {"label": "Keyword research", "value": "Advanced", "emphasized": true},
      {"label": "Technical SEO audit", "value": "Full audit"},
      {"label": "On-page SEO", "value": "Included", "emphasized": true},
      {"label": "Content strategy", "value": "Advanced"},
      {"label": "Competitor analysis", "value": "Included", "emphasized": true},
      {"label": "Link building", "value": "1 campaign / mo", "emphasized": true},
      {"label": "Monthly report", "value": "Included", "emphasized": true},
      {"label": "Support", "value": "Priority", "emphasized": true}
    ]'::jsonb,
    'Expanded Capability',
    '["Deep crawl architecture & dynamic schema engineering", "Targeted digital PR & editorial backlink acquisition", "Fortnightly strategy briefings"]'::jsonb,
    true, 'price_1UFW1qRqQ4us3gclf0r2rK9a', 2
  ),
  (
    'scale', 'Tier III', 'Scale', '£799', '/month',
    'Enterprise-grade positioning, international architecture, and bespoke content and outreach.',
    '[
      {"label": "Content", "value": "35 assets / mo"},
      {"label": "Keyword research", "value": "Advanced"},
      {"label": "Technical SEO audit", "value": "Advanced"},
      {"label": "On-page SEO", "value": "Included", "emphasized": true},
      {"label": "Content strategy", "value": "Full strategy"},
      {"label": "Competitor analysis", "value": "Advanced / ongoing"},
      {"label": "Link building", "value": "2 campaigns / mo"},
      {"label": "Monthly report", "value": "Detailed", "emphasized": true},
      {"label": "Support", "value": "Priority + lead", "emphasized": true}
    ]'::jsonb,
    'Full Scope',
    '["Multi-region site architecture & hreflang", "Bespoke SEO automation & schema pipelines", "Dedicated senior SEO consultant"]'::jsonb,
    false, 'price_1UFW27RqQ4us3gcljQVwyYL9', 3
  )
on conflict (id) do nothing;

-- Customer updates: a timestamped log of real work/progress notes for a client, written by
-- hand via the Supabase dashboard and shown on that client's dashboard under Reports & Archive.
create table if not exists public.customer_updates (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

comment on table public.customer_updates is 'Work/progress updates posted for a client, written by hand in the Supabase dashboard.';

create index if not exists customer_updates_customer_id_idx
  on public.customer_updates (customer_id, created_at desc);

alter table public.customer_updates enable row level security;

-- Each client can only ever see their own updates. All writes happen by hand via the
-- Supabase dashboard (service role), so no insert/update/delete policies are granted here.
create policy "Customers can view their own updates"
  on public.customer_updates
  for select
  using (auth.uid() = customer_id);
