# Owner infrastructure checklist

**For:** the account owner. **Prepared:** 19 November 2026. Nothing here has been done; every step needs your accounts (Cloudflare, Vercel, Supabase, Google, Microsoft).

**Goal:** one public website at `https://www.chinvatbridge.com`. The apex and both `.uk` hosts redirect to it permanently, keeping the path and query string. Search engines are told about the move.

Work through the sections in order. Steps 1 to 3 can be done before the branch is deployed. Steps 4 onwards need the deploy (step 3) to be live first.

## What the domains look like today

Observed on 19 Nov 2026 from public DNS and HTTP responses (read-only). Re-check before you start, in case anything has changed.

| Host | DNS | What it does now |
|---|---|---|
| `chinvatbridge.com` | Cloudflare nameservers (`alla.ns.cloudflare.com`, `damon.ns.cloudflare.com`). Apex A records are Cloudflare proxy addresses, so the record is proxied (orange cloud). | `https://chinvatbridge.com/insights?x=1` → **308** → `https://www.chinvatbridge.com/insights?x=1`. **Already correct:** the apex goes to `www` with the path and query kept. |
| `www.chinvatbridge.com` | CNAME → `c867ec7f1aa9e613.vercel-dns-017.com` (served by Vercel directly, not through Cloudflare's proxy) | **200** from Vercel. Its canonical, sitemap and robots still say `.uk`, because production `NEXT_PUBLIC_SITE_URL` is still `.uk` and this branch isn't deployed yet. |
| `chinvatbridge.uk` | Cloudflare nameservers; proxied | **308** → `https://www.chinvatbridge.uk/…` (it should go to `.com`) |
| `www.chinvatbridge.uk` | Proxied through Cloudflare to Vercel | **200**: a full second copy of the site (it should redirect) |

## Before you change anything: protect the mail records

Both domains receive and send email. **Do not delete or edit any MX, SPF (`v=spf1…` TXT), DKIM (`…._domainkey` TXT), DMARC (`_dmarc` TXT) or other verification TXT record** while doing the steps below. None of the steps needs it. Website redirects and email are independent: redirecting `.uk` web traffic doesn't touch `.uk` mail.

Take a copy first: Cloudflare → each domain → **DNS → Records → Export** (or a screenshot of the full list), for both domains.

Records seen on 19 Nov 2026 (keep all of them):

| Domain | Record | Value seen |
|---|---|---|
| `chinvatbridge.com` | MX | `smtp.google.com` (priority 1); `eforward1`–`eforward5.registrar-servers.com` (priorities 10–20) |
| `chinvatbridge.com` | TXT (SPF) | `v=spf1 include:spf.efwd.registrar-servers.com ~all` |
| `chinvatbridge.com` | TXT | `google-site-verification=CdG5-…` (Search Console ownership: keep it) |
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

Don't remove the `.uk` domains from the Vercel project until the redirect in step 6 is live and checked. Removing them first would make `.uk` show an error instead of redirecting.

## 5. Apex to `www` (`.com`)

Already working: `https://chinvatbridge.com/<path>?<query>` returns **308** to `https://www.chinvatbridge.com/<path>?<query>`. **No action**; re-run the check after any DNS change:

```bash
curl -sI "https://chinvatbridge.com/insights?x=1" | grep -iE '^HTTP|^location'
# expect: 308 and location: https://www.chinvatbridge.com/insights?x=1
```

## 6. Redirect both `.uk` hosts to `.com`, keeping path and query

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

**Option B: Vercel domain redirect.** Vercel → Settings → Domains → **Edit** on `www.chinvatbridge.uk` (then on `chinvatbridge.uk`) → **Redirect to** → `www.chinvatbridge.com`. Vercel's domain documentation doesn't state the status code or whether the path and query are kept. If you use this route, run the checks below and switch to option A if any fails.

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

No change is needed for the website. `www.chinvatbridge.com` already points at the project's Vercel target (`c867ec7f1aa9e613.vercel-dns-017.com`), and the apex already redirects. If Vercel ever shows a domain as "Invalid Configuration", use **exactly** the record Vercel → Settings → Domains shows for that domain. Its values are specific to the project, so none is given here.

One thing to know: `www.chinvatbridge.com` goes to Vercel directly, while the `.com` apex and both `.uk` hosts pass through Cloudflare's proxy. That works today. If you ever turn the proxy (orange cloud) off for the `.uk` hosts, the option A redirect stops working.

## 8. Google Search Console: verify `chinvatbridge.com` as a Domain property

A `google-site-verification` TXT record already exists on `chinvatbridge.com`, so the property may already be verified under some Google account.

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
curl -sI "https://www.chinvatbridge.uk/insights?x=1"   | grep -iE '^HTTP|^location'   # 301 → www.chinvatbridge.com/insights?x=1
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
