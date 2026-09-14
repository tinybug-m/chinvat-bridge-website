-- Customer progress items: real, per-client progress metrics (e.g. "Content Assets: 6 / 15
-- Completed") shown as a stepped progress bar on that client's dashboard. Written by hand via
-- the Supabase dashboard's table editor — no insert/update/delete policies are granted to
-- clients, only their own-row read access.
create table if not exists public.customer_progress_items (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  label text not null,
  status_label text not null,
  percent_label text not null,
  total_steps int not null default 1,
  completed_steps int not null default 0,
  note text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.customer_progress_items is 'Real per-client progress metrics (e.g. content assets completed), written by hand in the Supabase dashboard and shown on that client''s dashboard.';

create index if not exists customer_progress_items_customer_id_idx
  on public.customer_progress_items (customer_id, sort_order);

alter table public.customer_progress_items enable row level security;

create policy "Customers can view their own progress items"
  on public.customer_progress_items
  for select
  using (auth.uid() = customer_id);

create trigger customer_progress_items_set_updated_at
  before update on public.customer_progress_items
  for each row
  execute function public.set_updated_at();
