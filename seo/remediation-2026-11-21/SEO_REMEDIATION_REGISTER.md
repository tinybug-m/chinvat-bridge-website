# SEO remediation register

**Started:** 21 November 2026, from `chinvat-bridge-seo-handover-2026-11-21.md` (outside the repository; unchanged).
**Branch:** `seo/remediation-2026-11-21`, from `main` at `5468f1a`. Local only: **not pushed, not deployed**. No production setting, Cloudflare, Stripe, Supabase, Vercel or DNS configuration was changed. No email was sent, nobody was contacted, and no account or profile was created.

**Statuses:**
- Not started
- Investigating
- Waiting for owner
- Waiting for access
- Implementing
- Implemented
- Verified
- Blocked

"Verified" on a code change means verified on a local production build. Nothing on this branch is live until you approve a push.

## Register

| ID | Issue | Priority | Required action | Status | Verification |
|---|---|---|---|---|---|
| **Stage 1: domain migration** | | | | | |
| M1 | `.uk` → `.com` redirect drops the query string | Critical | Your existing rule "UK to COM Permanent Redirect" (`.uk` zone, the only rule, matching exactly `chinvatbridge.uk` and `www.`) is correct except **Preserve query string: unticked**. Correction: tick it and Save; nothing else (dashboard read 21 Nov; details and impact in `SEO_TECHNICAL_VERIFICATION.md`) | **Waiting for owner** (you tick one box, or approve me doing it) | Confirmed in the dashboard: no Page Rules, Workers Routes, Bulk Redirects or other rule interferes; Brevo hosts are DNS-only, so no rule can touch them. Brevo's `mail`/`r.mail` hosts on the same zone are deliberately not matched. `pnpm seo:check-migration` fails on exactly the 6 query cases today, and must show 27 passed after |
| M2 | Stripe webhook endpoint may still name `.uk` (deliveries would get a 301 and fail; this webhook creates paying customers' accounts) | Critical | You check: Stripe → Developers → Webhooks → the endpoint URL must be `https://www.chinvatbridge.com/api/webhooks/stripe`. Then check its recent deliveries for failures, and resend any failed events. Seven-step check, including a test event that needs no payment, in `SEO_TECHNICAL_VERIFICATION.md` | **Waiting for owner** | From outside: the `www.…com` route answers (405 to GET); `.uk` 301s and apex 308s, so Stripe would fail on either. The endpoint itself is visible only in the dashboard |
| M3 | Supabase Site URL and redirect allow-list unverified. With `.uk` as the Site URL, sign-in breaks via M1 | Critical | You check: Supabase → Authentication → URL Configuration. Site URL `https://www.chinvatbridge.com`; Redirect URLs include `https://www.chinvatbridge.com/**` (keep `.uk/**` for now). Then one sign-in at `/login` with an email link. Also email templates and the Google OAuth consent screen. Full list in `SEO_TECHNICAL_VERIFICATION.md` | **Waiting for owner** | The live site requests `redirect_to` = `.com/auth/callback`, and Google returns to the Supabase callback (checked 21 Nov from a signed-out browser). The Site URL and allow-list can't be read from outside: Supabase's `state` is opaque. Reported done on 19 Nov |
| M4 | Search Console: state of both properties unknown | Critical | Read both properties (owner signed in to a browser session on 21 Nov; read-only). API client also available (`scripts/seo/gsc-api.py`) | **Verified** | Both are Domain properties; verified owner of each. Baseline in `SEO_MEASUREMENT_BASELINE.md` |
| M5 | Sitemap submission and URL inspection of the 16 URLs | High | `.com` sitemap submitted by the owner on 19 Nov: read 21 Nov, Success, 16 discovered. `.com` indexing still "processing"; re-check in a few days. Indexing requests for the service pages: not recorded | **Implemented** | Search Console Sitemaps page, 21 Nov |
| M6 | Change of Address `.uk` → `.com` | High | Not started (confirmed). Owner runs it from the `.uk` property once M1 passes `pnpm seo:check-migration` | **Blocked** (on M1 only; ownership confirmed) | Change of address page, 21 Nov: setup form only, no move in progress |
| M7 | Local `.env.local` still sets `NEXT_PUBLIC_SITE_URL` to `.uk` (local builds only) | Low | Set it to `https://www.chinvatbridge.com`. Your credentials file, so I haven't touched it | **Waiting for owner** | — |
| **Stage 2: measurement** | | | | | |
| S1 | No analytics | Critical | Plausible Starter ($9/month) recommended; Vercel Web Analytics compared. Needs your approval and a privacy-policy line | **Waiting for owner** | Comparison in `SEO_MEASUREMENT_BASELINE.md` (vendor pages read 21 Nov) |
| S2 | Vercel Terms: Hobby is "for your personal or non-commercial use" | High | Tell me which Vercel plan the project is on | **Waiting for owner** | Terms of Service, section 4 |
| S3 | Enquiry attribution: one odd character in a campaign tag discarded the landing page | Medium | Keep the path when only the query is unusable; allow `*`; refuse `//host` | **Verified** | `pnpm test:unit` (5 tests, in the repo); `contact` spec passes on 3 viewports |
| S4 | Real enquiry email never tested | High | One test enquiry from the live form to your inbox, after the next deploy | **Waiting for owner** (approval to send) | — |
| S5 | Search Console baseline tooling | High | `scripts/seo/gsc-summary.py` | **Verified** | Run on the real 21 Nov exports. Figures cross-checked by a separate script; four corrections made in the baseline (non-brand position range, Iran's 8 clicks, start date, page impressions not additive) |
| S6 | Baseline and trackers empty | High | Search Console baseline recorded; enquiry tracker and analytics still empty | **Implemented** | `SEO_MEASUREMENT_BASELINE.md` |
| **Stage 3: trust** | | | | | |
| T1 | /pricing: undefined "assets"; Starter "Basic" vs "Full" audit; "content velocity"; "Enterprise-grade"; "Dedicated senior SEO consultant" | High | `pricing-wording.sql`. Part 1 is wording only, ready. Part 2 needs your facts (what an asset is; which audit Starter gets; whether a senior consultant is dedicated; whether "SEO automation & schema pipelines" is delivered) | **Waiting for owner** | Live text checked 21 Nov |
| T2 | SEO cost guide (published) contradicts /pricing: it warns against "very high volumes at very low prices" while Scale sells 35 undefined assets for £799. Every other statement checks out against /pricing and the terms | High | Either fix /pricing first (T1, recommended), or take the article back to draft until T1 is done | **Waiting for owner** | Article text reviewed line by line |
| T3 | Six service-page commitments live without recorded approval | High | Confirm each is true (list below) | **Waiting for owner** | All six live, phrase-checked 21 Nov |
| T4 | Privacy-policy attribution line live without recorded approval | High | Approve or edit (below) | **Waiting for owner** | Line live, checked 21 Nov |
| **Stage 4: keywords** | | | | | |
| K1 | No measured search volume for any keyword | High | Google Keyword Planner (free with a Google Ads account, no spend) or Search Console queries | **Waiting for access** | — |
| K2 | Titles said "SMEs"; buyers search "small business" | Medium | Titles changed on three pages; the homepage title drops "Custom" to stop competing with `/services/custom-software` | **Verified** | Autocomplete evidence; local build; `routes`, `home` and `shell` specs pass |
| K3 | Keyword map out of date | Medium | `SEO_KEYWORD_STRATEGY_UPDATED.md`: all 79 keywords decided (11 prioritise, 42 retain, 1 reassign, 13 investigate, 12 remove), and the URL map updated | **Implemented** | Qualitative; re-rank after K1 |
| **Stage 5: technical** | | | | | |
| X1 | No independent crawl of the live site had ever been run | High | `scripts/seo/crawl-live.mjs` | **Verified** | 18 pages, 0 errors, 2 title-length warnings, all outbound links 200 |
| X2 | Test suite failing on `main` since `5468f1a` (published articles still in the draft list; stale lastmod) | High | Update `routes.spec.ts` | **Verified** | `routes`: 33 passed, 0 failed |
| X3 | Rich Results Test and URL Inspection never run | Medium | Needs Search Console (URL Inspection). You can run the Rich Results Test manually | **Waiting for access** | — |
| X4 | Field Core Web Vitals unknown | Medium | Both properties report "No data" (traffic below CrUX thresholds). Rely on lab data; no performance work without evidence | **Blocked** (insufficient traffic) | Search Console overview, 21 Nov |
| X5 | Two titles over 65 characters (`/insights` 66; "Why your website…" 69) | Low | Fold into the B2B refresh of that article (C4); leave `/insights` | Not started | Crawl warning |
| X6 | Design-study routes public (`/bridge-studies`, `/hero-studies/*`; noindex, unlinked) | Low | Remove from production, or keep as your review tool? | **Waiting for owner** | Live 200 + noindex |
| X7 | `/services` returns 404, while the header "Services" link goes to the homepage section | Low | A hub page needs content you'd approve; a redirect to `/#services` is the cheap option. No change until you choose | **Waiting for owner** | Live 404 |
| **Stage 6: content** | | | | | |
| C1 | Spreadsheets article: its UK GDPR sentence lost the ICO source its brief cited | Medium | Cite the ICO data-security guide inline | **Verified** | Link 200; build passes |
| C2 | Outbound links in posts | Medium | Check all | **Verified** | 11 of 11 return 200 |
| C3 | Eight drafts: order and gates | Medium | Order in `SEO_90_DAY_EXECUTION_PLAN.md`; each needs your read | **Waiting for owner** | — |
| C4 | "Why your website isn't bringing you enough customers" targets local consumer businesses; the buyer is B2B | Medium | B2B section, plus a shorter `seoTitle` | Not started | — |
| C5 | Scornik Gerstein case study | High | Needs the client's permission; nothing confidential used | **Waiting for owner** | — |
| **Stage 7: authority** | | | | | |
| A1 | LinkedIn company page: does it exist? (Code cites "the company's LinkedIn overview"; the 18 Nov research found none) | High | Send me the URL, or confirm there isn't one | **Waiting for owner** | Web search finds none; LinkedIn returns 403 to automated requests, so inconclusive |
| A2 | Backlinks and mentions | High | Public search finds no page mentioning either domain, and no third-party mention of the business. For a real profile: Search Console → Links (after M4), and/or Ahrefs Webmaster Tools (free, needs site verification) | **Waiting for access** | WebSearch, 21 Nov |
| A3 | `sameAs` in Organization schema | Medium | Add only verified profiles | **Blocked** (on A1) | — |
| A4 | No named person or author | Medium | Your decision: name the founder, with a short bio? | **Waiting for owner** | — |
| G1 | Search Console: 5 unread messages; "1 unused verification token" on `.com` | Medium | Owner reads the messages (opening them marks them read, so I left them) and reviews the leftover token under Users and permissions | **Waiting for owner** | Search Console overview, 21 Nov |
| G2 | Google crawled `https://www.chinvatbridge.uk/pricingPricing` (404). Cause: footer list items were keyed `href + label`, and React serialises keys into every page, so strings like `/pricingPricing` and `/insightsInsights` (one per footer link) were in the HTML for Google to try | Low | Key footer items by label (`src/components/site/SiteFooter.tsx`) | **Verified** | Site-wide check: live has `/insightsInsights` and `/pricingPricing` on all 19 pages scanned; the branch has none on 24 pages. A new `routes` test fails on live and passes on the branch |
| A5 | Outreach (Scornik credit, contributor pitch) | Medium | Drafts exist; sending them is yours | **Waiting for owner** | — |
| G3 | `/pricing` HTML carries `"/month"` as a standalone string (the plan's billing period from the database), the same class as G2 | Low | Render the slash as its own text node (`PricingCard.tsx`); on-screen text unchanged; database untouched | **Verified** | Site-wide check; rendered `£299/<!-- -->month` |
| G4 | Social-share card prints `chinvatbridge.uk` on every shared link | Medium | Re-render `opengraph-image.png` with `.com` (`scripts/brand/render-brand-assets.mjs`) | **Verified** | Image inspected; other brand assets byte-identical |
| G5 | Missing tests: the sanitiser had none; three published articles were missing from the render list; nothing guarded against G2 recurring | Medium | `tests/unit/enquiry-journey.test.mjs` (`pnpm test:unit`); `routes.spec.ts` render list and path-string test | **Verified** | 5 unit tests; routes, shell and service-pages 80 passed, 0 failed |
| M8 | `.com` indexing: monitor until all 16 sitemap URLs are indexed | High | Re-check Search Console Pages on `.com` around 24–25 Nov in the existing browser session, then **sign that session out** and confirm it has ended. Later checks use the API client (`gsc-api.py`) or your own exports | **Implementing** (waiting on Google) | 21 Nov: "Processing data"; sitemap read, 16 discovered |

## Decisions needed from you

**All pricing, commitment and privacy decisions, with live wording, options, fallbacks and a reply template: `OWNER_DECISIONS.md`.** The tables below are the short form.

### Service-page commitments (T3)

Is each one true of how you actually deliver?

| # | Page | Sentence (live) | File |
|---|---|---|---|
| 1 | Workflow automation | "We build in alerts and logs, and write down how each workflow works, so it doesn't become a black box nobody dares touch." | `src/data/service-pages.ts:304` |
| 2 | Workflow automation | "We build workflows to fail loudly rather than silently: errors raise an alert, failed steps can be retried, and there is a record of what happened." | `:382` |
| 3 | Workflow automation | "…connector platforms such as Zapier or Make… we use them where they are reliable enough for the job." | `:288` |
| 4 | Custom software | "…test it with them before it replaces anything." | `:536` |
| 5 | Custom software | "Design, development and integration in short cycles, shown to you as it takes shape." | `:544` |
| 6 | AI integration | "…we build in review steps, limits on what the system may do on its own, and a record of what it did…" (also lines 169 and 195) | `:117` |

### Privacy-policy line (T4)

Live in `src/app/(pages)/privacy/page.tsx`:

> With a message you send us, the page you were reading, the first page of your visit (including any campaign tags in the link you followed), and the name of the website that referred you, if any, so we know what prompted it. The page keeps this in memory while you browse; nothing is saved to your device.

**Accuracy against the code:** accurate. It covers the first page, the campaign tags, the referrer as a site name and the previous page, and it is true that nothing is stored on the device.

**What it doesn't settle:** whether the policy as a whole meets your UK GDPR obligations (lawful basis, retention). That needs your judgement or legal advice, and I can't certify it.

If analytics is added (S1), the policy needs one more line.

## Stage reports

### Stage 1: migration

**Resolved:**
- The cause is narrowed to the Cloudflare rule configuration (diagnosis and exact fix in `SEO_TECHNICAL_VERIFICATION.md`).
- A one-command check now exists, and it fails today on exactly the right six cases.
- Code review shows new sign-ins and checkouts already avoid `.uk`. The live risk is Supabase's fallback to its Site URL.

**Needs you:** M1, M2, M3, and M4 (access).

### Stage 2: measurement

**Resolved:** the attribution sanitiser bug; tooling for the Search Console baseline; an analytics recommendation with verified costs.

**Needs you:** S1 (approve Plausible and its cost), S2 (Vercel plan), S4 (one test email), M4 (data).

### Stage 3: trust

**Resolved:** pricing replacement SQL, with the wording-only part separated from the parts that need facts; the cost guide reviewed line by line, with exactly one contradiction found.

**Needs you:** T1, T2, T3, T4.

### Stages 4–7

**Resolved:**
- Titles moved to "Small Businesses".
- Keyword decisions recorded.
- Independent crawl clean.
- The failing test suite fixed.
- An unsourced legal sentence sourced.
- All outbound links verified.
- No public trace of backlinks or a LinkedIn page.

**Needs you:** K1 (Keyword Planner), A1 (LinkedIn), C3/C5, X6/X7.

### Branch review (21 Nov 2026)

Every commit on `seo/remediation-2026-11-21` was reviewed against `main`. There are eight commits, not six.

**Regressions:** none found.
- The one shared constant changed, `SITE_TITLE`, is used only in the root layout's metadata.
- The sanitiser keeps every input the old one accepted, except a protocol-relative `//host`, which it now refuses on purpose.
- Re-runs pass: lint, typecheck, build, unit, and routes, shell and service-pages on three viewports.

**Unnecessary changes:** none in the site code.
- `scripts/seo/gsc-api.py` (328 lines) has never been run against the real API, because the baseline came through the browser instead.
- It stays as the read-only route for monthly pulls once the browser session is signed out.
- It is a script, never deployed. Remove it before merge if you'd rather not authorise an OAuth client.

**Missing tests, now added (G5):**
- Sanitiser unit tests.
- A path-string guard for G2: it fails on the live site and passes on the branch.
- The three published articles in the render list.

**Still untested by design:**
- Real email delivery (S4).
- Real sign-in and checkout (M2, M3; your dashboards).
- The Cloudflare rule (M1; `pnpm seo:check-migration` once it changes).

**Found during the review and fixed:**
- G3, `/month`.
- G4, the social card on `.uk`.
