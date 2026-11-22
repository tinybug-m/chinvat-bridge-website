-- Shared, atomic rate limiting (first user: the contact form, src/lib/rate-limit.ts).
-- Fixed windows. Each bucket key is an HMAC of the client address computed by the server, so no
-- IP address is stored. One INSERT ... ON CONFLICT DO UPDATE takes the row lock, so concurrent
-- requests from any number of server instances are counted one after another, never lost.
create table if not exists public.rate_limit_buckets (
  bucket text primary key check (char_length(bucket) between 1 and 128),
  window_started_at timestamptz not null,
  hits integer not null check (hits >= 1)
);

comment on table public.rate_limit_buckets is
  'Fixed-window request counters keyed by an HMAC of the client address. Server-only (service role).';

alter table public.rate_limit_buckets enable row level security;
revoke all on table public.rate_limit_buckets from anon, authenticated;

create index if not exists rate_limit_buckets_window_started_at_idx
  on public.rate_limit_buckets (window_started_at);

-- Counts one hit and answers whether it is within the limit (true = allowed).
create or replace function public.consume_rate_limit(p_bucket text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_hits integer;
  v_now timestamptz := clock_timestamp();
  v_window interval;
begin
  if p_bucket is null or char_length(p_bucket) not between 1 and 128
     or p_limit is null or p_limit < 1
     or p_window_seconds is null or p_window_seconds < 1 or p_window_seconds > 7 * 86400 then
    raise exception 'consume_rate_limit: invalid arguments' using errcode = '22023';
  end if;
  v_window := make_interval(secs => p_window_seconds);

  insert into public.rate_limit_buckets as b (bucket, window_started_at, hits)
  values (p_bucket, v_now, 1)
  on conflict (bucket) do update
    set window_started_at = case when b.window_started_at <= v_now - v_window then v_now else b.window_started_at end,
        hits = case when b.window_started_at <= v_now - v_window then 1 else least(b.hits, 2147483646) + 1 end
  returning hits into v_hits;

  -- Opportunistic cleanup of long-finished windows; cheap with the index above.
  if random() < 0.02 then
    delete from public.rate_limit_buckets where window_started_at < v_now - interval '8 days';
  end if;

  return v_hits <= p_limit;
end;
$$;

comment on function public.consume_rate_limit(text, integer, integer) is
  'Atomically counts one hit in a fixed window and returns true while the bucket is within p_limit. Service role only.';

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
