# Technical SEO verification

**Run:** 21 November 2026, against the live site (`https://www.chinvatbridge.com`, which deploys `main` at `5468f1a`) and against a local production build of branch `seo/remediation-2026-11-21`. Every live check used read-only `GET`/`HEAD` requests.

## Tools added (re-runnable)

| Command | What it checks |
|---|---|
| `pnpm seo:check-migration` (`scripts/seo/check-migration.mjs`) | Every `.uk` host and scheme redirects 301/308 to the same path **and query** on `.com`; `.com` apex and `http` reach `www` with path and query; `robots.txt` names the canonical sitemap; every sitemap URL is on `.com`, returns 200, is indexable and canonicalises to itself. Exits 1 on any failure |
| `pnpm seo:crawl [-- --external]` (`scripts/seo/crawl-live.mjs`) | Crawls from the homepage and sitemap. Per page: status, title and description length, H1 count, canonical, robots tags (including conflicts), JSON-LD parse and types, images without `alt`, internal links that 404 or redirect. With `--external`, every outbound link |
| `python3 scripts/seo/gsc-summary.py <export>` | Summarises a Search Console Performance export: totals, brand / name-only / non-brand, page groups, low-CTR pages, countries, devices. See `SEO_MEASUREMENT_BASELINE.md` |

## Results: live site, 21 Nov 2026

### Domain migration (`pnpm seo:check-migration`): 21 passed, 6 failed

| Check | Result |
|---|---|
| `.uk` → `.com` with a query string: `/auth/callback?code=…`, `/subscribe/success?session_id=…`, `/insights?utm_…`, apex and `www`, `http` and `https` | **FAIL, all six.** 301 to the correct path; **query string dropped** |
| `.uk` → `.com` without a query | Pass (301, path kept) |
| `.com` apex and `http` → `https://www.` | Pass (308, path and query kept) |
| `robots.txt` | Pass: `Sitemap: https://www.chinvatbridge.com/sitemap.xml` |
| Sitemap, 16 URLs | Pass: all on `.com`, all 200, all `index, follow`, all self-canonical |

**Diagnosis of the redirect.** Observed from outside:

- **Preserved:** the path, exactly. That includes trailing slashes (`/insights/` → `.com/insights/`) and percent-encoding (`/a%20b/c`).
- **Dropped:** the query string, on every host (`chinvatbridge.uk`, `www.`) and scheme (`http` goes straight to `https://www.chinvatbridge.com`, one hop).
- **Responder:** `server: cloudflare`, a `cf-ray` header, no cache headers. Cloudflare answers before anything reaches Vercel.
- `/robots.txt` on `.uk` is served by Cloudflare's managed robots feature, which runs before the redirect.

That pattern means a single Cloudflare rule rewrites the path with "preserve query string" off. The owner reported switching it on on 19 Nov, so either:

1. the edit was not saved and deployed (Cloudflare rule edits are drafts until deployed); or
2. another rule answers first. In Cloudflare's Rules phase order, Single Redirects run before Bulk Redirects, and an older Page Rule "Forwarding URL" can also match; or
3. the rule's target is a dynamic expression whose own query handling differs from the checkbox.

Which of these it is can only be seen in the dashboard.

**Production-safe fix (owner to apply; not changed):**

1. Cloudflare → `chinvatbridge.uk` zone → Rules → Overview. List every rule that can match the zone: Redirect Rules, Page Rules, Bulk Redirects (account level), and any Workers routes. There should be exactly one `.uk` → `.com` redirect. Disable or delete the others after noting them.
2. Edit the remaining rule to this form:
   - **If incoming requests match:** custom filter expression `(http.host eq "chinvatbridge.uk") or (http.host eq "www.chinvatbridge.uk")`.
   - **Then:** URL redirect, type **Dynamic**, expression `concat("https://www.chinvatbridge.com", http.request.uri.path)`, status **301**, **Preserve query string: on**.
   - **Deploy.** Not "Save as draft".
3. Run `pnpm seo:check-migration`. Every line should pass. The sign-in callback, Stripe return and campaign-tag cases are in the script.
4. Keep both `.uk` DNS records proxied (orange cloud), or the rule stops running. Keep the redirect for at least 180 days, and preferably for good.

301 stays: it is the intended status, and Google treats 301 and 308 alike for indexing.

**What the dropped query breaks, given the current code:**

| Flow | Effect |
|---|---|
| New sign-ins and Stripe checkouts | **Unaffected.** Production builds all callback and return URLs from `SITE_URL`, which is `.com` (`src/lib/site-origin.ts`) |
| `src/app/auth/callback/route.ts` with no `code` | Fails safely to `/login?error=auth_failed` |
| **Supabase (unverified)** | **The remaining real risk.** If Supabase's Site URL is still `.uk`, or `.com/**` is missing from its redirect allow-list, Supabase falls back to the Site URL. The callback then goes to `.uk/auth/callback?code=…`, the redirect strips the code, and every magic-link and Google sign-in fails. Owner check in `SEO_REMEDIATION_REGISTER.md` |
| Campaign links and shared links on `.uk` | Lose their parameters, so enquiry attribution records no campaign |
| Search Console Change of Address | Should wait for the fix (Google's prerequisite is working redirects) |

### Independent crawl (`pnpm seo:crawl -- --external`): 18 pages, 0 errors

| Check | Result |
|---|---|
| Status | All 16 sitemap URLs 200. `/login` and `/client-portal` reached and `noindex, nofollow` |
| Titles | All present. Two over 65 characters: `/insights` (66), "Why your website isn't bringing you enough customers" (69). Warnings only |
| Descriptions | All 134–159 characters |
| H1 | Exactly one on every page |
| Canonicals | Self-referencing on every indexable page |
| Robots | No conflicting tags. No indexable page outside the sitemap; no noindex page inside it |
| JSON-LD | Parses everywhere. Organization + WebSite sitewide; Service + BreadcrumbList on the four service pages; Article + BreadcrumbList on the seven articles; CollectionPage + BreadcrumbList on `/insights`; BreadcrumbList on `/pricing` |
| Images | Every `<img>` has an `alt` attribute (two empty, decorative) |
| Internal links | None to a 404 or a redirect |
| Outbound links | All 6 on the live pages return 200. All 11 outbound links in published and draft post modules return 200 (checked separately) |

### Not verifiable from here

| Check | Needs |
|---|---|
| Google Rich Results Test, URL Inspection (live test, Google-selected canonical, index status) | Search Console access. The Rich Results Test has no public API; the owner can run it at `search.google.com/test/rich-results` on one service page and one article |
| Field Core Web Vitals (INP, LCP, CLS at p75) | Search Console's Core Web Vitals report or CrUX. Lab figures stand: mobile LCP 1.4–2.3 s, CLS ≤ 0.006, homepage median TBT 491 ms (19 Nov). **No performance change is made without field data** |
| Mobile usability | Google retired the Mobile Usability report in December 2023. The e2e suite runs every page at 390×844 and checks for zero horizontal overflow |
| JavaScript rendering | All checks above parse raw server HTML with no JavaScript, and content, links, metadata and JSON-LD are all present. Pages are prerendered (39 static pages) |

## Changes on branch `seo/remediation-2026-11-21`, and their verification

| Change | Files | Verified by |
|---|---|---|
| Titles say "Small Businesses"; homepage title drops "Custom" | `src/lib/constants.ts`, `src/data/service-pages.ts`, `tests/e2e/routes.spec.ts`, `docs/redesign/COPY_CHANGES.md` | Local production build: `<title>` on `/` and `/services/custom-software` rendered as intended; `routes` and `home`/`shell` specs pass |
| Enquiry attribution: an unusable campaign query no longer discards the landing page; `*` allowed (unencoded by `URLSearchParams`); protocol-relative `//host` refused | `src/lib/enquiry-journey.ts` | Compiled and run on 12 edge cases (all as expected); `contact` spec passes on desktop, tablet and mobile |
| Spreadsheets article cites the ICO data-security guide for its UK GDPR sentence (the brief's source, omitted when it was converted) | `src/content/blog/posts/replace-spreadsheets-with-custom-software.tsx` | Link returns 200; build passes |
| `routes.spec.ts` updated for the two articles published on 20 Nov. **The suite on `main` has failed since `5468f1a`**: that commit published two articles without removing them from the spec's draft list or updating the `/insights` lastmod | `tests/e2e/routes.spec.ts` | `routes`: 33 passed, 0 failed |
| Stale editorial README ("None is published") | `seo/overnight-2026-11-18/editorial/README.md` | — |
| Three SEO scripts and two `package.json` scripts | `scripts/seo/*`, `package.json` | Run against the live site; GSC script on a synthetic fixture (scratchpad only, never recorded as data) |

### Test runs (local production build, `NEXT_PUBLIC_SITE_URL=https://www.chinvatbridge.com`, Next.js 16.4.5, server on :3100)

| Run | Result |
|---|---|
| `pnpm lint` | Pass |
| `pnpm typecheck` | Pass |
| `pnpm build` | Pass, 39 static pages |
| `routes`, `service-pages`, `contact`, `insights` specs, before the spec fix | 92 passed, **2 failed** (the stale draft list and lastmod), 68 skipped by design |
| `routes` spec after the fix | 33 passed, 0 failed, 66 skipped by design |
| `home`, `shell` specs | 38 passed, 0 failed, 16 skipped by design |
| Full suite | Not run: about 20 minutes on software WebGL, and nothing outside these specs was touched |
