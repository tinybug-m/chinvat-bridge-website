# SEO measurement baseline

**Status, 21 November 2026: there is no baseline yet.** No Search Console data has ever been exported, no analytics is installed (verified on the live homepage), and the two tracker templates are empty. Nothing below is an estimate: every figure section is empty until real data is added, with its exact date range.

## Reporting boundaries

Keep reporting periods separate across these dates, and never sum figures across them:

| Date (2026) | Event | Why it matters |
|---|---|---|
| Before 19 Nov | Canonical origin was `www.chinvatbridge.uk`, and both domains served the site | Data sits mostly in the `.uk` property |
| 19 Nov, evening (UTC) | Production redeployed with `.com` as the canonical; `.uk` starts redirecting (301, query dropped) | Canonical switch |
| 20 Nov, about 03:00 UTC | Service pages, new titles and two articles deployed | Content and on-page changes |
| Next deploy (pending approval) | Branch `seo/remediation-2026-11-21`: title changes | Title test boundary |

## Search Console: what is needed

**Properties:**
- **Domain property `chinvatbridge.com`.** Two `google-site-verification` TXT records exist on it, so it is probably verified.
- **Domain property `chinvatbridge.uk`.** One TXT record exists. Needed for historical data and for Change of Address, which must run from a property you own on the *old* domain.

**Access route (chosen 21 Nov 2026): the official Search Console API, read-only, authorised by you through Google's consent screen.**

- **Client:** `scripts/seo/gsc-api.py`. Standard library only.
- **Scope:** only `https://www.googleapis.com/auth/webmasters.readonly`. A token with any other scope is refused and not saved.
- **Endpoints:** every request passes an allow-list of read-only calls: sites.list, sitemaps.list, searchAnalytics.query, urlInspection.index.inspect. Nothing in Search Console can be changed from it.
- **Credentials:** stored outside the repository in `~/.config/chinvat-gsc/`, mode 600. They are never printed. You can revoke them any time at myaccount.google.com/permissions.
- **Raw data:** written outside the repository, to `~/Documents/project/artin/chinvat-gsc-data/<date>/`. Only summaries go into this file.

**What the API returns** (checked against Google's API reference, 21 Nov 2026):
- Up to 16 months of performance data by date, query, page, country and device. The query × page combination, and Google's branded classification where the property has enough volume (that data starts 21 Feb 2026).
- Sitemap status: submitted and downloaded dates, pending, warnings and errors, and the URL count.
- Per-URL index inspection (2,000 a day per property): verdict, coverage, Google-selected versus declared canonical, last crawl.

**What it does not return, so these still need the Search Console UI:**
- The **Page indexing report**. The API has only per-URL inspection; I inspect all 16 sitemap URLs on both domains instead.
- **Change of Address status.**
- The URL list inside a submitted sitemap. That comes from the live sitemap itself.

For the first two, a screenshot of Indexing → Pages and of Settings → Change of address, from each property, completes the picture.

**Fallback if the API isn't set up:** for each property, Performance → Search results → "Last 16 months" → Export → Download CSV, plus the two screenshots above.

**Permissions required:** read-only is enough for everything here. **Owner** permission on both properties is needed only for Change of Address, and you run that yourself.

**Processing:** `python3 scripts/seo/gsc-api.py fetch`, then `python3 scripts/seo/gsc-summary.py <data>/<property> --label "<property>, <start>..<end>"`. Both are tested end to end on mocked data in the scratchpad; no real data has gone through them yet.

## Baseline tables (to be filled from exports)

### `chinvatbridge.uk`: [date range]

_No data yet._

### `chinvatbridge.com`: [date range]

_No data yet._

**Columns per property:** totals (clicks, impressions, CTR, average position) from the Dates file; brand / name-only / non-brand (brand = "chinvat" plus a business term); page groups (home, service pages, pricing, articles); top 25 non-brand queries; pages with at least 100 impressions and CTR under 1%; country and device split.

### Indexing: [export date]

_No data yet._ Record per sitemap URL: indexed on `.com`? Google-selected canonical? `.uk` URLs as "Page with redirect"?

## Analytics: recommendation

**Recommended: Plausible Analytics, Starter plan.** Not installed: it is paid, and needs your approval and a privacy-policy line.

| | Plausible Starter | Vercel Web Analytics |
|---|---|---|
| Price | $9/month, 1 site, up to 10k monthly pageviews; 30-day free trial, no card (plausible.io, read 21 Nov 2026) | Hobby: 50,000 events/month included. Pro: $0.03 per 1k events after the plan's usage credit; the Web Analytics Plus add-on is $10/month per team (Vercel docs, read 21 Nov 2026) |
| Campaign (UTM) reporting | Included | **Hobby: no. Pro: not listed. Plus: included** |
| History kept | "No retention limit" | Hobby: 1 month. Pro: 12 months. Plus: 24 months |
| Cookies and consent | "We don't use cookies or generate persistent visitor identifiers". Plausible states no cookie banner is needed for it | No third-party cookies; visitors identified by a request hash, sessions discarded after 24 hours. Vercel's page doesn't address banners |
| Data location | EU, on European-owned infrastructure | Vercel |
| Install | One script tag in the root layout; optional proxy through a Next.js rewrite so ad-blockers don't drop it | `@vercel/analytics` package, `<Analytics />` in the root layout, and "Enable" in the Vercel dashboard |

**Why Plausible:**
- The programme's question is *which landing pages and campaigns produce enquiries*. That needs source and UTM reporting and more than a month of history. Vercel has neither on Hobby, and UTMs only with the paid Plus add-on.
- **Vercel's Terms of Service say the Hobby plan is "for your personal or non-commercial use".** If this project is on Hobby, that is a contractual issue regardless of analytics, and you should check which plan the project is on.

**Before activating either:**
- A privacy-policy line describing it. This is legal text, so it needs your approval; it isn't something I can certify as compliant.
- Your approval of the cost.
- Then it's about 15 minutes of code, behind an environment variable so nothing loads until you set it.

## Enquiry attribution: review

**Code:** `src/components/site/journey.ts` (browser), `src/lib/enquiry-journey.ts` (server sanitiser), `src/actions/enquiry.ts` (email).

| Element | Verdict | Evidence |
|---|---|---|
| First landing page | Correct | Recorded on the first route change; kept in module memory for the tab; no cookies or storage |
| UTM parameters | Correct for `utm_source`, `utm_medium` and `utm_campaign`; `utm_term` and `utm_content` deliberately not kept | `UTM_KEYS` |
| Referring domain | Correct, as a bare host. The site's own domains (`.com` and `.uk`, with or without `www`) count as internal | `OWN_DOMAINS`. Referrer-Policy `strict-origin-when-cross-origin` still passes search engines' origins |
| Previous page | Correct | — |
| Server-side sanitisation | **Fixed on this branch.** Before: one character outside the allow-list in a campaign tag (for example `*`, which `URLSearchParams` leaves unencoded) dropped the *whole* entry, landing page included. Now an unusable query is dropped on its own and the path kept; `*` is allowed; a protocol-relative `//host` is refused | 12 edge cases run against the compiled module; `contact` spec passes on three viewports |
| Through the `.uk` redirect | Campaign tags are lost (Cloudflare drops the query); the path and the original referrer survive | Live redirect check |
| **Real email delivery** | **Never tested.** No mail credentials locally; e2e stubs the send | **Needs your approval:** one test enquiry from the live contact form to your own inbox, after the next deploy |

## Reporting system

**North star:** qualified organic enquiries per month. "Qualified" means a business with a described problem in one of the four services, a plausible budget and a decision-maker writing (definition in `seo/overnight-2026-11-18/14-conversion-optimisation.md`).

| What | Source | Cadence | File |
|---|---|---|---|
| Qualified organic enquiries; enquiry → proposal → won | Enquiry emails (attribution lines) → enquiry tracker | Per enquiry | `seo/overnight-2026-11-18/measurement-tracker-enquiries.csv` |
| Organic clicks and impressions by landing page; brand vs non-brand; CTR | Search Console export → `gsc-summary.py` | Monthly, first working day, previous calendar month | `measurement-tracker-monthly.csv` + this file |
| Commercial keyword visibility | Search Console queries filtered to the Prioritise keywords in `SEO_KEYWORD_STRATEGY_UPDATED.md`: impressions and average position each | Monthly | This file |
| Conversion rate | Organic enquiries ÷ organic entrances to service pages (entrances from analytics, once installed) | Monthly | This file |
| Published content performance | Search Console Pages, filtered to `/insights/` | Monthly, from 28 days after publication | This file |
| Indexing | Search Console Pages; `pnpm seo:check-migration`; `pnpm seo:crawl` | Weekly until all 16 URLs are indexed on `.com`, then monthly | This file |

**Rules:** record the exact date range with every number. Never compare periods of different lengths. Don't set traffic targets until there is one full month of `.com` data.
