-- Explicit table privileges for the Data API roles.
--
-- The production project was created when Supabase granted anon/authenticated/service_role every
-- privilege on new public tables by default, so the site has worked by relying on those defaults.
-- Newer Supabase stacks (local, branches, restores) grant only TRUNCATE/REFERENCES/TRIGGER, which
-- leaves the same migrations producing a broken database there. This migration states exactly what
-- the application needs, so every environment ends up the same. Row Level Security still decides
-- which rows each role sees; these grants only decide which operations can be attempted.
--
-- Idempotent. In production it adds nothing that is not already granted; the narrowing of the old
-- blanket defaults happens in 20261123130000.

-- service_role: the server-side admin client (webhook, checkout sign-in, seeding). Bypasses RLS.
grant select, insert, update, delete on
  public.customers, public.plans, public.customer_updates, public.customer_progress_items,
  public.customer_sprint_items, public.admin_users, public.stripe_events,
  public.checkout_login_redemptions, public.rate_limit_buckets
  to service_role;

-- anon: public pricing only.
grant select on public.plans to anon;

-- authenticated: customers read their own rows; admins (public.is_admin()) read and manage the
-- portal tables through the policies in 20261123130000.
grant select on public.plans, public.customers, public.admin_users to authenticated;
grant update (status, next_billing_date, practice_lead) on public.customers to authenticated;
grant select, insert, update, delete on
  public.customer_updates, public.customer_progress_items, public.customer_sprint_items
  to authenticated;

-- Sequences behind any serial/identity columns the admin inserts use.
grant usage, select on all sequences in schema public to authenticated, service_role;
