-- One database for the whole Chinvat Bridge system (ARCHITECTURE_DECISIONS D1, D3, D12).
--
-- This migration only creates the role and schema shells. The tables inside editorial/seo/ops/pgboss
-- belong to the SEO Automation repository's migrations, which run as seo_migrator.
--
-- Roles are NOLOGIN here. Login and passwords are granted out of band by an operator script, so no
-- credential ever lands in Git.

do $$
begin
  -- Owns the automation schemas and runs their migrations. Never used by a running service.
  if not exists (select 1 from pg_roles where rolname = 'seo_migrator') then
    create role seo_migrator nologin noinherit;
  end if;
  -- The Editorial API and UI: drafts, review, approval and publication.
  if not exists (select 1 from pg_roles where rolname = 'seo_api') then
    create role seo_api nologin noinherit;
  end if;
  -- Worker and scheduler: research, QA, usage, runs, queue. Cannot approve or publish.
  if not exists (select 1 from pg_roles where rolname = 'seo_worker') then
    create role seo_worker nologin noinherit;
  end if;
  -- Owns the public read functions; can read only what they need to return published content.
  if not exists (select 1 from pg_roles where rolname = 'content_reader') then
    create role content_reader nologin noinherit;
  end if;
end
$$;

-- postgres administers these roles (migrations, ownership changes) without being one of them at runtime.
grant seo_migrator, seo_api, seo_worker, content_reader to postgres;

create schema if not exists editorial authorization seo_migrator;
create schema if not exists seo authorization seo_migrator;
create schema if not exists ops authorization seo_migrator;
create schema if not exists pgboss authorization seo_migrator;

-- None of these schemas is exposed to the Data API, and none is reachable by the website's roles.
revoke all on schema editorial, seo, ops, pgboss from public, anon, authenticated;

-- Runtime roles resolve the automation's unqualified table names without any code change.
alter role seo_migrator set search_path = seo, editorial, ops, public;
alter role seo_api set search_path = seo, editorial, ops, public;
alter role seo_worker set search_path = seo, editorial, ops, public;

-- Runtime roles get nothing in public beyond what Postgres grants every role by default.
revoke create on schema public from seo_api, seo_worker, content_reader;

-- Statement timeouts keep a stuck query from holding one of the few pooled connections.
alter role seo_api set statement_timeout = '30s';
alter role seo_worker set statement_timeout = '120s';
alter role seo_api set idle_in_transaction_session_timeout = '60s';
alter role seo_worker set idle_in_transaction_session_timeout = '60s';

-- Database-backed administrators (D8). Seeded from ADMIN_EMAILS by scripts/db/seed-admins.mjs.
create table if not exists public.admin_users (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  created_by  text not null default current_user,
  note        text
);
alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;
grant select on table public.admin_users to authenticated;

-- RLS helper. SECURITY DEFINER with an empty search_path so callers cannot shadow admin_users.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

drop policy if exists "admins read admin list" on public.admin_users;
create policy "admins read admin list" on public.admin_users
  for select to authenticated using ((select public.is_admin()));

-- Advisor warning: set_updated_at had a mutable search_path.
alter function public.set_updated_at() set search_path = '';
