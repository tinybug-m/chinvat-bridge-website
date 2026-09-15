-- Adds the two engagement-summary fields the dashboard is missing next to plan/company/domain/status.
alter table public.customers
  add column if not exists next_billing_date text,
  add column if not exists practice_lead text;

-- Current sprint items: a short table of in-flight deliverables (title, detail, status, date)
-- for a client's current billing cycle, written by hand via the Supabase dashboard.
create table if not exists public.customer_sprint_items (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  title text not null,
  detail text not null,
  status text not null,
  item_date text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.customer_sprint_items is 'Current-cycle deliverable rows for a client, written by hand in the Supabase dashboard.';

create index if not exists customer_sprint_items_customer_id_idx
  on public.customer_sprint_items (customer_id, sort_order);

alter table public.customer_sprint_items enable row level security;

create policy "Customers can view their own sprint items"
  on public.customer_sprint_items
  for select
  using (auth.uid() = customer_id);

create trigger customer_sprint_items_set_updated_at
  before update on public.customer_sprint_items
  for each row
  execute function public.set_updated_at();
