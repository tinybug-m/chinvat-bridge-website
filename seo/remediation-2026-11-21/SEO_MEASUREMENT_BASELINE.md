# SEO measurement baseline

**Status, 21 November 2026: Search Console baseline recorded** (see [Baseline, recorded 21 November 2026](#baseline-recorded-21-november-2026)). No analytics is installed (verified on the live homepage), and the enquiry tracker is empty. Nothing below is an estimate: every figure comes from an export, with its exact date range.

## Reporting boundaries

Keep reporting periods separate across these dates, and never sum figures across them:

| Date (2026) | Event | Why it matters |
|---|---|---|
| Before 19 Nov | Canonical origin was `www.chinvatbridge.uk`, and both domains served the site | Data sits mostly in the `.uk` property |
| 19 Nov, evening (UTC) | Production redeployed with `.com` as the canonical; `.uk` starts redirecting (301, query dropped) | Canonical switch |
| 20 Nov, about 03:00 UTC | Service pages, new titles and two articles deployed | Content and on-page changes |
| 21 Nov, evening (UTC) | Cloudflare redirect keeps query strings; Change of Address submitted in Search Console | Start of Google's 180-day move window; `.uk` impressions should fall and `.com` rise over the following weeks |
| Next deploy (pending approval) | Branch `seo/remediation-2026-11-21`: title changes | Title test boundary |

## Search Console: what is needed

**Properties (confirmed 21 Nov 2026):** `chinvatbridge.com` and `chinvatbridge.uk` are both Domain properties, and your account is a verified owner of each. Change of Address must run from the `.uk` property, the *old* domain.

**How the baseline was actually taken:** Search Console's own CSV exports and report pages, read in a browser session you signed into (below). The API client described next is built but **has never been authorised or run against real data**. It is the route for recurring monthly pulls once the browser session is signed out.

**API route (built, not yet used): the official Search Console API, read-only, authorised by you through Google's consent screen.**

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

**Processing:** `python3 scripts/seo/gsc-api.py fetch`, then `python3 scripts/seo/gsc-summary.py <data>/<property> --label "<property>, <start>..<end>"`. `gsc-summary.py` has run on the real 21 Nov exports. `gsc-api.py` is tested only on a mocked API.

## Baseline, recorded 21 November 2026

**Source:** Search Console UI, read by Claude in a browser session the owner signed into on 21 Nov 2026.

- **Performance:** Search results → Search type Web → "Last 16 months" → Export → CSV.
- **Also read:** the Page indexing report and its drill-downs, Sitemaps, Settings, and Change of address. These were viewed only; nothing was clicked that changes anything.
- **Raw exports:** kept outside the repository in `~/Documents/project/artin/chinvat-gsc-data/2026-11-21/{uk,com}/`.
- **Search Console messages:** 5 unread, not opened, because opening them marks them read.

**Both properties are Domain properties, and the account is a verified owner of each.**

### Verification against the raw exports (21 Nov 2026)

Every Performance figure in this section was recomputed from the CSVs with a separate script, not with `gsc-summary.py`. All of these match the exports:
- The totals.
- The months.
- Queries, pages, countries and devices.
- Both properties.

Each extracted CSV is byte-identical to its copy inside Google's zip. The indexing, sitemap and Change of Address figures come from the report pages, which have no export, so they cannot be checked this way.

Corrections made on verification:
- Non-brand position: was "64–91"; it is an average of 64.5 over positions 2–91.
- Iran added: 8 of the 18 clicks.
- The `.uk` start date: was 13 Sep (a zero row); it is 14 Sep.
- Page impressions are not additive.

**Raw exports are kept unchanged.** SHA-256 of each file, taken before verification and checked again after it:

```
# ~/Documents/project/artin/chinvat-gsc-data/2026-11-21/
b64f511411ee6f9e03dcf2b987e2ef6028c1140de19d78ebc4942e0b40fe762d  ./chinvatbridge-com-Performance-on-Search-2026-11-21.zip
634fd45ed29701df13569d832d6bbe33de28324f92f7af121b5fa491bdf6eb07  ./chinvatbridge-uk-Performance-on-Search-2026-11-21.zip
c75172058c67960f6ef3f55af4991e9a0ff6291b8e089a577618802fdfaf0fe5  ./com/Chart.csv
288851f9c3d92e7da953abf37f02ef9f81c6bb36a8af00476a37a92e9ed2051e  ./com/Countries.csv
fe0559d987a4a247eda59678ee32e492d2f50c53e1b014e11b582ae1047b68d7  ./com/Devices.csv
8f01689e4c22ebdb46389640291c85566379567db24b131ed6b00bb188198f8b  ./com/Filters.csv
7488bf254b644198b9e882790d370c7448c3d37c7d63ddf40abaa8e8979158f3  ./com/Pages.csv
3fd0862b0938e4bffe0f9c12dc8c0cbc3f307383cf1daa97188176e597eeb596  ./com/Queries.csv
eed9ceafb9193e5e3d034f5897ad992bc851f1998204cd98f0b0f6873fbfc8b2  ./com/Search appearance.csv
f231670e308a4d32ca5251d620ba19956ae2f3936013fde88662188c3fab4602  ./uk/Chart.csv
f7479e32cfba1709e77b0a6376858f23afe53ac015a59686dfa4ee7ec08ff560  ./uk/Countries.csv
40314563c31f74b2396f290a98609a6df1aa58ea6cf39e74fdf15e8bf82b7182  ./uk/Devices.csv
8f01689e4c22ebdb46389640291c85566379567db24b131ed6b00bb188198f8b  ./uk/Filters.csv
4c2de3bed404f9039983731de91a03a28e0b00095c6f1dac80ec44a3b3cc95d3  ./uk/Pages.csv
518ae20c44f569a4c3306090e948989ac8ba0cc51a4a708c6ee793b78a670cde  ./uk/Queries.csv
eed9ceafb9193e5e3d034f5897ad992bc851f1998204cd98f0b0f6873fbfc8b2  ./uk/Search appearance.csv
```

### Performance

Web search only, final data as exported. The `.uk` export starts 13 Sep 2026, a zero row; the first impression is on 14 Sep. The `.com` property's data starts 18 Nov 2026.

| Property | Period with data | Clicks | Impressions | CTR | Avg. position |
|---|---|---|---|---|---|
| `chinvatbridge.uk` | 14 Sep – 19 Nov 2026 (67 days) | 18 | 2,374 | 0.76% | 8.9 |
| `chinvatbridge.com` | 18 Nov – 19 Nov 2026 (2 days) | 0 | 2 | 0% | 2.5 |

**`.uk` by calendar month.** Never compare months of different lengths; November runs only to the 19th.

| Month | Clicks | Impressions |
|---|---|---|
| Sep 2026 (13–30) | 4 | 9 |
| Oct 2026 | 6 | 1,224 |
| Nov 2026 (1–19) | 8 | 1,141 |

**`.uk` queries.** All named queries are listed. 14 of the 18 clicks came from anonymised queries Google doesn't show.

| Query | Clicks | Impressions | CTR | Position | Class |
|---|---|---|---|---|---|
| chinvat bridge | 4 | 2,249 | 0.18% | 8.9 | Name only (mythology or brand; can't tell apart) |
| chinvat | 0 | 3 | 0% | 9.7 | Name only |
| automatisering kruidvat | 0 | 5 | 0% | 76.2 | Irrelevant (Dutch retailer) |
| business ai productivity yorkshire | 0 | 3 | 0% | 71.7 | Non-brand, relevant |
| bridgwater seo / seo bridgwater | 0 | 2 | 0% | 83–91 | Non-brand, irrelevant (place name) |
| are they good? / rate them | 0 | 2 | 0% | 2 | Unclear |

**Brand split:**
- **Name-only:** 2,252 impressions, **95%** of the total.
- **Brand with a business term:** 0.
- **Non-brand:** 12 impressions and 0 clicks, impression-weighted average position 64.5. Of those, 3 are relevant ("business ai productivity yorkshire", position 71.7), 7 irrelevant (positions 76–91) and 2 unclear ("are they good?", "rate them", position 2).
- **Anonymised:** 110 impressions and 14 clicks are in no named query, so the named rows add up to 2,264 impressions, not 2,374.

**Commercial non-brand visibility is effectively zero.**

**`.uk` pages:**

| Page | Clicks | Impressions | CTR | Position |
|---|---|---|---|---|
| `/` | 13 | 2,006 | 0.65% | 8.0 |
| `/insights/where-the-name-chinvat-bridge-comes-from` | 3 | 375 | 0.80% | 11.9 |
| `/insights/where-ai-can-save-your-business-time` | 1 | 30 | 3.33% | 12.0 |
| `/insights/what-should-you-automate-first` | 1 | 24 | 4.17% | 20.0 |
| `/services/seo` | 0 | 3 | 0% | 59.7 |
| `/insights/why-your-website-isnt-bringing-you-customers` | 0 | 1 | 0% | 6 |

Page impressions add up to 2,439, more than the property's 2,374: Google counts an impression for each of your pages shown in one search, so page rows must never be summed into a total.

**`.uk` countries, top by clicks:** 81 countries in all.

| Country | Clicks | Impressions | CTR | Position |
|---|---|---|---|---|
| **Iran** | **8** | **20** | **40%** | 5.8 |
| **United Kingdom** | **5** | **74** | **6.76%** | 12.5 |
| Spain | 3 | 1,076 | 0.28% | 8.0 |
| France | 1 | 559 | 0.18% | 8.8 |
| Argentina | 1 | 44 | 2.27% | 12.7 |

Every other country has 0 clicks.

**`.uk` countries, top by impressions:**

| Country | Clicks | Impressions | CTR | Position |
|---|---|---|---|---|
| Spain | 3 | 1,076 | 0.28% | 8.0 |
| France | 1 | 559 | 0.18% | 8.8 |
| Colombia | 0 | 83 | 0% | 10.2 |
| **United Kingdom** | **5** | **74** | **6.76%** | 12.5 |
| Peru | 0 | 61 | 0% | 11.7 |
| Ecuador | 0 | 54 | 0% | 10.0 |
| Indonesia | 0 | 45 | 0% | 4.3 |
| Argentina | 1 | 44 | 2.27% | 12.7 |
| United States | 0 | 43 | 0% | 8.6 |
| Brazil | 0 | 42 | 0% | 10.2 |

**`.uk` devices:** desktop 16 clicks / 2,333 impressions; mobile 2 / 37; tablet 0 / 4.

**`.com` (2 days):** two impressions, on `http://chinvatbridge.com/` (position 2) and `/insights` (position 3). No queries shown.

### What the data shows, and what it doesn't

- **Almost all visibility is the bare name, from outside the UK.** 95% of impressions are "chinvat bridge" or "chinvat", mostly desktop searches in Spain, France and Latin America, with 0.18% CTR. These are overwhelmingly people looking up the Zoroastrian bridge, not buyers. The homepage still averages position **8.9** for the name, so the business does appear on page one for it. That corrects the 18 Nov research, which found "only mythology results" using a US-based search tool.
- **Clicks come from two small segments.** Iran gave 8 of the 18 clicks from 20 impressions (40% CTR, position 5.8), and the UK 5 from 74 (6.8%). The data cannot say who these were. The name is Persian, so Iranian searchers may want the bridge or the company. Searches by you or people you know would also look like this. Neither segment is evidence of buyers.
- **No commercial query has reached page one, or page five.** The only relevant non-brand query ("business ai productivity yorkshire") sits at position 71.7; the two position-2 rows are unclear one-off queries. The service pages launched on 20 Nov and have no data yet. `/services/seo` (live since 9 Nov) has 3 impressions at position 60.
- **The north-star figure (qualified organic enquiries) starts at zero by any measure.** Nothing shows a commercial query sending a visitor.
- **What can't be concluded:**
  - Anything about the service pages, the new titles or the two new articles; they are too new.
  - Anything from the `.com` property yet; it has 2 days of data.
  - What the 14 anonymised clicks were.
  - Whether any "chinvat bridge" searcher wanted the company.

### Indexing (Search Console, `.uk` report last updated 16 Nov 2026; `.com` still processing)

**`.uk`: 6 indexed, 11 not indexed.**

| Status | URLs (last crawled) |
|---|---|
| **Indexed (6)** | `/` (16 Nov); `/insights/why-your-website-isnt-bringing-you-customers` (16 Nov); `/services/seo` (13 Nov); `/insights/where-ai-can-save-your-business-time` (9 Nov); `/insights/where-the-name-chinvat-bridge-comes-from` (6 Nov); `/insights/what-should-you-automate-first` (6 Nov) |
| Discovered – currently not indexed (5) | `/insights`, `/insights/when-should-a-business-build-custom-software`, `/pricing`, `/privacy`, `/terms`. **Never crawled** |
| Page with redirect (3) | `http://chinvatbridge.uk/`, `https://chinvatbridge.uk/`, `http://www.chinvatbridge.uk/`. Expected: host variants |
| Not found (404) (1) | `https://www.chinvatbridge.uk/pricingPricing` (crawled 6 Nov). Source found: the footer's React keys (href + label) were serialised into every page, and Google read them as links. Live pages also carry `/insightsInsights`, and `/pricing` carries `/month`. Fixed on the branch (`SEO_TECHNICAL_VERIFICATION.md`); a 404 was the correct answer meanwhile |
| Blocked by robots.txt (1) | `https://r.mail.chinvatbridge.uk/`, the email-tracking subdomain. Harmless |
| Crawled – currently not indexed (1) | A hashed favicon URL. Harmless |

**Notable:**
- `/pricing`, the main SEO commercial page, was never crawled on `.uk`.
- Neither was `/insights`.
- Of the 16 URLs now in the sitemap, the 3 new service pages and the 2 new articles had not been discovered before the switch.

**`.com`:** "Processing data, please check again in a day or so". There is no indexing data yet; the property's data starts 18 Nov.

### Sitemaps

| Property | Sitemap | Submitted | Last read | Status | Discovered pages |
|---|---|---|---|---|---|
| `.com` | `https://www.chinvatbridge.com/sitemap.xml` | 19 Nov 2026 | 21 Nov 2026 | Success | 16 |
| `.uk` | `https://www.chinvatbridge.uk/sitemap.xml` | 14 Sep 2026 | 20 Nov 2026 | Success | 11 |

The `.uk` sitemap URL now redirects to `.com`. Leaving it submitted is harmless; nothing was changed.

### Change of Address

**Submitted 21 Nov 2026 (about 21:03 UTC), and in progress.** On 21 Nov, before submission, the `.uk` property showed only the setup form. The move was submitted after the redirect fix passed 27/27.

| Property | Status shown |
|---|---|
| `chinvatbridge.uk` | "This site is currently moving to chinvatbridge.com"; date started 21 November 2026 |
| `chinvatbridge.com` | "1 of your other sites is moving to this site" (`chinvatbridge.uk`) |

Google's own pre-move validation passed:
- Required: "301-redirect from homepage" ✓ and "Verification for both sites" ✓.
- Recommended: "301-redirects from sample pages" ⚠. Four sample pages showed "Redirect found". "Duplicate redirect targets" listed the old homepage, because its variants share one target.

### Other observations (read only, not acted on)

- **`.com` overview** recommends reviewing "1 unused verification token". Leftover tokens let whoever placed them re-verify. Owner to review under Settings → Users and permissions → Unverified owners.
- **No Core Web Vitals data** on either property ("No data"): the traffic is below CrUX thresholds. Field CWV will not be available soon, so lab measurements stay the only performance evidence.

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
| Server-side sanitisation | **Fixed on this branch.** Before: one character outside the allow-list in a campaign tag (for example `*`, which `URLSearchParams` leaves unencoded) dropped the *whole* entry, landing page included. Now an unusable query is dropped on its own and the path kept; `*` is allowed; a protocol-relative `//host` is refused | `pnpm test:unit` (`tests/unit/enquiry-journey.test.mjs`, 5 tests); `contact` spec passes on three viewports |
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
