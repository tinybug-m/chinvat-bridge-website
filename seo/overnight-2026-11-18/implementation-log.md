# Implementation log

All work is on the local branch **`seo/overnight-2026-11-18`**, created from `main` at `64a4fc0` (clean working tree at the start). Nothing was pushed, deployed or published. `.env.local` was not modified.

## Commit `445b617` — fix(seo): .com as the canonical origin, offer-led home title, linked article schema, live client link

| File | Change | Justification |
|---|---|---|
| `src/lib/constants.ts` | `SITE_URL` fallback `.uk` → `https://www.chinvatbridge.com` | [T1](03-technical-seo-audit.md#t1-two-live-domains-canonicals-on-the-wrong-one--critical): canonicals, sitemap and robots all pointed at `.uk`. Production still reads `NEXT_PUBLIC_SITE_URL`, which the owner must change. |
| `src/lib/constants.ts` | `SITE_TITLE` → "AI, Automation & Custom Software for UK SMEs — Chinvat Bridge"; `SITE_DESCRIPTION` rewritten (154 chars) | [T6](03-technical-seo-audit.md#t6-homepage-title--medium): brand SERP is mythology; title now leads with the offer |
| `supabase/config.toml` | Auth `site_url` → `.com`; `.com/**` added to redirect URLs, `.uk/**` kept for the switch-over | Magic links and OAuth must follow the canonical origin. Takes effect only on `supabase config push` or a dashboard change. |
| `src/actions/enquiry.ts` | Email footer names `chinvatbridge.com` | Consistency with the primary domain |
| `src/app/(pages)/insights/[slug]/page.tsx` | Article JSON-LD: `@id`, `url`, `inLanguage`, `image`; author and publisher reference the site's Organization `@id`; breadcrumbs Home › Insights › Article | [T8](03-technical-seo-audit.md#t8-article-structured-data--medium), [T9](03-technical-seo-audit.md#t9-article-breadcrumbs-skip-home--low) |
| `src/components/home/work/projects.ts` | Scornik Gerstein href → `https://www.scornik.com/` | [T3](03-technical-seo-audit.md#t3-dead-link-on-the-only-real-client-project--high): the preview returned `DEPLOYMENT_NOT_FOUND` |
| `tests/e2e/work.spec.ts` | Expected href updated | Follows the data |

## Commit `9e94f37` — feat(services): pages for AI integration, workflow automation and custom software

| File | Change | Justification |
|---|---|---|
| `src/data/service-pages.ts` (new) | Typed content for three service pages; header comment lists the source of every claim | [T2](03-technical-seo-audit.md#t2-three-services-have-no-url-of-their-own--high); [service-page strategy](11-service-page-strategy.md) |
| `src/components/services/ServicePage.tsx` (new) | Template reusing `ServiceBlocks`, `PageHeader`, `PlateDiagram` and the homepage diagrams; `Service` + `BreadcrumbList` JSON-LD; `serviceMetadata()` via the existing `pageMetadata()` | Follows the `/services/seo` pattern; no new dependencies |
| `src/app/(pages)/services/{ai-integration,workflow-automation,custom-software}/page.tsx` (new) | Static routes | Indexable URLs |
| `src/app/sitemap.ts` | Service pages listed from `SERVICE_PAGES` + `SEO_SERVICE`, `lastmod` from each page's `updated` | Keeps the "real dates only" rule |
| `src/components/site/nav.ts` | `DISCIPLINE_LINKS` → service pages (footer, every page) | [internal linking plan](12-internal-linking-plan.md) |
| `src/components/home/hero/content.ts` | Hero discipline links → service pages | Same |
| `src/data/services.ts` | Homepage plates' `href` → service pages (label becomes "Explore the service" automatically) | Same |
| `src/data/seo-service.ts` | Related services: software → its page; automation page added | Same |
| `src/content/blog/posts/*.tsx` (three files) | `/#services` anchors → matching service pages | [T12](03-technical-seo-audit.md#t12-generic-internal-anchors--medium) |
| `tests/e2e/service-pages.spec.ts` (new) | H1, CTA target, Service/Breadcrumb JSON-LD, related links resolve, footer links, article schema | Covers the new behaviour |
| `tests/e2e/{hero,routes,services}.spec.ts` | Expected hrefs, new routes, metadata and sitemap dates | Follows the data |
| `docs/redesign/COPY_CHANGES.md` | New section listing every wording change | The project's convention for owner review |

## Commit `04af081` — docs(seo): research, strategy, editorial drafts and handoff

Everything under `seo/overnight-2026-11-18/`. See the [handoff](HANDOFF.md#files-created) for the list.

## Commit `21afd32` — feat(contact): each enquiry says which page prompted it

| File | Change | Justification |
|---|---|---|
| `src/components/site/journey.ts` (new) | In-memory record of the visit's first page (with any `utm_` parameters), referring host and the page before the current one. No cookies or storage. | [T4](03-technical-seo-audit.md#t4-no-measurement--high), [conversion leak](14-conversion-optimisation.md#current-journey): enquiries could not be traced to pages |
| `src/components/site/JourneyRecorder.tsx` (new), `src/components/site/SiteShell.tsx` | Records each route change; mounted once in the site shell (every page) | Same |
| `src/components/home/contact/ContactChat.tsx` | Sends `journey` with the enquiry | Same |
| `src/lib/enquiry-journey.ts` (new), `src/actions/enquiry.ts` | Server keeps only plain paths and bare host names; adds "First page: … (from host)" and "Page before contact: …" to the email | Untrusted input; checked against hostile values (script URLs, header-injection attempts, non-strings), which are dropped |
| `src/app/(pages)/privacy/page.tsx`, `src/lib/legal.ts` | Privacy policy lists this information; "Last updated" 18 Nov 2026 | The policy must describe what an enquiry includes. **Owner to approve the wording.** |
| `tests/e2e/contact.spec.ts`, `tests/e2e/routes.spec.ts` | New test: an enquiry sent after a service page carries that page; privacy `lastmod` expectation | Covers the behaviour |

## Deliberately not changed

| Item | Why |
|---|---|
| `NEXT_PUBLIC_SITE_URL` in Vercel and `.env.local` | Production configuration and the owner's credentials file |
| Homepage H1 | Design-critical; options in the [on-page audit](04-on-page-audit.md#h1-options-for-the-owner) |
| Pricing plan copy | Lives in the production database; pricing changes need approval |
| Analytics | Vendor and privacy-policy choice for the owner |
| Homepage performance work | No field evidence of harm; design-critical code (T10) |
| robots.txt AI-crawler rules | Policy choice (T11) |
| Next.js upgrade | The build prints a security advisory for 16.4.3. A framework upgrade is outside this SEO change and should be its own reviewed change. |
| New articles in `src/content/blog/posts/` | Adding them would publish them on the next deploy |

## Commit `6a5e7e3` — fix: review findings on the service pages and enquiry attribution

Two independent reviews ran at the end of the session: a code review of the branch diff, and an adversarial content review of every document, draft and page. The code findings fixed here:

| File | Change | Finding |
|---|---|---|
| `src/components/services/structured-data.tsx` (new), `src/app/(pages)/services/seo/page.tsx`, `src/components/services/ServicePage.tsx` | Service/Breadcrumb JSON-LD, related-insight links and script rendering shared by all four service pages | The SEO page and the template duplicated them |
| `src/components/home/services/crops.ts` (new), `Services.tsx`, `ServicePage.tsx` | One `PLATE_VIEWBOX` map | Crops were copied by hand |
| `ServicePage.tsx` | "See custom packages" → /pricing removed | /pricing sells SEO plans; contradicted the pages' own intent |
| `src/app/layout.tsx`, `src/components/site/SiteShell.tsx` | `JourneyRecorder` moved to the root layout | Pages outside the site shell (login, checkout) weren't recorded |
| `src/components/site/journey.ts` | Own domains (with or without `www`, `.com` or `.uk`) are not referrers | Internal traffic could be reported as a referral |
| `src/lib/enquiry-journey.ts` | A valid "page before contact" survives an invalid entry; `% ~ @` allowed in paths | Attribution was lost entirely on unusual entry paths |
| `src/actions/enquiry.ts` | Email footer domain from `SITE_URL` | Hard-coded domain could disagree with the canonical |
| `src/app/(pages)/privacy/page.tsx` | Mentions campaign tags; "name of the website" | Disclosure didn't match what is collected |
| `src/data/service-pages.ts` | "You may well have tried an AI tool already…"; "Out of the box…"; "many small businesses" | Unsupported "most businesses" claims that contradicted the cited ONS and DSIT figures |
| `src/data/seo-service.ts`, `tests/e2e/routes.spec.ts` | `/services/seo` updated 2026-11-18 | Its related services changed on this branch |

## Commit (documents) — docs(seo): content-review corrections

Corrections from the content review, across the documents and drafts:

- **T5:** citation corrected to the Company, LLP and Business (Names and Trading Disclosures) Regulations 2015 (SI 2015/17); the legal-entity question is now a blocker for listings and outreach.
- **ONS 38%:** the bulletin has two different 38% figures (adoption among firms with 10+ staff; and the share of AI users naming admin roles as most affected). The pitch and data-explainer idea now say so precisely.
- **Google Business Profile:** recommended only if the business meets clients in person; Google excludes online-only businesses.
- **SERP claims:** "no UK-specific result" → "few UK SME-focused answers"; "ranks" → "appears in results".
- **International clients:** "the site says it works globally", not "serves international clients".
- **Keyword collisions:** each overlapping term now belongs to one URL (drafts' secondaries trimmed; map, research CSV and cannibalisation table updated).
- **Drafts:** shorter SEO titles (about 60 characters with the brand); an up-link to the service page in each draft's first third; Starter and Growth inclusions and VAT corrected in the SEO cost guide; AI-subscriptions claims framed as defaults; the case study says "the stack we propose for clients"; the connect-systems example stores the CRM ID; HowTo retirement dated September 2023; 75th percentile cited to web.dev.
- **Handoff:** every service-page commitment the owner must confirm is now listed.

## Commit `08b0c9a` — fix(security): Next.js and eslint-config-next 16.4.3 → 16.4.5

Two moderate advisories (GHSA-mfr8-8qww-v76h, GHSA-vc7v-qv4w-wrv8) affect 16.2.0–16.4.4 and are patched in 16.4.5. The app uses neither `use cache` nor `unstable_cache`, so it was not exposed. But the build stopped on the advisory every time, and a flagged version shouldn't stay in production. 16.4.5 was chosen over 16.4.6 because it carries the fix and had been released for 15 days. `package.json` and `pnpm-lock.yaml` only, so it can be cherry-picked onto `main` on its own.

## Commit `58921dd` — feat(insights): nine unpublished drafts in the post registry

| File | Change |
|---|---|
| `src/content/blog/posts/*.tsx` (nine new), `index.ts` | The editorial drafts as post modules with `draft: true`, converted from the Markdown by script |
| `src/lib/blog.ts` | Drafts included only when `NODE_ENV === "development"`; `PostMeta.seoTitle` added |
| `src/app/(pages)/insights/[slug]/page.tsx` | `<title>`/social title from `seoTitle` when set; drafts get `noindex` and a "Draft, not published" kicker (they only render under `next dev`) |
| `tests/e2e/routes.spec.ts` | Draft URLs 404, and stay out of the sitemap and the Insights index, in production |

## Documents (this round)

- T10 now records a CPU profile of the homepage, with the energy wire's relayout identified as the longest task and a specific fix to apply when field data justifies it.
- Enquiry and monthly tracker templates (`measurement-tracker-*.csv`).
- The editorial README describes the draft-in-code workflow.

## 19 Nov 2026: "Ltd" removed

The owner confirmed the business is not a limited company. "Ltd" was removed from `SiteFooter.tsx`, `CheckoutShell.tsx` and the terms page; `legalName` was dropped from the Organization JSON-LD in `src/app/layout.tsx`; `TERMS_UPDATED` moved to 2026-11-19. This closes the T5 blocker.

## 19 Nov 2026: implementation pass

Commits `5bd0645`, `1e8c8b4`, `dfe485a` and `20d596c`. Main untouched; nothing pushed or deployed.

### `1e8c8b4`: perf(home): energy-wire routing about twice as fast, identical output

| File | Change | Justification |
|---|---|---|
| `src/components/home/services/energy/route.ts` | `collisions()` tests only boxes overlapping the samples' bounding box; each lane's curves into it (per out port) and out of it (per in port) are cached across port pairings | [T10](03-technical-seo-audit.md#t10-homepage-main-thread-cost-on-mobile--medium). A CPU profile showed the homepage's longest task was `routeWire()`'s pure geometry, not the DOM reads, so the audit's "split reads from routing" would have left a ~350 ms task in place. Both cuts are exact: on captured real inputs the output is deep-equal, and the rendered wire paths are byte-identical at 390, 768 and 1440 px. Figures in [technical verification](technical-verification.md#19-nov-2026-implementation-pass). |

### `dfe485a`: feat(insights): drafts can link to each other in any order

| File | Change | Justification |
|---|---|---|
| `src/components/insights/WhenPublished.tsx` (new) | Renders its children only while the target article is published (drafts count as published under `next dev`) | Seven draft-to-draft links would have 404'd if the drafts were published out of the planned order |
| Six drafts | Each cross-reference sentence wrapped; the sentence reads without it | Same |
| `how-much-does-seo-cost-uk.tsx` (draft) | "plus VAT where applicable" → the terms' own words (exclusive of any applicable tax, added at checkout where relevant), linked to /terms | No VAT position is confirmed beyond the terms |
| `why-your-website-isnt-bringing-you-customers.tsx` | "a full technical audit on every tier" → "every one of our SEO plans starts with a technical audit"; now links `/services/seo`; `updated: 2026-11-19` | Contradicted Starter's "Basic" audit; the article never linked its service page |
| `what-should-you-automate-first.tsx`, `where-ai-can-save-your-business-time.tsx` | One sibling link each to a published article, plus a `WhenPublished` link to their cluster's draft | [Linking plan](12-internal-linking-plan.md) rule 2; neither had a sibling link |
| `when-should-a-business-build-custom-software.tsx` | `WhenPublished` link to the spreadsheet flagship | The flagship should receive a link from its closest article the day it goes live |

### `20d596c`: feat(seo): distinct service names, pricing terms summary, breadcrumbs

| File | Change | Justification |
|---|---|---|
| `src/data/service-pages.ts` | `name` (kicker, breadcrumb, Service name): AI Integration, Workflow Automation, Custom Software. `updated` 2026-11-19 | "AI & Automation Integration" on the AI page overlapped the automation page (a cannibalisation the content review flagged); the names match the owner's brief |
| `src/data/service-pages.ts` | Softened: source citations ("can point to"), measuring after launch ("so the result can be checked"), data-handling FAQ (questions to settle), support ("should be settled"), "never" → "doesn't" | Commitments not confirmed by the owner, softened without changing the offer |
| `src/data/service-pages.ts`, `src/data/seo-service.ts` | `relatedInsights` lists each cluster's drafts | `relatedInsightLinks()` skips unpublished slugs, so they appear on publication; publishing no longer needs an edit here |
| `src/data/seo-service.ts` | Title "SEO Services for UK Small Businesses"; description names the buyer and the published prices | [Keyword map](06-keyword-to-url-map.csv) recommendation |
| `src/components/site/nav.ts` | Footer discipline labels: AI Integration, Workflow Automation, Custom Software, SEO & Growth | Same overlap, on every page |
| `src/components/organisms/sections/Pricing.tsx` | "Billing and terms" (billing, tax, cancellation, no guarantees: each the terms' own position) and "Other services" (the three quoted service pages) | [On-page audit](04-on-page-audit.md#pricing): VAT/tax unstated on the page, no links to the other services. Plan wording stays in the database (owner). |
| `src/app/(pages)/pricing/page.tsx` | Title "SEO Packages & Pricing", new description, BreadcrumbList | Keyword map |
| `src/app/(pages)/insights/page.tsx` | Title "Insights: AI, Automation, Software & SEO for SMEs"; CollectionPage `@id`, `isPartOf`, `publisher`, `inLanguage`; BreadcrumbList | Keyword map; schema consistency |
| `src/app/(pages)/insights/[slug]/page.tsx` | Article `isPartOf` the WebSite | Schema consistency |
| `src/components/services/structured-data.tsx` | Shared `breadcrumbJsonLd()`; `JsonLdScripts` accepts any block | One breadcrumb builder for every page type |
| `src/app/layout.tsx`, `.env.example` | Optional `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` meta tags, only when set | Search Console and Bing can be verified by meta tag without code changes; DNS needs neither |
| `src/app/not-found.tsx` | Own robots meta removed | [T15](03-technical-seo-audit.md#t15-duplicate-robots-meta-on-404--low): Next already marks 404s noindex |
| `tests/e2e/routes.spec.ts`, `tests/e2e/service-pages.spec.ts` | Names, titles, dates; all ten drafts guarded; new test that no sitemap page links to a missing internal page; /pricing billing summary, service links and breadcrumbs | Covers the changes |

### Reviewed and deliberately left

| Item | Why |
|---|---|
| Homepage H1, hero lede, section headings | Option A was kept in the last review; the lede is held to three lines so the H1 stays the LCP element; the title, description, descriptive hero links and screen-reader plate anchors already carry relevance |
| Plan wording on /pricing (Starter "Basic" vs "Full", "assets", jargon labels) | Lives in the production `plans` table; changing it needs the owner. Ready SQL in the [pricing proposal](pricing-copy-proposal.md). A migration was not added, because a migration could apply it without review. |
| Enquiry attribution | Reviewed: in memory only, `utm_source/medium/campaign` only, referrer as bare host, server-side sanitiser drops anything else; the privacy line describes it accurately. No change. |
| Footer column H2s | Headings label the footer's navigation for screen-reader users; SEO effect negligible |
| Design-study routes (R19) | `noindex`, unlinked and not in the sitemap; may be the owner's review tool on production |
| Article `seoTitle` for "Why your website…" (69 chars with suffix) | A live page; shortening its title for a cosmetic truncation isn't worth a ranking change |
| Analytics vendor | Owner choice; nothing installed |
