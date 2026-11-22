-- One-time post-checkout sign-in (src/lib/checkout-login.ts, src/app/auth/checkout-login/route.ts).
-- A row means "this Stripe Checkout Session's automatic sign-in has been used". The primary key
-- makes redemption atomic: concurrent inserts for the same session serialise on the unique index,
-- exactly one succeeds and every other gets a unique violation (23505), which the app treats as
-- "already redeemed". Only a SHA-256 of the session id is stored, never the id itself.
create table if not exists public.checkout_login_redemptions (
  session_hash text primary key check (session_hash ~ '^[0-9a-f]{64}$'),
  redeemed_at timestamptz not null default now()
);

comment on table public.checkout_login_redemptions is
  'Spent one-time post-checkout sign-ins, keyed by SHA-256 of the Stripe Checkout Session id. Written only by the server (service role).';

-- Server-only: RLS on with no policies, and no table privileges for the browser-facing roles.
alter table public.checkout_login_redemptions enable row level security;
revoke all on table public.checkout_login_redemptions from anon, authenticated;
