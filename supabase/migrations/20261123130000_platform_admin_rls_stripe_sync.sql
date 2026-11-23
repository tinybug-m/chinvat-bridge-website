-- Website platform (stream W4): database-backed admin access, Stripe event idempotency and
-- monotonic subscription state, browser-role grant hardening, and plan labels without numbering.
-- Additive apart from the tier_label wording; safe to re-run.

-- ---------------------------------------------------------------------------------------------
-- 1. Browser roles: only what Row Level Security is meant to arbitrate.
--    Supabase's default privileges give anon/authenticated every table privilege; RLS was the only
--    barrier. anon never writes; authenticated writes only through the admin policies below, and on
--    customers only the three columns /admin edits.
-- ---------------------------------------------------------------------------------------------
revoke truncate, references, trigger on
  public.customers, public.customer_updates, public.customer_progress_items, public.customer_sprint_items, public.plans
  from anon, authenticated;
revoke insert, update, delete on
  public.customers, public.customer_updates, public.customer_progress_items, public.customer_sprint_items, public.plans
  from anon;
revoke insert, update, delete on public.customers, public.plans from authenticated;
grant update (status, next_billing_date, practice_lead) on public.customers to authenticated;

-- ---------------------------------------------------------------------------------------------
-- 2. Admin policies. public.is_admin() (migration 20261123120000) reads public.admin_users for the
--    caller's own auth.uid(). requireAdmin() and these policies give the same answer.
-- ---------------------------------------------------------------------------------------------
drop policy if exists "Admins can view every customer" on public.customers;
create policy "Admins can view every customer" on public.customers
  for select to authenticated using ((select public.is_admin()));

drop policy if exists "Admins can update customers" on public.customers;
create policy "Admins can update customers" on public.customers
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Admins manage progress items" on public.customer_progress_items;
create policy "Admins manage progress items" on public.customer_progress_items
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Admins manage sprint items" on public.customer_sprint_items;
create policy "Admins manage sprint items" on public.customer_sprint_items
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Admins manage updates" on public.customer_updates;
create policy "Admins manage updates" on public.customer_updates
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- admin_users stays read-only to the browser (existing "admins read admin list" policy); it is
-- written only by scripts/db/seed-admins.mjs with the service role.
revoke insert, update, delete, truncate, references, trigger on public.admin_users from authenticated;
comment on table public.admin_users is
  'Administrators of /admin. Seeded from ADMIN_EMAILS by scripts/db/seed-admins.mjs (service role only); read by public.is_admin().';

-- ---------------------------------------------------------------------------------------------
-- 3. Customer subscription state, as last read from Stripe.
-- ---------------------------------------------------------------------------------------------
alter table public.customers
  add column if not exists stripe_subscription_status text,
  add column if not exists stripe_current_period_end timestamptz,
  add column if not exists stripe_cancel_at_period_end boolean,
  add column if not exists stripe_synced_at timestamptz;

comment on column public.customers.status is
  'Portal status derived from the Stripe subscription: active, past_due, cancelled, pending (first payment not complete) or paused.';
comment on column public.customers.stripe_subscription_status is 'Stripe''s own subscription status at stripe_synced_at.';
comment on column public.customers.stripe_synced_at is
  'When the stored subscription state was read from Stripe. Writes with an older reading are refused (apply_stripe_subscription_state).';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'customers_status_check' and conrelid = 'public.customers'::regclass) then
    alter table public.customers add constraint customers_status_check
      check (status in ('active', 'past_due', 'cancelled', 'pending', 'paused')) not valid;
    alter table public.customers validate constraint customers_status_check;
  end if;
end
$$;

-- Applies a subscription state read from Stripe at p_observed_at, never going backwards:
--  * 'stale'     the row already holds a later reading;
--  * 'terminal'  the subscription is already ended (canceled / incomplete_expired) and this reading
--                is not: Stripe never revives an ended subscription, so an old event cannot either;
--  * 'not_found' no customer row holds this subscription yet;
--  * 'applied'   written.
-- The row lock makes concurrent deliveries serialise on the same customer.
create or replace function public.apply_stripe_subscription_state(
  p_subscription_id text,
  p_stripe_status text,
  p_status text,
  p_current_period_end timestamptz,
  p_cancel_at_period_end boolean,
  p_observed_at timestamptz
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
  v_synced_at timestamptz;
  v_stripe_status text;
begin
  if p_subscription_id is null or p_stripe_status is null or p_status is null or p_observed_at is null then
    raise exception 'apply_stripe_subscription_state: invalid arguments' using errcode = '22023';
  end if;

  select c.id, c.stripe_synced_at, c.stripe_subscription_status
    into v_id, v_synced_at, v_stripe_status
    from public.customers c
   where c.stripe_subscription_id = p_subscription_id
     for update;
  if not found then
    return 'not_found';
  end if;
  if v_synced_at is not null and v_synced_at > p_observed_at then
    return 'stale';
  end if;
  if v_stripe_status in ('canceled', 'incomplete_expired') and p_stripe_status not in ('canceled', 'incomplete_expired') then
    return 'terminal';
  end if;

  update public.customers
     set status = p_status,
         stripe_subscription_status = p_stripe_status,
         stripe_current_period_end = p_current_period_end,
         stripe_cancel_at_period_end = p_cancel_at_period_end,
         stripe_synced_at = p_observed_at
   where id = v_id;
  return 'applied';
end;
$$;
revoke all on function public.apply_stripe_subscription_state(text, text, text, timestamptz, boolean, timestamptz)
  from public, anon, authenticated;
grant execute on function public.apply_stripe_subscription_state(text, text, text, timestamptz, boolean, timestamptz)
  to service_role;

-- ---------------------------------------------------------------------------------------------
-- 4. Stripe webhook idempotency: one row per Stripe event id.
-- ---------------------------------------------------------------------------------------------
create table if not exists public.stripe_events (
  id text primary key check (id ~ '^evt_[A-Za-z0-9_]{1,250}$'),
  type text not null check (char_length(type) between 1 and 200),
  livemode boolean not null,
  stripe_created_at timestamptz not null,
  received_at timestamptz not null default now(),
  attempts integer not null default 1 check (attempts >= 1),
  locked_until timestamptz,
  processed_at timestamptz,
  outcome text check (outcome is null or char_length(outcome) <= 200),
  last_error text check (last_error is null or char_length(last_error) <= 200)
);
comment on table public.stripe_events is
  'Stripe webhook events received, by event id. processed_at set = handled; a redelivery is acknowledged without reprocessing. Service role only.';

alter table public.stripe_events enable row level security;
revoke all on table public.stripe_events from anon, authenticated;
create index if not exists stripe_events_unprocessed_idx on public.stripe_events (received_at) where processed_at is null;

-- Claims an event for processing. Returns 'process' (this caller handles it now), 'duplicate'
-- (already handled) or 'busy' (another delivery holds a fresh lease; Stripe should retry).
create or replace function public.begin_stripe_event(
  p_id text, p_type text, p_livemode boolean, p_created timestamptz, p_lease_seconds integer default 120
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_processed timestamptz;
  v_locked timestamptz;
begin
  if p_lease_seconds is null or p_lease_seconds < 1 or p_lease_seconds > 900 then
    raise exception 'begin_stripe_event: invalid lease' using errcode = '22023';
  end if;

  insert into public.stripe_events (id, type, livemode, stripe_created_at, locked_until)
  values (p_id, p_type, p_livemode, p_created, v_now + make_interval(secs => p_lease_seconds))
  on conflict (id) do nothing;
  if found then
    return 'process';
  end if;

  select processed_at, locked_until into v_processed, v_locked from public.stripe_events where id = p_id for update;
  if v_processed is not null then
    return 'duplicate';
  end if;
  if v_locked is not null and v_locked > v_now then
    return 'busy';
  end if;
  update public.stripe_events
     set attempts = least(attempts, 2147483646) + 1,
         locked_until = v_now + make_interval(secs => p_lease_seconds)
   where id = p_id;
  return 'process';
end;
$$;

create or replace function public.finish_stripe_event(p_id text, p_outcome text)
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.stripe_events
     set processed_at = clock_timestamp(), locked_until = null, outcome = left(p_outcome, 200), last_error = null
   where id = p_id;
$$;

create or replace function public.fail_stripe_event(p_id text, p_error text)
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.stripe_events
     set locked_until = null, last_error = left(p_error, 200)
   where id = p_id and processed_at is null;
$$;

revoke all on function public.begin_stripe_event(text, text, boolean, timestamptz, integer) from public, anon, authenticated;
revoke all on function public.finish_stripe_event(text, text) from public, anon, authenticated;
revoke all on function public.fail_stripe_event(text, text) from public, anon, authenticated;
grant execute on function public.begin_stripe_event(text, text, boolean, timestamptz, integer) to service_role;
grant execute on function public.finish_stripe_event(text, text) to service_role;
grant execute on function public.fail_stripe_event(text, text) to service_role;

-- ---------------------------------------------------------------------------------------------
-- 5. plans.tier_label: "Tier I/II/III" is decorative numbering (project rule). The label is not
--    rendered (PricingCard identifies plans by id), so it becomes the plan's own name: no number, no
--    new claim, and harmless if a future design shows it. The check stops the pattern coming back.
-- ---------------------------------------------------------------------------------------------
update public.plans set tier_label = name where tier_label ~* '^\s*tier\s+[ivx0-9]+\s*$';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'plans_tier_label_not_numbered' and conrelid = 'public.plans'::regclass) then
    alter table public.plans add constraint plans_tier_label_not_numbered
      check (tier_label !~* '^\s*(tier|level|no\.?|#)?\s*([ivx]+|[0-9]+)\s*$');
  end if;
end
$$;
comment on column public.plans.tier_label is
  'Short label for the plan (currently its name). Never a decorative number such as "Tier I". Not rendered on /pricing.';
