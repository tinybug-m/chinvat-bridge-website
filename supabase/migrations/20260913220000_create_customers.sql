-- Customers: one row per subscribed client, linked to their Supabase auth account.
create table if not exists public.customers (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  company_name text,
  phone text,
  website text,
  country text,
  target_market text,
  improvements text,
  plan_id text not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.customers is 'One row per subscribed SEO client, created from a completed Stripe checkout.';

create unique index if not exists customers_stripe_subscription_id_key
  on public.customers (stripe_subscription_id)
  where stripe_subscription_id is not null;

alter table public.customers enable row level security;

-- Each client can only ever see their own record.
create policy "Customers can view their own record"
  on public.customers
  for select
  using (auth.uid() = id);

-- All writes happen server-side via the service role key (webhook, checkout flow),
-- which bypasses RLS entirely — no insert/update/delete policies are granted to clients.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger customers_set_updated_at
  before update on public.customers
  for each row
  execute function public.set_updated_at();
