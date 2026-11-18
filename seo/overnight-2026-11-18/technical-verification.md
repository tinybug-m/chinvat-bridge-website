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
