#!/usr/bin/env node
/**
 * Seeds public.admin_users from ADMIN_EMAILS (ARCHITECTURE_DECISIONS D8).
 *
 *   node --env-file=.env.local scripts/db/seed-admins.mjs [--dry-run]
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ADMIN_EMAILS (comma-separated) in the
 * environment. It matches each address to an auth user with a CONFIRMED email (the same rule as
 * requireAdmin()) and inserts the missing ones. It is idempotent, only ever adds, and prints counts
 * only: no email address or user id is written to the terminal.
 *
 * Exit codes: 0 done; 1 configuration or database error; 2 the result would leave no administrator.
 * Run it after migration 20261123120000 and BEFORE deploying the code that checks admin_users, so
 * the existing administrator never loses access (see the cutover runbook).
 */
import { createClient } from "@supabase/supabase-js";

const dryRun = process.argv.includes("--dry-run");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const wanted = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

function fail(message, code = 1) {
  console.error(`seed-admins: ${message}`);
  process.exit(code);
}

if (!url || !serviceKey) fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
if (wanted.size === 0) fail("ADMIN_EMAILS is empty; refusing to run (it would seed no administrator)", 2);

const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

// Every auth user, page by page, keeping only confirmed addresses on the list.
const matched = new Map(); // email -> user id
let unconfirmed = 0;
for (let page = 1; ; page++) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
  if (error) fail(`could not list users (${error.status ?? "error"})`);
  for (const user of data.users) {
    const email = user.email?.toLowerCase();
    if (!email || !wanted.has(email)) continue;
    if (!user.email_confirmed_at) {
      unconfirmed++;
      continue;
    }
    matched.set(email, user.id);
  }
  if (data.users.length < 200) break;
}

const { data: existing, error: readError } = await supabase.from("admin_users").select("user_id");
if (readError) fail(`could not read admin_users (${readError.code ?? "error"})`);
const have = new Set(existing.map((r) => r.user_id));
const toAdd = [...matched.values()].filter((id) => !have.has(id));

console.log(
  `seed-admins: ${wanted.size} listed, ${matched.size} confirmed accounts found, ${unconfirmed} unconfirmed skipped, ` +
    `${wanted.size - matched.size - unconfirmed} with no account, ${have.size} already admin, ${toAdd.length} to add`,
);

const finalCount = new Set([...have, ...toAdd]).size;
if (finalCount === 0) {
  fail("no listed address belongs to a confirmed account; refusing to leave admin_users empty. Sign in once with the admin address, then re-run", 2);
}

if (dryRun) {
  console.log(`seed-admins: dry run; would leave ${finalCount} administrator(s)`);
  process.exit(0);
}

if (toAdd.length) {
  const { error } = await supabase
    .from("admin_users")
    .upsert(toAdd.map((user_id) => ({ user_id, note: "seeded from ADMIN_EMAILS", created_by: "seed-admins" })), {
      onConflict: "user_id",
      ignoreDuplicates: true,
    });
  if (error) fail(`could not insert admin_users (${error.code ?? "error"})`);
}

const { count, error: countError } = await supabase.from("admin_users").select("user_id", { count: "exact", head: true });
if (countError) fail(`could not verify admin_users (${countError.code ?? "error"})`);
if (!count) fail("admin_users is empty after seeding", 2);
console.log(`seed-admins: done; ${count} administrator(s)`);
