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

**Cloudflare's documented behaviour** (developers.cloudflare.com/rules/url-forwarding/, read 21 Nov 2026):
- "Preserve query string" is "disabled by default".
- Single Redirects run first. If a Single Redirect and a Bulk Redirect both match, "the product executed first will apply". The Rules products "take precedence over Page Rules".
- Within one product, "Cloudflare will always use the URL redirect of the first rule that matches".
- Single and Bulk Redirects "require that you proxy the DNS records".

The live behaviour, path kept and query dropped on both hosts and both schemes, is exactly a redirect rule with that default left off.

**What else lives on the `.uk` zone** (public DNS, 21 Nov 2026), which the rule must not touch:

| Host | What it is | Proxied |
|---|---|---|
| `chinvatbridge.uk`, `www.chinvatbridge.uk` | The old website: redirect only | Yes (Cloudflare IPs) |
| `mail.chinvatbridge.uk`, `r.mail.chinvatbridge.uk` | Brevo's branded sending and click-tracking domain (`*.brand.brevosend.com`). Tracked links in emails already sent go through `r.mail` | No |
| MX | Cloudflare Email Routing (`route1–3.mx.cloudflare.net`) | n/a (mail, not HTTP) |

This is why the rule names the two hosts exactly. Cloudflare's own example uses a hostname wildcard (`http*://host/*`); a pattern like `*chinvatbridge.uk` would also catch `r.mail` and break the tracked links in every Brevo email.

**Existing configuration, read in the Cloudflare dashboard on 21 Nov 2026 (read-only; nothing saved; session signed out afterwards):**

| Where | What is there |
|---|---|
| Zone `chinvatbridge.uk` (free plan) → Redirect Rules | **One rule, active, order 1: "UK to COM Permanent Redirect"** (id `28e6d65c560f421b8c51ae81ce5e4d6c`). Custom filter `(http.host eq "chinvatbridge.uk") or (http.host eq "www.chinvatbridge.uk")`; URL redirect, Dynamic, `concat("https://www.chinvatbridge.com", http.request.uri.path)`; 301; **Preserve query string: unticked** |
| `.uk` Page Rules | None (0 of 3 used) |
| `.uk` Workers Routes | None |
| `.uk` Snippets | Not available on the free plan |
| `.uk` other rule types (rewrite, configuration, origin, header, cache) | None |
| Account Bulk Redirects | No lists (0 of 5), so no bulk redirect rule can exist |
| Zone `chinvatbridge.com` Redirect Rules / Page Rules | None / none. The apex → `www` 308 comes from Vercel |
| `.uk` DNS | Apex (A, Vercel) and `www` (CNAME, Vercel): **Proxied**. `mail`, `r.mail`, `img.mail` (Brevo), the Brevo DKIM records and `panel`: **DNS only**. MX: Cloudflare Email Routing |

**Conclusion:**
- The existing rule is the only thing answering for the two `.uk` web hosts, and nothing overrides it.
- It is already identical to the rule below in every field but one: Preserve query string is off.
- It cannot affect Brevo. It names only the two web hosts, and Brevo's hosts are DNS-only, so no Cloudflare rule runs on them at all.

**Smallest correction:** open "UK to COM Permanent Redirect" → tick **Preserve query string** → **Save**. Change nothing else, and create no new rule.

**The rule as it should read after that one change** (for reference; it is the existing rule):

| Field | Value |
|---|---|
| Where | Cloudflare → zone `chinvatbridge.uk` → Rules → Redirect Rules (Single Redirects) |
| Rule name | `uk to com, path and query` |
| When incoming requests match | Custom filter expression: `(http.host eq "chinvatbridge.uk") or (http.host eq "www.chinvatbridge.uk")` |
| Then | URL redirect, type **Dynamic** |
| Expression | `concat("https://www.chinvatbridge.com", http.request.uri.path)` |
| Status code | **301** (unchanged; Google treats 301 and 308 alike) |
| Preserve query string | **On** |
| Position | First in the Redirect Rules list |
| Save | **Deploy**, not "Save as draft" |

`http.request.uri.path` is the path without the query, so the query is added once, by the setting. Putting the query in the expression *and* switching the setting on would duplicate it.

**Order of work:**
1. Inventory: done (above). One rule; no other rule interferes.
2. Tick Preserve query string on the existing rule and **Save**.
3. **Verify:** `pnpm seo:check-migration` must show 27 passed, 0 failed. Then by hand: a magic-link sign-in, and one `.uk` link with `?utm_source=test` in a browser.
4. Keep both `.uk` web records proxied, and keep the redirect for good, or at least 180 days.

**Impact:**

| Who or what | Before | After |
|---|---|---|
| Visitors on old `.uk` links with parameters (campaign tags, shared links) | Land on the right page; parameters lost | Same page, parameters kept, so enquiry attribution records the campaign |
| A `.uk` auth callback (`/auth/callback?code=…`), only if Supabase still falls back to `.uk` (M3) | The code is stripped: sign-in fails | The code arrives: sign-in works |
| Old Stripe return links (`/subscribe/success?session_id=…`) | The session ID is stripped: generic success page | The session ID is kept |
| Search Console Change of Address | Blocked on working redirects | Can start once step 3 passes (M6) |
| `.com` site, email, Brevo tracking, MX | Unaffected | Unaffected: not matched by the rule |
| Stripe webhooks | A webhook pointed at `.uk` fails either way: Stripe does not follow redirects | Unchanged; that is M2, fixed in Stripe |

**Risk and rollback:**
- **Downtime:** none. Rule changes take effect in seconds, and the paths that work today are not changed.
- **What could go wrong:** a typo in the expression makes `.uk` URLs redirect to the wrong place, or fail. Step 3 catches this within a minute.
- **Rollback:** untick Preserve query string and Save; it is back to today's behaviour.
- **Cost:** none. It is one setting on an existing rule.

**What the dropped query breaks, given the current code:**

| Flow | Effect |
|---|---|
| New sign-ins and Stripe checkouts | **Unaffected.** Production builds all callback and return URLs from `SITE_URL`, which is `.com` (`src/lib/site-origin.ts`) |
| `src/app/auth/callback/route.ts` with no `code` | Fails safely to `/login?error=auth_failed` |
| **Supabase (unverified)** | **The remaining real risk.** If Supabase's Site URL is still `.uk`, or `.com/**` is missing from its redirect allow-list, Supabase falls back to the Site URL. The callback then goes to `.uk/auth/callback?code=…`, the redirect strips the code, and every magic-link and Google sign-in fails. Owner check in `SEO_REMEDIATION_REGISTER.md` |
| Campaign links and shared links on `.uk` | Lose their parameters, so enquiry attribution records no campaign |
| Search Console Change of Address | Should wait for the fix (Google's prerequisite is working redirects) |

### Stripe and Supabase after the domain move: owner checks

**Verified from outside (21 Nov 2026, read-only):**

| Check | Result |
|---|---|
| `GET https://www.chinvatbridge.com/api/webhooks/stripe` | 405: the route exists and accepts only POST, as built |
| Same path on `https://chinvatbridge.com` | 308 to `www` |
| Same path on `https://www.chinvatbridge.uk` | 301 to `.com` |
| Checkout success and cancel URLs (`src/actions/checkout.ts`) | Built from `SITE_URL`, so `.com` in production |
| Sign-in: what the live site asks Supabase for | One "Continue with Google" click from a fresh, signed-out browser, stopped at Google's sign-in form. `redirect_to` = `https://www.chinvatbridge.com/auth/callback?next=/dashboard`. Google's return address is `ponsocflxgdufnvfesav.supabase.co/auth/v1/callback`, so the Google OAuth client does not depend on your domain. Supabase's `state` is opaque on this version, so its Site URL and allow-list **cannot** be read from outside. Each click left one abandoned sign-in record in Supabase (two in all), which expires on its own |
| Magic-link email | Not tested: it sends an email |

**Stripe (M2).** Stripe does **not follow redirects** for webhooks: any 3xx counts as a failed delivery. So the endpoint must be exactly the `www.…com` URL. The `.uk` and apex `.com` addresses both fail every event. The webhook handles `checkout.session.completed` (creates the customer's account), `invoice.payment_failed` and `customer.subscription.deleted`.

1. **Live mode on.** Dashboard → Developers → Webhooks. The endpoint URL must read exactly `https://www.chinvatbridge.com/api/webhooks/stripe`. If it names `.uk` or `chinvatbridge.com` without `www`, edit the URL. Its signing secret stays the same, so Vercel needs no change.
2. In that endpoint, **Event deliveries**, filtered to failed, from 19 Nov onwards. For each failed event, select **Resend**, after step 1.
3. The endpoint listens for the three events above, at least.
4. Settings → Billing → **Customer portal**: any default return link on `.uk` → `.com`.
5. Settings → Business → **Public details**: the business website on `.uk` → `https://www.chinvatbridge.com`. This appears on receipts and invoices.
6. Optionally, Payment Links or Checkout settings: any success URL on `.uk`. The code doesn't use them, but older links might.
7. **Prove it without a payment:** the endpoint page → **Send test event** → `checkout.session.completed`. Expect a 400 or 200 from `www.chinvatbridge.com`, never a 3xx. A 400 is normal for a test event without real data; a 3xx means the URL is wrong.

**Supabase (M3).**
1. Authentication → **URL Configuration**:
   - **Site URL:** exactly `https://www.chinvatbridge.com`.
   - **Redirect URLs** include `https://www.chinvatbridge.com/**`. Keep `https://www.chinvatbridge.uk/**` until Change of Address completes; it does no harm.
   - This matches the repo's `supabase/config.toml`.
2. Authentication → **Email Templates**: any template with a hard-coded `chinvatbridge.uk` link → use `{{ .SiteURL }}` or `.com`.
3. Authentication → **SMTP Settings** (if custom SMTP is on): the sender address and domain are yours to choose. Note it only; nothing breaks from `.uk` here.
4. Google Cloud console → APIs & Services → **OAuth consent screen**: app home page and privacy-policy links on `.uk` → `.com`, and `chinvatbridge.com` added under Authorised domains. If the app's branding is verified, changing these may trigger a Google review, so plan for it. Leave **Credentials → Authorised redirect URIs** alone: it is the Supabase callback.
5. **Prove it:** one magic-link sign-in at `https://www.chinvatbridge.com/login` to your own inbox. The link in the email must start with your Supabase project URL, and after clicking it you must land on `https://www.chinvatbridge.com/dashboard` (not `.uk`, not `/login?error=auth_failed`). Then one "Continue with Google". This sends one email to you; it is your action to take.

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
| Footer list keys no longer produce URL-like strings (`/pricingPricing`, `/insightsInsights`) in every page's serialised data. Google had crawled one of them as a 404 (Search Console, `.uk` Page indexing) | `src/components/site/SiteFooter.tsx` | Site-wide check below |
| The `/pricing` card's "/month" no longer appears as a standalone path-like string (same class, found by the site-wide check). Text on screen unchanged ("£299/month") | `src/components/organisms/sections/PricingCard.tsx` | Site-wide check below; rendered HTML reads `/<!-- -->month` |
| New regression test: every path-like string in a sitemap page's HTML must resolve | `tests/e2e/routes.spec.ts` | Passes on the branch; **fails on the live site** with `"/insightsInsights" (in the HTML of /)`, so it catches the original bug |
| The three articles published since the render list was written (name origin, spreadsheets, SEO cost guide) added to the routes render check | `tests/e2e/routes.spec.ts` | Pass |
| Unit tests for the attribution sanitiser (`pnpm test:unit`, Node's built-in runner, no new dependency). It feeds only the enquiry email, which e2e cannot see | `tests/unit/enquiry-journey.test.mjs`, `package.json` | 5 passed |
| Social-share card (`opengraph-image.png`) printed **chinvatbridge.uk**. Re-rendered with `.com`; nothing else on the card changed, and the other brand assets re-rendered byte-identical | `scripts/brand/render-brand-assets.mjs`, `src/app/opengraph-image.png` | Image inspected |
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
| **Re-run after the footer, pricing-card and test changes** | |
| `pnpm lint`, `pnpm typecheck`, `pnpm build` (39 static pages) | Pass |
| `pnpm test:unit` | 5 passed, 0 failed |
| `routes`, `shell`, `service-pages` specs, three viewports | **80 passed, 0 failed**, 88 skipped by design |

### Site-wide check for crawlable fake paths (21 Nov 2026)

**Method:** fetch each page's raw HTML. Collect every quoted string that looks like a site path, in the markup and in the escaped serialised data. Request each one and flag any that doesn't resolve to 200, directly or after one redirect. Build assets under `/_next/static/` are excluded.

| Target | Pages | Path-like strings | Unresolved |
|---|---|---|---|
| Live site (`main`) | 16 sitemap pages + `/login`, `/client-portal`, a 404 page | 58 | `/insightsInsights` and `/pricingPricing` **on all 19 pages**; `/month` on `/pricing` |
| Branch, local build | The same + `/subscribe/cancelled`, `/bridge-studies`, three `/hero-studies/*` | 66 | **None**, except `/_not-found` on the 404 page itself (Next.js's internal route name; not linked, and the page is never indexed) |

Other keys built from links (`SiteHeader`, `MobileMenuSheet`, `CrossingHero`, `ServiceBlocks`, `not-found`) use the bare href, which is a real page, so they are harmless. The check confirms this.
