# Technical verification

All checks run on 18 November 2026 against the branch `seo/overnight-2026-11-18`.

## Baseline (before any change, `main` at `64a4fc0`)

| Check | Result |
|---|---|
| `pnpm lint` | Pass, no issues |
| `pnpm typecheck` (`next typegen && tsc --noEmit`) | Pass |

## After the code changes

| Check | Command | Result |
|---|---|---|
| Lint | `pnpm lint` | Pass, no issues |
| Types | `pnpm typecheck` | Pass |
| Production build | `NEXT_PUBLIC_SITE_URL=https://www.chinvatbridge.com pnpm build` | **Pass.** 37 static pages generated; the three new routes are static (○). The first attempt stopped on a Next.js security advisory for 16.4.3 (`SecurityFatalError`, a prompt to upgrade); the identical re-run completed and printed the advisory as a warning. No code issue. |
| End-to-end | `BASE_URL=http://localhost:3000 npx playwright test` against `pnpm start` | **280 passed, 0 failed, 95 skipped** in 15.7 min across desktop (1440×900), tablet (768×1024) and mobile (390×844). The skips are the suite's own per-viewport `test.skip` conditions. The new `service-pages.spec.ts` ran 6 tests × 3 viewports, all passing. |

## After the enquiry-attribution commit (`21afd32`)

| Check | Result |
|---|---|
| Lint, types, production build | Pass (same Next.js advisory on the first build attempt; the re-run completes) |
| `contact`, `routes`, `service-pages` specs, all viewports | **76 passed, 0 failed, 62 skipped by design.** The new test "a message sent after reading a service page says which page prompted it" passes on desktop, tablet and mobile. |
| Sanitiser (`lib/enquiry-journey.ts`), compiled and run on edge cases | Normal journeys produce "First page: /services/ai-integration (from www.google.com)" and "Page before contact: …"; `javascript:` paths, CR/LF header-injection attempts, hosts with spaces and non-string values are all dropped |
| Real email sending | Not exercised: `.env.local` has no Gmail credentials, and the e2e sends fall inside the action's three-second bot window, which returns before any mail is attempted. No enquiry email was sent during testing. |

## After the review fixes (`6a5e7e3`)

| Check | Result |
|---|---|
| Full e2e suite after the code-review fixes | **283 passed, 0 failed, 95 skipped by design** (378 tests, 15.3 min) |
| Lint, types, production build after the content-review copy fixes | Pass |
| `routes`, `service-pages`, `services`, `hero`, `contact` specs on the final build | **126 passed, 0 failed, 63 skipped by design** |
| Sanitiser re-run | Percent-encoded entry kept; `javascript:` entry dropped while a valid "page before contact" is kept; CR/LF values dropped |

## Next.js 16.4.5 and the draft posts

| Check | Result |
|---|---|
| `pnpm audit --prod` after the upgrade | No known vulnerabilities |
| Build on 16.4.5 | Passes first time; the advisory gate no longer triggers |
| Full e2e suite on 16.4.5 | **283 passed, 0 failed, 95 skipped by design** (17.1 min) |
| Production build with nine drafts registered | Still 37 static pages; draft URLs return 404; sitemap still 14 URLs |
| `routes`, `insights`, `service-pages` specs, including the new draft guard | **62 passed, 0 failed** |
| `next dev` | Drafts render at `/insights/<slug>` with "Draft, not published", `noindex` and the short `<title>`; tables render without overflow at 390 px. No tracked files changed by the dev server. |
| Homepage CPU profile (4× slowdown) | Four long tasks, 716 ms of blocking time; details and a proposed fix in [T10](03-technical-seo-audit.md#t10-homepage-main-thread-cost-on-mobile--medium) |

## Independent review

Two reviews ran at the end of the session. A code review of `main...seo/overnight-2026-11-18` raised 8 findings; all are fixed (see the [implementation log](implementation-log.md)). An adversarial content review raised 4 must-fix, 11 should-fix and 17 could-improve items. All must-fix and should-fix items are corrected, as are most could-improve items. These were deliberately left:

| Item | Why left |
|---|---|
| The legal entity named in the terms, footer, checkout and schema | The facts aren't known; it is the first owner decision and a blocker for listings |
| The Scornik Gerstein mention in the software page's "How we build" isn't a link | The detail block renders plain text; the homepage Recent work links the live site |
| The AI service's schema name "AI & Automation Integration" overlaps the automation page | It matches the homepage plate name; changing the service's name is the owner's call |
| The homepage title shares "for UK SMEs" with two service titles | Different head terms (brand router vs service); monitor in Search Console |
| The AI-consultant draft asks readers to request a demo, which we can't yet give | Flagged in the draft's review notes for the owner |

The reviewer independently re-verified the ONS and DSIT figures, the Google and ICO sources, plan prices and terms, and every repository fact in the case study.

## Rendered output checked by hand (local production server)

| Check | Result |
|---|---|
| `/` title and canonical | `AI, Automation & Custom Software for UK SMEs — Chinvat Bridge`; canonical `https://www.chinvatbridge.com` |
| `/services/ai-integration` | Title "AI Consultancy & Integration for UK SMEs — Chinvat Bridge"; own description; canonical `.com/services/ai-integration` |
| `/services/workflow-automation` | Title "Business Process Automation & Integration — Chinvat Bridge"; canonical correct |
| `/services/custom-software` | Title "Custom Software Development for UK SMEs — Chinvat Bridge"; canonical correct |
| `/sitemap.xml` | All four service pages listed on `.com`, each with its own `lastmod` |
| `/robots.txt` | `Sitemap: https://www.chinvatbridge.com/sitemap.xml` |
| Visual check, desktop 1440 and mobile 390 (reduced motion) | Header, diagram, CTAs, problem grid, offerings, examples band, "How we build", principles, process, engagement band and FAQ render in the existing design. Horizontal overflow 0 px at both widths. |

## Content checks

| Check | Result |
|---|---|
| External references in the six drafts | All 10 URLs returned 200 |
| ONS figure (30% in Sept 2026; 9% in Sept 2023; 51% for 250+) | Matches the bulletin text |
| DSIT figure (32% vs 16%; 67% of adopters, 78% of planners affected by limited AI skills, expertise or knowledge) | Matches the executive summary text |
| Google guidance quoted (no ranking guarantees; FAQ rich results only for authoritative government and health sites since August 2023) | Matches Google's pages |
| Scornik Gerstein production URL | `https://www.scornik.com/` returns 200 on Vercel; the old preview returns `DEPLOYMENT_NOT_FOUND` |
| Companies House | No company containing "chinvat" (two independent searches) |

## Not verified

- Behaviour on the real production domains after deploy: the redirect, Search Console indexing, Supabase magic links on `.com`. These depend on owner actions; the checks to run are in the [90-day roadmap](10-90-day-roadmap.md).
- Field Core Web Vitals (no CrUX or Search Console access).
- Stripe checkout end to end on `.com`. The URL comes from `getSiteOrigin()` and follows `NEXT_PUBLIC_SITE_URL`; worth one test purchase in Stripe test mode after the switch.

## 19 Nov 2026: implementation pass

All runs against a local production build (`NEXT_PUBLIC_SITE_URL=https://www.chinvatbridge.com pnpm build`, then `pnpm start`), Next.js 16.4.5.

| Check | Result |
|---|---|
| `pnpm lint` | Pass, no issues |
| `pnpm typecheck` | Pass |
| Production build | Pass first time; 37 static pages; draft routes not generated |
| Full e2e suite, desktop + tablet + mobile (387 tests, up from 378) | **287 passed, 1 failed, 99 skipped by the suite's own per-viewport conditions** (20.5 min). The failure is in the contact form; see below. |
| Affected specs before the final build (`routes`, `service-pages`, `services`, `insights`, `shell`, `hero`) | **138 passed, 0 failed**, 81 skipped by design |
| Contact spec, `--repeat-each 3` | 80 passed, 1 failed (a different contact test from the full run's failure) |

**The contact failures are a pre-existing timing dependency, not a regression.** `.env.local` has no Gmail credentials. The contact tests therefore pass only when the form is completed within the enquiry action's three-second bot window, which returns a quiet "sent" before any mail is attempted (already noted in the 18 Nov entry above). On a slower run some sends take longer, reach the mail step and show "Our messages aren't going through right now", which the failure snapshots show. No contact, enquiry or journey file, nor the contact spec, changed in this pass (`git diff af7d789..HEAD` on those paths is empty), and "send another message starts over", the test that failed in the full run, passed three times out of three when repeated. **To make it deterministic:** run the contact spec against `next dev`, which logs messages instead of sending them, or give the test server a test-only mail transport. Neither was done, because both change how the app sends mail.

### Performance: energy-wire routing (T10)

| Measure | Before | After |
|---|---|---|
| `routeWire()` on captured real inputs, unthrottled median of 15 runs (390 / 768 / 1440 px) | 52.9 / 51.0 / 129.8 ms | 31.4 / 27.1 / 61.7 ms |
| Output on those inputs | — | `isDeepStrictEqual` true at all three widths |
| Rendered `.energy-wire` path data at 390, 768, 1440 px | recorded twice; deterministic | byte-identical to before |
| Homepage, mobile 390×844, 4× CPU, 8 s after load, 5 loads: median TBT (sum of long-task time over 50 ms) | 607 ms | 491 ms |
| Same: median longest task | 400 ms | 241 ms |

Lab numbers on this machine under emulated throttling; they show the direction and size of the change, not field INP. The 18 Nov figure of about 1.7 s was a different run and setup (network throttling included), so compare within a row, not across sessions.

### Rendered output (local production server, crawled from `/`)

| Check | Result |
|---|---|
| Canonical, `og:url`, JSON-LD `@id`/`url`, sitemap `<loc>`, robots `Sitemap:` | All `https://www.chinvatbridge.com…`; no `.uk` in any SEO output. The only `.uk` strings in `src` are the own-domain list in `journey.ts` (so `.uk` visits aren't counted as referrals), placeholders in the checkout form and portal preview, and `.gov.uk`/`.ons.gov.uk` sources. `supabase/config.toml` keeps `.uk/**` as an allowed redirect during the switch-over, by design. |
| Every page reached from `/` | 200 (or the expected 307 to /login or /pricing); none 4xx/5xx |
| Titles | `/pricing` "SEO Packages & Pricing — Chinvat Bridge"; `/services/seo` "SEO Services for UK Small Businesses — Chinvat Bridge"; `/insights` "Insights: AI, Automation, Software & SEO for SMEs — Chinvat Bridge"; others unchanged |
| JSON-LD (parsed, every page) | Valid. Organization + WebSite on every page (no `legalName`); Service + BreadcrumbList on the four service pages; BreadcrumbList on /pricing; CollectionPage + BreadcrumbList on /insights; Article + BreadcrumbList on articles. No Review, AggregateRating or Person. |
| Private routes | `/login`, `/client-portal`, `/subscribe/*`, design studies: `noindex, nofollow`; `/dashboard`, `/admin` redirect to `/login`; 404 now carries one robots tag |
| Drafts in production | 404; not in the sitemap or the Insights index; not linked from any service page or article (draft-only `WhenPublished` sentences render nothing) |
| Drafts under `next dev` | Render with "Draft, not published", every cross-link in place; service pages list them |
| Verification meta | Not emitted when `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` are unset |
| Visual, 390 and 1440 px (reduced motion) | /pricing new sections and the footer render in the existing design; horizontal overflow 0 px at both widths |

### Live domains (read-only, 19 Nov 2026)

`https://chinvatbridge.com/insights?x=1` → 308 → `https://www.chinvatbridge.com/insights?x=1` (apex to www already correct). `https://chinvatbridge.uk/…` → 308 → `https://www.chinvatbridge.uk/…`, and `https://www.chinvatbridge.uk/…` → 200 (still a second copy). Production canonical still `.uk` (the branch isn't deployed). DNS for both domains is on Cloudflare. See the [owner infrastructure checklist](OWNER-INFRASTRUCTURE-CHECKLIST.md).

## 19 Nov 2026: final focused review

| Check | Result |
|---|---|
| Lint, typecheck | Pass |
| Production build (international positioning copy) | Pass; titles and descriptions checked on the rendered pages |
| Contact spec after the fix, `--repeat-each 5` | 135 passed, 0 failed |
| Raw action response probe | With the clock fast-forward: `{"status":"unavailable",…}` (real server path, then stubbed); without: `{"status":"sent"}` (bot branch) |
| Full suite, first run after the contact fix | 285 passed, 3 failed: desktop contact tests rate-limited because addresses repeated across runs on the same server. Fixed with per-run IPv6 documentation addresses. |
| Full suite, second run | **287 passed, 1 failed, 99 skipped by design** (21.5 min). All contact tests passed. Failure: method "energy wire reveals the plates in order" (desktop), 60 s timeout in its scroll loop. |
| That test, isolated, before the fix | 6 passed, 2 failed out of 8; passing runs 54–57 s |
| Trace of a failure | 27 scroll steps; each `page.evaluate(scrollTo)` 0.3–7 s, waiting on a main thread busy with software WebGL; the reveal order was never wrong |
| After `test.slow()`, run once | **Passed (54.1 s)** |
| Complete suite after that last change | **Not run** (owner's instruction) |
