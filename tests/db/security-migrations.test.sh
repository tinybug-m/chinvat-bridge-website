#!/usr/bin/env bash
# Validates the security migrations against a throwaway PostgreSQL 17 (Docker), including real
# concurrency: parallel redemptions of one checkout session and parallel rate-limit hits.
#   bash tests/db/security-migrations.test.sh
# Touches nothing but a temporary container; never connects to Supabase.
set -euo pipefail
cd "$(dirname "$0")/../.."
name="cb-sec-migrations-$$"
docker run -d --rm --name "$name" -e POSTGRES_PASSWORD=test postgres:17-bookworm >/dev/null
trap 'docker rm -f "$name" >/dev/null 2>&1 || true' EXIT
for _ in $(seq 1 60); do docker exec "$name" pg_isready -U postgres >/dev/null 2>&1 && break; sleep 0.5; done
sleep 1
psql() { docker exec -i "$name" psql -U postgres -v ON_ERROR_STOP=1 -qtA "$@"; }

# Supabase's API roles, so the grants/revokes in the migrations are exercised.
psql <<'SQL'
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
SQL
for f in supabase/migrations/20261122120000_checkout_login_redemptions.sql supabase/migrations/20261122121000_rate_limit_buckets.sql; do
  psql < "$f"
done
# Idempotent re-run of the table/function DDL (create if not exists / create or replace).
psql < supabase/migrations/20261122121000_rate_limit_buckets.sql

fail() { echo "FAIL: $*"; exit 1; }
hash=$(printf 'cs_test_x' | sha256sum | cut -d' ' -f1)

# 1. Concurrent redemption: 25 parallel inserts of the same session hash -> exactly one wins.
for i in $(seq 1 25); do
  (docker exec "$name" psql -U postgres -qtA -c "set role service_role; insert into public.checkout_login_redemptions(session_hash) values ('$hash');" >/dev/null 2>&1 && echo ok || echo dup) &
done | sort | uniq -c > /tmp/cb-redeem-$$.txt
wait
won=$(awk '$2=="ok"{print $1}' /tmp/cb-redeem-$$.txt); rm -f /tmp/cb-redeem-$$.txt
[ "${won:-0}" = "1" ] || fail "expected exactly 1 successful redemption, got ${won:-0}"
echo "ok - concurrent redemption: exactly one of 25 succeeded"

# 2. Browser roles cannot touch either table or the function.
for role in anon authenticated; do
  psql -c "set role $role; select count(*) from public.checkout_login_redemptions" >/dev/null 2>&1 && fail "$role can read redemptions"
  psql -c "set role $role; select public.consume_rate_limit('x', 1, 60)" >/dev/null 2>&1 && fail "$role can call consume_rate_limit"
  psql -c "set role $role; select count(*) from public.rate_limit_buckets" >/dev/null 2>&1 && fail "$role can read rate_limit_buckets"
done
echo "ok - anon/authenticated have no access"
psql -c "insert into public.checkout_login_redemptions(session_hash) values ('not-a-hash')" >/dev/null 2>&1 && fail "malformed hash accepted"
echo "ok - malformed session hash rejected"

# 3. Concurrent rate-limit hits: 40 parallel calls, limit 5 -> exactly 5 allowed.
for i in $(seq 1 40); do
  docker exec "$name" psql -U postgres -qtA -c "set role service_role; select public.consume_rate_limit('enquiry:10m:abc', 5, 600);" &
done > /tmp/cb-rl-$$.txt
wait
allowed=$(grep -c '^t$' /tmp/cb-rl-$$.txt || true); rm -f /tmp/cb-rl-$$.txt
[ "$allowed" = "5" ] || fail "expected 5 allowed of 40 concurrent hits, got $allowed"
echo "ok - concurrent rate limiting: 5 of 40 allowed"

# 4. Window reset: age the window past its length, next hit is allowed and the count restarts.
psql -c "update public.rate_limit_buckets set window_started_at = now() - interval '601 seconds' where bucket = 'enquiry:10m:abc'"
[ "$(psql -c "set role service_role; select public.consume_rate_limit('enquiry:10m:abc', 5, 600)" | tail -1)" = "t" ] || fail "window did not reset"
[ "$(psql -c "select hits from public.rate_limit_buckets where bucket = 'enquiry:10m:abc'")" = "1" ] || fail "count did not restart"
echo "ok - window reset restarts the count"

# 5. Argument validation.
psql -c "select public.consume_rate_limit('', 5, 600)" >/dev/null 2>&1 && fail "empty bucket accepted"
psql -c "select public.consume_rate_limit('k', 0, 600)" >/dev/null 2>&1 && fail "zero limit accepted"
echo "ok - invalid arguments rejected"
echo "all security migration checks passed"
