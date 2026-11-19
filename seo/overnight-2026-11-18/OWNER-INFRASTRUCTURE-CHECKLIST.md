# Owner infrastructure checklist

**For:** the account owner. **Prepared:** 19 November 2026; **status re-verified 19 Nov 2026, 10:45 UTC** from public DNS and HTTP responses (read-only; no account was accessed and nothing was changed). Every step needs your accounts (Cloudflare, Vercel, Supabase, Google, Microsoft).

**Goal:** one public website at `https://www.chinvatbridge.com`. The apex and both `.uk` hosts redirect to it permanently, keeping the path and query string. Search engines are told about the move.

## Status at a glance

Between the first check this morning and the re-check at 10:45 UTC, the `.uk` redirect was switched on and the `.com` apex moved to Vercel directly. Where things stand:

| Item | Status | Evidence |
|---|---|---|
| `.com` apex → `www` | **Done.** 308, path and query kept | `https://chinvatbridge.com/services/seo?utm_source=t` → `https://www.chinvatbridge.com/services/seo?utm_source=t` (issued by Vercel) |
| `http` → `https` (`.com`) | **Done.** 308, path and query kept; HSTS on `https` | `http://www.chinvatbridge.com/insights?a=1` → `https://www.chinvatbridge.com/insights?a=1` |
| `.uk` (apex and `www`) → `.com` | **Partly done.** 301 to the same path on `www.chinvatbridge.com`, **but the query string is dropped** | `https://www.chinvatbridge.uk/services/seo?utm_source=t` → `https://www.chinvatbridge.com/services/seo` (issued by Cloudflare) |
| Production canonical, sitemap, robots | **Not done.** Still `.uk` | Live `https://www.chinvatbridge.com/` has `<link rel="canonical" href="https://www.chinvatbridge.uk"/>`; the sitemap and robots point at `.uk` |
| Website DNS records | **No change needed** (verified below) | All four hosts resolve and route as intended |
| Mail records | Unchanged since this morning | See the mail table |

## Do these first (urgent)

The `.uk` redirect is live while production still uses `.uk` as its own address. Those two together break things today:

- **Client sign-in is very likely broken.** Sign-in emails and Google sign-in return to `https://www.chinvatbridge.uk/auth/callback?code=…`. The redirect drops `?code=…`, so `/auth/callback` on `.com` gets no code and sign-in fails (`src/actions/auth.ts`, `src/app/auth/callback/route.ts`). Inferred from the code and the observed redirect; not tested end to end, because that would send a real sign-in email.
- **The page after checkout loses its session.** Stripe returns to `https://www.chinvatbridge.uk/subscribe/success?session_id=…`, and the `session_id` is dropped (`src/actions/checkout.ts`). The payment itself is taken by Stripe; what breaks is the success page's "sign in to your portal" link.
- **Search engines get contradictory signals.** `.uk` redirects to `.com`, while every `.com` page names a `.uk` URL as its canonical, so each canonical points at a redirect.

In this order:

1. **Cloudflare → `chinvatbridge.uk` → Rules → the redirect rule you created → Edit → turn on "Preserve query string" → Save.** This alone repairs sign-in and checkout returns. Check:
   ```bash
   curl -sI "https://www.chinvatbridge.uk/auth/callback?code=TEST" | grep -i '^location'
   # expect: location: https://www.chinvatbridge.com/auth/callback?code=TEST
   ```
2. **Supabase:** do section 1 below (Site URL and `https://www.chinvatbridge.com/**`).
3. **Vercel:** do section 2 below, then **redeploy production**. Even the current `main` reads `NEXT_PUBLIC_SITE_URL`, so this alone moves canonicals, sitemap, robots, sign-in links and Stripe returns to `.com`, without waiting for the branch. Then merge and deploy the branch (section 3).

## What the domains look like now

Observed 19 Nov 2026, 10:45 UTC. Re-check before you start, in case anything has changed.

| Host | DNS (answered by Cloudflare's nameservers `alla`/`damon.ns.cloudflare.com`) | What it does now |
|---|---|---|
| `chinvatbridge.com` | A `64.29.17.65`, `216.198.79.65`: served by Vercel directly (responses carry `server: Vercel` and `x-vercel-id`), not through Cloudflare's proxy | 308 → `https://www.chinvatbridge.com/<same path and query>`. Correct. |
| `www.chinvatbridge.com` | CNAME → `c867ec7f1aa9e613.vercel-dns-017.com` (Vercel, not proxied) | 200 from Vercel, HSTS. Correct host; canonical still `.uk` (see above). |
| `chinvatbridge.uk` | A `104.21.75.118`, `172.67.175.146`: Cloudflare proxy (orange cloud) | 301 → `https://www.chinvatbridge.com/<same path>`; **query dropped** |
| `www.chinvatbridge.uk` | Same Cloudflare proxy addresses | 301 → `https://www.chinvatbridge.com/<same path>`; **query dropped**. Exception: `/robots.txt` returns 200 with Cloudflare's managed robots file, which allows normal search crawling, so Google can still fetch the old host's robots and follow the redirects. |

## Before you change anything: protect the mail records

Both domains receive and send email. **Do not delete or edit any MX, SPF (`v=spf1…` TXT), DKIM (`…._domainkey` TXT), DMARC (`_dmarc` TXT) or other verification TXT record** while doing the steps below. None of the steps needs it. Website redirects and email are independent: redirecting `.uk` web traffic doesn't touch `.uk` mail.

Take a copy first: Cloudflare → each domain → **DNS → Records → Export** (or a screenshot of the full list), for both domains.

Records seen on 19 Nov 2026 (keep all of them):

| Domain | Record | Value seen |
|---|---|---|
| `chinvatbridge.com` | MX | `smtp.google.com` (priority 1); `eforward1`–`eforward5.registrar-servers.com` (priorities 10–20) |
| `chinvatbridge.com` | TXT (SPF) | `v=spf1 include:spf.efwd.registrar-servers.com ~all` |
| `chinvatbridge.com` | TXT | `google-site-verification=CdG5-…` and, new since this morning, `google-site-verification=oM4a8I…` (Search Console ownership: keep both) |
| `chinvatbridge.uk` | MX | `route1/2/3.mx.cloudflare.net` (Cloudflare Email Routing) |
| `chinvatbridge.uk` | TXT | `v=spf1 include:_spf.mx.cloudflare.net ~all`; `brevo-code:…`; `google-site-verification=aR5nV-…` |
| `_dmarc.chinvatbridge.uk` | TXT | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` |

**Worth a separate look, not part of this checklist.** On `.com`, Google Workspace's MX (`smtp.google.com`) sits beside Namecheap's email-forwarding MX records. The SPF record authorises only the Namecheap forwarder, and there is no DMARC record. If `artin@chinvatbridge.com` sends from Google Workspace, receiving servers may treat that mail as unauthenticated. Check this with whoever set up the mailbox, using Google Workspace Admin → Apps → Google Workspace → Gmail → Authenticate email. Nothing was changed, and the website work doesn't depend on it.

## 1. Supabase: Site URL and redirect URLs

Sign-in links (magic links, Google sign-in) only return to addresses Supabase allows.

1. Open the Supabase dashboard → your project → **Authentication → URL Configuration** (direct link pattern: `https://supabase.com/dashboard/project/<project-ref>/auth/url-configuration`).
2. **Site URL:** `https://www.chinvatbridge.com`. Save.
3. **Redirect URLs:** add `https://www.chinvatbridge.com/**`. Supabase's docs define `**` as matching any sequence of characters, including nested paths. Save.
4. **Keep** `https://www.chinvatbridge.uk/**` in the list for now, so sign-in emails sent before the switch still work. Remove it about a week after step 6 is live.
5. **Check after step 3 is deployed:** sign in at `https://www.chinvatbridge.com/login` with the email link. The link in the email must point back to `www.chinvatbridge.com` and sign you in.

The repository's `supabase/config.toml` already lists the same URLs. It is only applied if you run `supabase config push`. The dashboard is what production uses.

## 2. Vercel: production environment variable

1. Vercel → the project → **Settings → Environment Variables**.
2. Find `NEXT_PUBLIC_SITE_URL` for the **Production** environment and set it to exactly `https://www.chinvatbridge.com`: no trailing slash, `https`, with `www`.
3. Leave Preview and Development as they are, unless they are also set to `.uk`. Then set them to the `.com` value too, so preview deployments don't emit `.uk` canonicals.
4. The value is read at build time. It takes effect on the **next** deployment (step 3), not on the current one.
5. Optional: `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` (Production) if you choose meta-tag verification in steps 8–10. DNS verification needs neither.

Also check the Stripe dashboard for hard-coded `.uk` addresses (webhook endpoint, customer portal return URL). The site's own checkout URLs follow `NEXT_PUBLIC_SITE_URL` automatically.

## 3. Deploy the branch

1. Review the branch (see [HANDOFF](HANDOFF.md#decisions-requiring-human-approval) for the copy to approve).
2. Merge `seo/overnight-2026-11-18` into `main` and let Vercel deploy production.
3. **Check:**
   - `https://www.chinvatbridge.com/` page source contains `<link rel="canonical" href="https://www.chinvatbridge.com"/>`.
   - `https://www.chinvatbridge.com/robots.txt` ends with `Sitemap: https://www.chinvatbridge.com/sitemap.xml`.
   - `https://www.chinvatbridge.com/sitemap.xml` lists only `https://www.chinvatbridge.com/…` URLs.

   Terminal equivalents:
   ```bash
   curl -s https://www.chinvatbridge.com/ | grep -o '<link rel="canonical"[^>]*>'
   curl -s https://www.chinvatbridge.com/robots.txt
   curl -s https://www.chinvatbridge.com/sitemap.xml | grep -o '<loc>[^<]*' | head
   ```

## 4. Vercel domain configuration

In Vercel → the project → **Settings → Domains**, the target state is:

| Domain | Setting |
|---|---|
| `www.chinvatbridge.com` | **Primary**: serves the production deployment |
| `chinvatbridge.com` | Redirect to `www.chinvatbridge.com` (already behaving this way; leave it) |
| `chinvatbridge.uk` | Redirect to `www.chinvatbridge.com`, or handled by Cloudflare (step 6) |
| `www.chinvatbridge.uk` | Redirect to `www.chinvatbridge.com`, or handled by Cloudflare (step 6) |

What could be verified from outside (19 Nov, 10:45 UTC): `www.chinvatbridge.com` is served by Vercel. `chinvatbridge.com` is answered by Vercel with a 308 to `www`, which is the Vercel domain redirect. The `.uk` hosts are now answered by Cloudflare's redirect before any request reaches Vercel. **Not verifiable without dashboard access:** whether Vercel still lists the `.uk` domains, and whether every domain shows "Valid Configuration". Open Settings → Domains and check.

- If the `.uk` domains are still listed in Vercel, you can leave them while Cloudflare redirects: requests never reach them. Removing them is optional tidying, but only after the Cloudflare rule has been checked with "Preserve query string" on (step 6). If you ever turn Cloudflare's proxy off for `.uk`, the rule stops and traffic would reach Vercel again.
- `www.chinvatbridge.com` should be the domain production deploys to, with no redirect of its own.

## 5. Apex to `www` (`.com`)

**Done, verified 19 Nov 10:45 UTC.** `https://chinvatbridge.com/<path>?<query>` returns **308** to `https://www.chinvatbridge.com/<path>?<query>`, issued by Vercel; the apex now points at Vercel directly rather than through Cloudflare's proxy. **No action.** Re-run the check after any DNS change:

```bash
curl -sI "https://chinvatbridge.com/insights?x=1" | grep -iE '^HTTP|^location'
# expect: 308 and location: https://www.chinvatbridge.com/insights?x=1
```

## 6. Redirect both `.uk` hosts to `.com`, keeping path and query

**Status 19 Nov 10:45 UTC: a Cloudflare redirect is live (301, path kept) but drops the query string.** Turn on **Preserve query string** in that rule (the first urgent action above), then run the check at the end of this section. The settings below describe the complete rule, for comparison with what you created.

Both `.uk` hostnames are proxied by Cloudflare, so a **Cloudflare redirect rule** is the most direct way. Its documented settings keep the path and the query string.

**Option A, recommended: Cloudflare redirect rule** (on the `chinvatbridge.uk` zone)

1. Cloudflare → `chinvatbridge.uk` → **Rules → Overview → Create rule → Redirect Rule**.
2. Rule name: `uk to com`.
3. When incoming requests match: **Wildcard pattern**. Request URL: `http*://*chinvatbridge.uk/*`. This matches both `chinvatbridge.uk` and `www.chinvatbridge.uk`, on `http` and `https`.
4. Then: Target URL `https://www.chinvatbridge.com/${3}`. With this pattern `${1}` is the `s` of `https`, `${2}` is the optional `www.` and `${3}` is the path. If the editor offers a preview, confirm that `/insights` becomes `https://www.chinvatbridge.com/insights`.
5. Status code: **301**.
6. **Preserve query string:** enabled.
7. Deploy.
8. Cloudflare's docs say these rules only run for hostnames whose DNS records are **proxied** (orange cloud). Both `.uk` hostnames are proxied today; keep them that way.

If wildcard numbering in step 4 is unclear in the editor, create two rules instead: one for `http*://chinvatbridge.uk/*` and one for `http*://www.chinvatbridge.uk/*`, each with target `https://www.chinvatbridge.com/${2}`. That is the exact form in Cloudflare's "redirect all requests to another domain" example.

**Option B: Vercel domain redirect.** Vercel → Settings → Domains → **Edit** on `www.chinvatbridge.uk` (then on `chinvatbridge.uk`) → **Redirect to** → `www.chinvatbridge.com`. Vercel's documentation doesn't state the status code or whether the path and query are kept. In this project, Vercel's own apex-to-`www` redirect on `.com` keeps both, with a 308. That only works while the `.uk` records are not proxied by Cloudflare (or no Cloudflare rule answers first). Since option A is already in place, fixing its query-string setting is the smaller change.

**Check (either option):**

```bash
for u in "https://www.chinvatbridge.uk/insights?utm_source=test" "https://chinvatbridge.uk/services/seo" "http://www.chinvatbridge.uk/"; do
  curl -sI "$u" | grep -iE '^HTTP|^location'
done
# expect 301 (or 308) and locations:
#   https://www.chinvatbridge.com/insights?utm_source=test
#   https://www.chinvatbridge.com/services/seo
#   https://www.chinvatbridge.com/   (the http request may first go to https, then to .com)
```

Keep the redirects for at least **180 days**, and preferably permanently (Google's Change of Address guidance).

## 7. DNS records required by the hosting provider

**Verified 19 Nov 10:45 UTC: no website DNS change is needed.** Each host resolves, through Cloudflare's authoritative nameservers, to where it should, and was observed doing the right thing:
- `www.chinvatbridge.com`: CNAME to the project's Vercel target `c867ec7f1aa9e613.vercel-dns-017.com`; served by Vercel.
- `chinvatbridge.com`: A `64.29.17.65` and `216.198.79.65`; answered by Vercel with the apex-to-`www` redirect.
- `chinvatbridge.uk`, `www.chinvatbridge.uk`: proxied by Cloudflare (orange cloud), which the redirect rule requires. **Keep them proxied.**

Limits of this check: it shows behaviour from outside, not Vercel's dashboard. If Vercel → Settings → Domains shows any domain as "Invalid Configuration", use **exactly** the record it shows there. Those values are specific to the project, so none is given here.

## 8. Google Search Console: verify `chinvatbridge.com` as a Domain property

Two `google-site-verification` TXT records now exist on `chinvatbridge.com` (the second, `oM4a8I…`, appeared on 19 Nov), so a Domain property is probably verified or being verified. Keep both records.

1. Sign in at `https://search.google.com/search-console` with the account that should own it.
2. If `chinvatbridge.com` (Domain property) is listed, you are done.
3. If not: **Add property → Domain →** `chinvatbridge.com`. Search Console gives you a TXT value.
4. Cloudflare → `chinvatbridge.com` → DNS → **Add record**: type TXT, name `@`, content = the value Search Console gave. Add it **alongside** the existing records; delete nothing.
5. Click **Verify**. Google says manually added records can take up to two or three days to be seen.
6. Keep the TXT record permanently; removing it un-verifies the property.

A Domain property can only be verified by DNS. The `GOOGLE_SITE_VERIFICATION` variable (step 2) is only for a URL-prefix property, if you also want one.

## 9. Search Console: submit the sitemap

After step 3 is live:

1. In the `chinvatbridge.com` property → **Indexing → Sitemaps**.
2. Submit `https://www.chinvatbridge.com/sitemap.xml`.
3. Expect status **Success**. The sitemap lists 14 URLs today; each draft adds one when it is published.
4. **URL inspection → Request indexing** for `/`, `/services/ai-integration`, `/services/workflow-automation`, `/services/custom-software` and `/services/seo`.

## 10. Change of Address (`.uk` → `.com`), when applicable

Applies if a `.uk` property exists in Search Console. A `google-site-verification` TXT record on `chinvatbridge.uk` suggests one does.

Prerequisites (from Google's Change of Address page):
- You are an **owner of both** the old (`.uk`) and new (`.com`) properties.
- The 301 redirects from step 6 are live.
- The tool runs from a **domain-level** property (no path), for example the Domain property `chinvatbridge.uk` or `https://www.chinvatbridge.uk`. Verify every variant that served pages (`www` and non-`www`), and run the move for each.

Steps:
1. Open the `.uk` property → **Settings → Change of address** (`https://search.google.com/search-console/settings/change-address`).
2. Choose `chinvatbridge.com` as the new site.
3. Fix any critical check it reports (usually a missing redirect), then submit.
4. The move stays in effect for **180 days**. Keep the redirects at least that long.
5. Watch **Indexing → Pages**: `.uk` URLs should move to "Page with redirect" and `.com` URLs to "Indexed".

If there is no `.uk` property, skip this. The redirects alone carry the signals.

## 11. Bing Webmaster Tools

1. Sign in at `https://www.bing.com/webmasters`.
2. If you are offered **Import from Google Search Console**, you can use it after step 8. The official help page describing exactly what it imports couldn't be retrieved, so check afterwards that the site shows as verified and that the sitemap appears.
3. Otherwise **Add a site manually**: `https://www.chinvatbridge.com`, and verify with the DNS record Bing gives you (added in Cloudflare alongside the existing records) or with the meta tag (`BING_SITE_VERIFICATION`, step 2, then redeploy).
4. **Sitemaps → Submit** `https://www.chinvatbridge.com/sitemap.xml`.

## 12. After everything: the checks in one place

```bash
curl -sI "https://chinvatbridge.com/insights?x=1"      | grep -iE '^HTTP|^location'   # 308 → www.chinvatbridge.com/insights?x=1
curl -sI "https://www.chinvatbridge.uk/insights?x=1"   | grep -iE '^HTTP|^location'   # 301 → www.chinvatbridge.com/insights?x=1  (today: query missing)
curl -sI "https://www.chinvatbridge.uk/auth/callback?code=TEST" | grep -i '^location' # → www.chinvatbridge.com/auth/callback?code=TEST
curl -sI "https://chinvatbridge.uk/"                   | grep -iE '^HTTP|^location'   # 301 → www.chinvatbridge.com/
curl -s  https://www.chinvatbridge.com/ | grep -o '<link rel="canonical"[^>]*>'        # href="https://www.chinvatbridge.com"
curl -s  https://www.chinvatbridge.com/robots.txt | tail -1                            # Sitemap: https://www.chinvatbridge.com/sitemap.xml
dig +short MX chinvatbridge.com; dig +short MX chinvatbridge.uk                        # unchanged from the table above
```

Then send yourself a test email to `artin@chinvatbridge.com` and to a `.uk` address you use, to confirm mail still arrives.

## Sources

- Vercel, deploying and redirecting domains: https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting
- Cloudflare, redirect all requests to another domain: https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-all-another-domain/ and creating a redirect rule: https://developers.cloudflare.com/rules/url-forwarding/single-redirects/create-dashboard/
- Supabase, redirect URLs: https://supabase.com/docs/guides/auth/redirect-urls
- Google, Change of Address: https://support.google.com/webmasters/answer/9370220
- Google, verifying site ownership: https://support.google.com/webmasters/answer/9008080

All read on 19 Nov 2026. Bing's import help couldn't be retrieved, as noted in step 11.
