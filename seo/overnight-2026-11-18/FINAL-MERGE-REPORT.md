# Final merge report

**Date:** 19 November 2026.
**What happened:** `seo/overnight-2026-11-18` was merged into `main` **locally**, as a fast-forward: `64a4fc0` → `39579ab`, 22 commits. No merge commit was created, no history was rewritten, and nothing was squashed, reset or forced.
**What did not happen:** nothing was pushed to GitHub, deployed to Vercel or published, and no external service was changed. `main` is now 22 commits ahead of `origin/main`.

**Deployment readiness: not ready.** The merged code is complete, and verified locally: lint, typecheck, build and the focused tests pass. Production deployment should wait for the blocking items in [section G](#g-deployment-readiness): two copy approvals, the Stripe webhook check and the Cloudflare query string.

Per the [owner checklist](OWNER-INFRASTRUCTURE-CHECKLIST.md#3-deploy-the-branch), Vercel deploys production from `main`. **Pushing `main` to GitHub is therefore the deployment step**, and it should wait for those items.

## Merge record

### Checks before the merge

| Check | Result |
|---|---|
| Branch and HEAD | `seo/overnight-2026-11-18` at `39579ab` |
| Working tree | Clean, no untracked files, no stash |
| 404 robots fix | Committed in `39579ab` (`robots: { index: false, follow: false }` in `src/app/not-found.tsx`) |
| `main` | At `64a4fc0`, the expected base, and equal to the local `origin/main`. GitHub's `main` was read as `64a4fc0` earlier on 19 Nov; it was not fetched again, so as to make no external call |
| Fast-forward possible | Yes: `main` is an ancestor of the branch, and has no commits of its own since the base |
| Diff review (`main...branch`) | 104 files. No secret-shaped strings (API keys, tokens, private keys, service-role or mail passwords, Supabase project hosts). The only env file is `.env.example`, with blank values. No deletions, renames or mode changes. The lockfile moves only the Next.js family, 16.4.3 → 16.4.5. Email addresses: only the public contact address, an `example.com` test address and a DMARC vendor address. Every touched area belongs to the SEO programme |
| Changes since the independent audit of `0b4dd43` | Only `39579ab`: the 404 fix and the two documentation updates |

### Merge

`git switch main && git merge --ff-only seo/overnight-2026-11-18`: "Fast-forward", `64a4fc0..39579ab`. Afterwards `main` and the branch tip are the same commit, and `git log --merges 64a4fc0..HEAD` is empty.

### Verification after the merge (on `main` at `39579ab`)

| Check | Result |
|---|---|
| `git status` | Clean; `## main...origin/main [ahead 22]` |
| Branch and HEAD | `main`, `39579ab08cd8ae55b48b05e9ecec97687cad42fe` |
| `pnpm lint` | Pass |
| `pnpm typecheck` | Pass |
| Production build (`NEXT_PUBLIC_SITE_URL=https://www.chinvatbridge.com pnpm build`) | Pass, Next.js 16.4.5; 37 static pages; only the five published articles generated |
| Drafts unpublished | All ten carry `draft: true`. None has a built page, an entry in the 14-URL sitemap, or a link on `/insights` or the homepage. Served by `next start`, each returns **404**; a published article returns 200 as a control |
| End-to-end tests | Not re-run after the merge: the merged tree is the commit already tested. On `0b4dd43`, the focused specs (`routes`, `service-pages`, `services`, `insights`, `hero`, `work`, `contact`) gave 159 passed, 0 failed, 75 skipped by design, and the energy-wire test passed on all three viewports. After the 404 fix, `routes` gave 33 passed, 0 failed, 66 skipped by design. Details in [technical verification](technical-verification.md#19-nov-2026-pre-deployment-audit) |

The build was run with the `.com` value given explicitly, because the local `.env.local` still sets `NEXT_PUBLIC_SITE_URL=https://www.chinvatbridge.uk`.

## A. SEO changes

### Homepage

| Element | Before (`main` at `64a4fc0`) | After |
|---|---|---|
| `<title>` | Chinvat Bridge — AI, Automation, Software & SEO | **AI, Automation & Custom Software for SMEs — Chinvat Bridge** |
| Meta description | UK-based technology consultancy helping businesses solve practical operational and digital problems using AI, automation, custom software, and technical SEO. | UK-based technology consultancy for small businesses worldwide: AI integration, workflow automation, custom software and technical SEO, built around your work. |
| H1 | The brand line | Unchanged, by recommendation (option A). Option B screenshots are in `assets/` |
| Hero discipline links | AI, automation and software went to anchors on the homepage | Each goes to its service page |
| Service plates | "Read the article" → an Insights article | "Explore the service" → the service page |
| Recent work, Scornik Gerstein LLP | `https://scornik.vercel.app/` (returned `DEPLOYMENT_NOT_FOUND`) | `https://www.scornik.com/` |

The title leads with the offer because a search for "Chinvat Bridge" alone returns the Zoroastrian bridge. Titles name the buyer (SMEs), not a country; "UK-based" stays in the descriptions as a fact.

### Technical SEO corrections

- **Canonical origin:** the fallback in `src/lib/constants.ts` changed from `.uk` to `https://www.chinvatbridge.com`. Production sets the same value through `NEXT_PUBLIC_SITE_URL`.
- **Supabase config file** (`supabase/config.toml`): `site_url` is `.com`. `https://www.chinvatbridge.com/**` is added to the allowed redirects, and `.uk/**` is kept during the switch-over. The file applies only through `supabase config push`; production uses the dashboard.
- **Enquiry email footer:** names the domain from `SITE_URL` instead of the hard-coded `chinvatbridge.uk`.
- **Drafts:** a `noindex, nofollow` robots tag even in the one place they render (`next dev`); 404 in production.
- **404 page:** robots unchanged from `main` (`noindex` + `noindex, nofollow`). It was removed in `20d596c`, which made 404s inherit `index, follow`, and restored in `39579ab`. The net change is a two-line comment explaining why the tag stays.
- **Ownership verification meta tags:** optional, emitted only when `GOOGLE_SITE_VERIFICATION` or `BING_SITE_VERIFICATION` is set; both are documented in `.env.example`. DNS verification needs neither.
- **"Ltd" removed** from the Organization schema, footer, checkout footer and terms. The business is not a limited company.

### Canonical and domain changes

- Every canonical, `og:url`, structured-data `@id` and `url`, sitemap `<loc>` and the robots `Sitemap:` line comes from `SITE_URL`. The production build contains **no `.uk` string**.
- Magic-link, Google sign-in and Stripe success/cancel URLs come from `getSiteOrigin()`, which returns `SITE_URL` in production. This code is unchanged; it follows the variable.
- The live site (still the old `main`) was redeployed by the owner with the `.com` variable. At 18:06 UTC on 19 Nov its canonical, `og:url`, robots and sitemap were all `.com`.
- The enquiry-attribution code treats both `chinvatbridge.com` and `chinvatbridge.uk` as the site's own, so a visit through the `.uk` redirect is not counted as a referral.

### Sitemap and robots

- **Sitemap:** 14 URLs, up from 11. Each of the three new service pages has its own `lastmod`, taken from the page's content date, and `/services/seo` takes its date the same way. Drafts are excluded until published; each publication adds one URL.
- **Changed `lastmod` dates** follow real content changes: privacy policy 18 Nov, terms 19 Nov, "Why your website isn't bringing you customers" 19 Nov, service pages 19 Nov.
- **Robots:** `src/app/robots.ts` is unchanged (allow all). Its `Sitemap:` line follows `SITE_URL`, so it is `.com` in the build. The AI-crawler policy is an open owner decision (section F).
- A new test checks that no page in the sitemap links to a missing page on the site.

### Structured data

| Where | Change |
|---|---|
| Every page (root layout) | Organization (no `legalName`) and WebSite, as before |
| Four service pages | `Service` (provider: the site's Organization; `areaServed: Worldwide`; no offers, since nothing on these pages is priced) and `BreadcrumbList` (Home › Service), from one shared builder |
| `/pricing` | `BreadcrumbList` (new) |
| `/insights` | `CollectionPage` now has `@id`, `inLanguage: en-GB`, `isPartOf` the WebSite and `publisher` the Organization; plus a `BreadcrumbList` |
| Articles | `Article` gains `@id`, `url`, `inLanguage`, `image` and `isPartOf` the WebSite. Author and publisher are the site's Organization node, not a loose name. Breadcrumbs are now Home › Insights › Article |

There are no Review, AggregateRating or Person entries, and no invented credentials. Every page's JSON-LD parses.

### Internal linking

- **Footer, on every page:** discipline links renamed and pointed at the service pages: "AI & Automation", "Workflows", "Software & Web" → **AI Integration, Workflow Automation, Custom Software**. "SEO & Growth" is unchanged.
- **Homepage:** hero discipline links and service plates point at the service pages (above).
- **Each service page:** a "Related insights" list and two sibling services. Draft articles in the list appear only from their publication day, with no edit needed.
- **`/services/seo`:** "Custom software development" now links to its page instead of a homepage anchor, and "Workflow automation and integration" is added. Its related insights include the two SEO drafts, shown once published.
- **`/pricing`:** an "Other services" section links the three per-project services; links to the full terms and the client-portal preview.
- **Existing articles:** their `/#services` links now go to the matching service page, and sibling links were added. Links to drafts are wrapped in `WhenPublished`, so they render only once the target is live.

### Search metadata (titles and descriptions)

| Page | Title before | Title after |
|---|---|---|
| `/` | Chinvat Bridge — AI, Automation, Software & SEO | AI, Automation & Custom Software for SMEs — Chinvat Bridge |
| `/services/seo` | SEO Services & Digital Growth | SEO Services for Small Businesses |
| `/pricing` | SEO & Content Pricing | SEO Packages & Pricing |
| `/insights` | Insights | Insights: AI, Automation, Software & SEO for SMEs |
| `/services/ai-integration` | (new) | AI Consultancy & Integration for SMEs |
| `/services/workflow-automation` | (new) | Business Process Automation & Integration |
| `/services/custom-software` | (new) | Custom Software Development for SMEs |

Inner titles get " — Chinvat Bridge" from the layout template.

- **Descriptions:** home, `/services/seo`, `/pricing` (now "published monthly prices in pounds" and "No long-term contract") and `/insights` were rewritten. They name the buyer, and none limits the market to the UK.
- **Articles:** a new optional `seoTitle` gives a shorter `<title>` where the heading is too long for a search result; all ten drafts use it.
- **International positioning:**
  - Data-protection copy says "UK GDPR, or the law that applies where you are".
  - An FAQ answers "Do you work with businesses outside the UK?".
  - `en-GB`, prices in pounds and "UK Based // Working Globally" are kept.
  - The UK-specific articles (SEO cost in the UK, the ONS and DSIT figures) stay UK-specific, because they target real UK searches.

## B. New pages

All three are built from one shared template (`src/components/services/ServicePage.tsx`), with their content in `src/data/service-pages.ts`:

- **Static:** prerendered at build time.
- **Indexable:** `index, follow`, each with its own canonical.
- **Marked up:** Service and BreadcrumbList.
- **In the sitemap.**
- **No prices:** these services are quoted per project, so every call to action opens the homepage conversation. Only SEO has plans on `/pricing`.

| URL | Name (kicker, breadcrumb, schema) | H1 | Purpose: the search intent it answers | Call to action |
|---|---|---|---|---|
| `/services/ai-integration` | AI Integration | AI integration that earns its place in your business | AI consultancy and integration for small businesses: finding work AI can reliably take on, choosing tools, connecting them to existing systems, guardrails and human review | Discuss an AI project |
| `/services/workflow-automation` | Workflow Automation | Workflow automation for the work between your systems | Business process automation and API integration: connecting CRM, accounts, inbox and spreadsheets so information isn't retyped; connector platforms or custom integrations | Describe a process |
| `/services/custom-software` | Custom Software | Custom software built around the way your business works | Custom and bespoke software: internal tools, client portals, dashboards, web applications and websites, with a "How we build" section naming the stack this site runs on | Describe what you need |

Every page has the same blocks: problem, what we do, typical first projects (framed as patterns, not client results), approach, the shared four-step process, how projects start, five FAQs, related insights and services, and a closing call to action.

The existing `/services/seo` page now uses the same structured-data builder and service name ("SEO & Digital Growth"), with the title and links above. The full brief is in [service-page strategy](11-service-page-strategy.md).

`/pricing` also gained two sections:
- **"Billing and terms":** monthly billing through Stripe, prices exclusive of applicable tax, 30 days' notice, no ranking guarantees. Each line restates the terms page.
- **"Other services":** links to the three new pages.

## C. Content

### Ten draft articles (all unpublished)

Each exists twice:
- as a reviewable Markdown file in [`editorial/articles/`](editorial/articles/), with front matter and review notes;
- as a post module in `src/content/blog/posts/` with `draft: true`.

Production never builds or serves them. Under `pnpm dev` each renders in place, marked "Draft, not published" and `noindex`.

| Slug | Title | Primary query | Supports | Before publishing |
|---|---|---|---|---|
| `replace-spreadsheets-with-custom-software` | Outgrown Your Spreadsheets? When to Replace Them with Software | replace spreadsheets with custom software | `/services/custom-software` | Owner review |
| `how-much-does-seo-cost-uk` | How Much Does SEO Cost in the UK? | how much does seo cost uk | `/services/seo`, `/pricing` | The `/pricing` wording fixes (Starter audit wording, "asset", tax) |
| `how-to-connect-business-systems` | How to Connect Business Systems That Don't Talk to Each Other | how to connect business systems | `/services/workflow-automation` | Owner review |
| `how-to-choose-an-ai-consultant` | How to Choose an AI Consultant for a Small Business | how to choose an ai consultant | `/services/ai-integration` | Re-check ONS and DSIT figures on the day. It tells readers to ask any consultant "Can you show me something you've built?", so have one AI build ready to show (its review note) |
| `what-a-technical-seo-audit-should-include` | What a Technical SEO Audit Should Include | what should a technical seo audit include | `/services/seo` | Domain consolidation live (the article mentions it) |
| `ai-subscriptions-vs-ai-integration` | AI Subscriptions or AI Integration? | ai integration vs ai subscriptions | `/services/ai-integration` | Owner review |
| `how-we-built-this-site` | How We Built Our Own Site, Client Portal and Checkout (case study) | next.js supabase stripe build | `/services/custom-software` | None; every fact checked against the repository |
| `does-your-business-need-a-client-portal` | Does Your Business Need a Client Portal? | client portal for small business | `/services/custom-software` | Ideally one portal example |
| `how-to-choose-a-technology-partner` | How to Choose a Technology Partner | how to choose a technology partner | All service pages | Owner decides the ownership and handover answers |
| `uk-small-business-ai-adoption-2026` | What the UK's AI Adoption Figures Actually Say About Small Businesses | uk sme ai adoption statistics | `/services/ai-integration` (link-earning) | Re-check ONS and DSIT figures on the day |

**Publishing one:** read it under `pnpm dev`, delete `draft: true` and set its `date`. The full process is in the [editorial README](editorial/README.md#publishing-an-article-when-approved). The article then appears in the sitemap, on `/insights`, in its service page's related reading, and in every `WhenPublished` sentence that points to it.

### Existing articles modified (all published, all on `main` before)

| Article | Change |
|---|---|
| What Should You Automate First? | The `/#services` link now goes to `/services/workflow-automation`. Adds a link to "When should a business build custom software?", and a `WhenPublished` link to the connecting-systems draft |
| When Should a Business Build Custom Software? | The `/#services` link now goes to `/services/custom-software`. Adds a `WhenPublished` link to the spreadsheets draft |
| Where AI Can Actually Save Your Business Time | Two `/#services` links now go to `/services/workflow-automation` and `/services/ai-integration`. Adds a link to "What should you automate first?", and a `WhenPublished` link to the AI-subscriptions draft |
| Why Your Website Isn't Bringing You Enough Customers | The claim of a "full technical audit on every tier" is corrected to "starts with a technical audit", and a link to the technical SEO service is added. `updated: 2026-11-19` |

**Not changed:** the descriptions of three of these articles still address UK businesses specifically: "small UK businesses", "a UK small business website" and "mid-sized UK businesses". This is the owner's call; see section F.

### Editorial documents and site copy

- **Editorial plan:** [`editorial/README.md`](editorial/README.md) (workflow and publishing steps) and [`editorial/editorial-calendar.csv`](editorial/editorial-calendar.csv). The calendar has 14 rows: the 10 drafts; three pieces not started (the Scornik Gerstein case study; Zapier, Make or custom integration; what custom software costs in the UK); and one refresh of an existing article.
- **Case-study brief:** [`editorial/scornik-gerstein-case-study-brief.md`](editorial/scornik-gerstein-case-study-brief.md), waiting on the client's permission.
- **Source checking:** every figure and external reference in the drafts was checked against its source ([source register](source-register.md)). An adversarial content review's must-fix and should-fix items were all corrected.
- **Legal copy:**
  - Terms: "Chinvat Bridge Ltd" becomes "Chinvat Bridge"; dated 19 Nov.
  - Privacy policy: one new line on enquiry attribution, **awaiting approval**; dated 18 Nov.
- **Copy log:** `docs/redesign/COPY_CHANGES.md` records the copy changes as of 18 Nov. Its homepage title and description rows predate the international positioning pass.

## D. Performance and code

### Homepage performance (`1e8c8b4`)

The homepage's longest main-thread task was the "energy wire" routing between the service plates. The router now runs about twice as fast, with **byte-identical output**: the path data was compared at three widths, and deep equality was confirmed on captured inputs.

| Measure | Before | After |
|---|---|---|
| `routeWire()`, median of 15 runs (390 / 768 / 1440 px) | 52.9 / 51.0 / 129.8 ms | 31.4 / 27.1 / 61.7 ms |
| Homepage, mobile 390×844, 4× CPU: median total blocking time | 607 ms | 491 ms |
| Same: median longest task | 400 ms | 241 ms |

These are lab figures under emulated throttling; field data (Search Console, CrUX) should confirm them.

### Next.js security update (`08b0c9a`)

`next` and `eslint-config-next` were updated from 16.4.3 to **16.4.5**. This clears two moderate advisories, and the build no longer stops on Next.js's security gate. `pnpm audit --prod`: no known vulnerabilities.

### Enquiry attribution (`21afd32`, refined in `6a5e7e3`)

Every enquiry email now says which page prompted it, in two lines:
- "First page: /services/ai-integration (from www.google.com)", including any `utm_source`, `utm_medium` and `utm_campaign` the visit arrived with;
- "Page before contact: …".

**How it works:**
- `JourneyRecorder` in the root layout notes each page in memory (`src/components/site/journey.ts`).
- The contact form sends it with the message.
- `src/lib/enquiry-journey.ts` keeps only plain site paths and bare host names, and drops anything else (`javascript:`, line breaks, odd hosts).

There are no cookies and no storage, and nothing leaves the browser unless a message is sent. The privacy-policy line disclosing this awaits approval. The campaign tags depend on the Cloudflare redirect keeping the query string (section F).

### Other technical improvements

- **Shared building blocks:**
  - `ServicePage.tsx`: the service-page template.
  - `structured-data.tsx`: `serviceJsonLd`, `breadcrumbJsonLd`, `relatedInsightLinks` and `JsonLdScripts`.
  - `crops.ts`: one set of diagram crops, shared by the homepage plates and the service pages.
- **Draft workflow** (`58921dd`, `dfe485a`): a `draft` flag in the post registry, hidden in production and shown under `next dev`. `WhenPublished` lets drafts link to each other in any publishing order without ever producing a 404.
- **Tests:**
  - New `service-pages.spec.ts`.
  - In `routes.spec.ts`: metadata checks for the new pages, a guard that drafts are never served, listed or in the sitemap, and the missing-internal-link check.
  - A contact test for attribution.
  - The contact tests no longer pass by accident inside the bot window. They use Playwright's clock, stub only the "no mail transport" outcome, and use per-run IPv6 documentation addresses for the rate limiter.
  - `test.slow()` for the energy-wire test, which runs near the 60 s default on software WebGL.
- **Configuration:** `.env.example` documents the canonical URL's role and the two optional verification variables.

## E. Files and commits

### All 22 commits merged (oldest first)

| Commit | Date | Subject |
|---|---|---|
| `445b617` | 18 Nov | fix(seo): .com as the canonical origin, offer-led home title, linked article schema, live client link |
| `9e94f37` | 18 Nov | feat(services): pages for AI integration, workflow automation and custom software |
| `04af081` | 18 Nov | docs(seo): research, strategy, editorial drafts and handoff for the organic growth programme |
| `21afd32` | 18 Nov | feat(contact): each enquiry says which page prompted it |
| `3900817` | 18 Nov | docs(seo): record enquiry attribution in the plan, log and handoff |
| `a6ed9f3` | 18 Nov | docs(seo): case study draft on how the site was built, Scornik brief, pricing copy proposal |
| `6a5e7e3` | 18 Nov | fix: review findings on the service pages and enquiry attribution |
| `d0c0aa7` | 18 Nov | docs(seo): content-review corrections, client portal draft, final verification record |
| `a7b3230` | 18 Nov | docs(seo): draft 'How to choose a technology partner' |
| `08b0c9a` | 18 Nov | fix(security): Next.js and eslint-config-next 16.4.3 → 16.4.5 |
| `58921dd` | 18 Nov | feat(insights): nine unpublished drafts in the post registry, previewable under next dev |
| `d46d271` | 18 Nov | docs(seo): Next.js upgrade, draft workflow, homepage profile and trackers in the handoff |
| `f052e61` | 18 Nov | docs(seo): data explainer on the official UK AI-adoption figures, as an unpublished draft |
| `f4aafbd` | 18 Nov | docs(seo): fixed-price first-engagement proposal (operations review, technical SEO audit) |
| `af7d789` | 18 Nov | docs(seo): homepage H1 options rendered; recommendation revised to keep the brand line |
| `5bd0645` | 19 Nov | fix(legal): remove 'Ltd' — the business is not a limited company |
| `1e8c8b4` | 19 Nov | perf(home): route the energy wire about twice as fast, with identical output |
| `dfe485a` | 19 Nov | feat(insights): drafts can link to each other in any publishing order |
| `20d596c` | 19 Nov | feat(seo): distinct service names, pricing terms summary, breadcrumbs |
| `912a946` | 19 Nov | docs(seo): owner infrastructure checklist; 19 Nov implementation recorded |
| `0b4dd43` | 19 Nov | fix: international positioning, stable contact and energy-wire tests, live domain status |
| `39579ab` | 19 Nov | fix(seo): 404 pages keep their own noindex; record the pre-deployment audit |

### Size of the change

**104 files changed** (64 created, 40 modified, 0 deleted), +6,751 / −197 lines:
- **Code, tests and configuration:** 61 files, +2,911 / −197.
- **Documentation:** 43 files, +3,840. That is this folder (42 files, including four PNG screenshots) plus `docs/redesign/COPY_CHANGES.md`.

### Important files created

| Area | Files |
|---|---|
| Service pages | `src/app/(pages)/services/{ai-integration,workflow-automation,custom-software}/page.tsx`, `src/data/service-pages.ts`, `src/components/services/ServicePage.tsx`, `src/components/services/structured-data.tsx`, `src/components/home/services/crops.ts` |
| Drafts | Ten post modules in `src/content/blog/posts/`; `src/components/insights/WhenPublished.tsx` |
| Enquiry attribution | `src/components/site/journey.ts`, `src/components/site/JourneyRecorder.tsx`, `src/lib/enquiry-journey.ts` |
| Tests | `tests/e2e/service-pages.spec.ts` |
| Documentation | This folder: research and strategy (`00`–`15`), [handoff](HANDOFF.md), [owner infrastructure checklist](OWNER-INFRASTRUCTURE-CHECKLIST.md), [implementation log](implementation-log.md), [technical verification](technical-verification.md), [pricing copy proposal](pricing-copy-proposal.md), [first-engagement proposal](first-engagement-proposal.md), [source register](source-register.md), measurement trackers, `editorial/`, `assets/` |

### Important files modified

| Area | Files |
|---|---|
| Domain, metadata, indexing | `src/lib/constants.ts`, `src/app/layout.tsx`, `src/app/sitemap.ts`, `src/app/not-found.tsx` (comment only, net), `supabase/config.toml`, `.env.example` |
| Pages | `src/app/(pages)/services/seo/page.tsx`, `pricing/page.tsx`, `insights/page.tsx`, `insights/[slug]/page.tsx`, `privacy/page.tsx`, `terms/page.tsx` |
| Content and data | `src/data/seo-service.ts`, `src/data/services.ts`, `src/lib/blog.ts`, `src/lib/legal.ts`, `src/content/blog/posts/index.ts` and four published articles |
| Components | `src/components/organisms/sections/Pricing.tsx`, `src/components/site/nav.ts`, `src/components/site/SiteFooter.tsx`, `src/components/templates/CheckoutShell.tsx`, `src/components/home/hero/content.ts`, `src/components/home/services/Services.tsx`, `src/components/home/services/energy/route.ts`, `src/components/home/work/projects.ts`, `src/components/home/contact/ContactChat.tsx` |
| Server action | `src/actions/enquiry.ts` |
| Dependencies | `package.json`, `pnpm-lock.yaml` |
| Tests | `tests/e2e/{contact,hero,method,routes,services,work}.spec.ts` |

### Commits worth knowing by hash

| What | Commit |
|---|---|
| Canonical origin, homepage title, article schema | `445b617` |
| Service pages | `9e94f37` |
| Enquiry attribution | `21afd32`, `6a5e7e3` |
| Security update | `08b0c9a` |
| Drafts in the registry | `58921dd`, `dfe485a` |
| "Ltd" removal | `5bd0645` |
| Energy-wire performance | `1e8c8b4` |
| Service names, pricing terms, breadcrumbs | `20d596c` |
| International positioning and test stability | `0b4dd43` |
| 404 robots fix | `39579ab` |

## F. Remaining owner decisions

### Service-page commitments requiring approval

The copy in `src/data/service-pages.ts` would go live on deploy. Unconfirmed promises were softened on 19 Nov; **these remain as written and need confirming as true**:

- **Workflow automation:**
  - "We build in alerts and logs, and write down how each workflow works."
  - Workflows "fail loudly rather than silently: errors raise an alert, failed steps can be retried, and there is a record of what happened."
  - Zapier or Make are used "where they are reliable enough for the job".
- **Custom software:**
  - Software is tested "with them before it replaces anything".
  - It is built "in short cycles, shown to you as it takes shape".
- **AI integration:** the guardrails offering: "review steps, limits on what the system may do on its own, and a record of what it did".

Already backed by the live site, so not listed: scope and cost agreed first; the Scornik Gerstein credit; "based in the UK and work remotely".

### Privacy-policy approval

`src/app/(pages)/privacy/page.tsx` (policy dated 18 Nov 2026) adds, to the information collected:

> With a message you send us, the page you were reading, the first page of your visit (including any campaign tags in the link you followed), and the name of the website that referred you, if any, so we know what prompted it. The page keeps this in memory while you browse; nothing is saved to your device.

The attribution code ships with this merge, so the line should be approved, or edited, before deploying.

### Cloudflare query-string redirect issue

The owner reports turning on "Preserve query string". At 17:54 and 18:06 UTC on 19 Nov it was **not in effect**:
- Both `.uk` hosts, on `http` and `https`, return 301 to the right `.com` path, but without the query string.
- Example: `https://www.chinvatbridge.uk/auth/callback?code=TEST…` → `https://www.chinvatbridge.com/auth/callback`.
- Cloudflare answered directly, with no cache headers.

**Effect:**
- Production now builds sign-in and Stripe return URLs on `.com`, so new sign-ins and checkouts don't pass through the redirect.
- Older `.uk` links lose their parameters, including campaign tags, which enquiry attribution would otherwise record.
- The Search Console Change of Address should wait for this.

**Fix:** in the `chinvatbridge.uk` zone, confirm the rule's "Preserve query string" is saved and deployed, and that no other rule answers first: another redirect rule, a Page Rule or a Bulk Redirect. Then check:

```bash
curl -sI "https://www.chinvatbridge.uk/auth/callback?code=TEST" | grep -i '^location'
# expect: location: https://www.chinvatbridge.com/auth/callback?code=TEST
```

### Stripe webhook endpoint verification

This can't be checked from outside. In the Stripe dashboard, the webhook endpoint must be `https://www.chinvatbridge.com/api/webhooks/stripe`.

If it still names `.uk`:
- every delivery since the `.uk` redirect went live received a 301, which Stripe treats as a failed delivery;
- this webhook is what creates a paying customer's account (`src/app/api/webhooks/stripe/route.ts`).

Fix the URL, then resend any failed events from the dashboard. Also check any return URLs set in the Stripe dashboard itself.

### Pricing wording

The page-level work is merged: the title, the terms summary and the service links. **Still to decide, in the database:**
- the Starter plan's "Basic" vs "Full technical SEO audit" contradiction;
- what an "asset" is;
- the jargon labels ("Core Protocols", "content velocity", "Enterprise-grade");
- whether Scale's "Dedicated senior SEO consultant" is literally true;
- whether the business is VAT-registered (the site says only "applicable tax", as the terms do).

Proposed wording and SQL are in the [pricing copy proposal](pricing-copy-proposal.md). Prices are unchanged.

### Analytics setup

There are no analytics on the site. The recommendation is a cookieless tool (Vercel Web Analytics or Plausible), per the [measurement framework](15-measurement-framework.md#tooling). Enquiry attribution is already built and needs only its privacy line approved. Two trackers are ready to fill in: `measurement-tracker-monthly.csv` and `measurement-tracker-enquiries.csv`.

### Search Console and Bing

After the deploy, following the [owner checklist](OWNER-INFRASTRUCTURE-CHECKLIST.md):
- **Domain property (section 8):** confirm `chinvatbridge.com` is verified; two `google-site-verification` TXT records exist, so keep both.
- **Sitemap and indexing (section 9):** submit `https://www.chinvatbridge.com/sitemap.xml`, and request indexing for `/` and the four service pages.
- **Change of Address (section 10):** `.uk` → `.com`, **after** the Cloudflare fix, from a property you own on both domains.
- **Bing (section 11):** import from Search Console or add the site manually, then submit the sitemap.

### Article publication decisions

Each draft needs the owner's read and its dependency met (table in section C). The handoff recommends publishing the spreadsheets article first, then the SEO cost guide; the latter waits for the pricing wording fixes. The two articles that cite ONS and DSIT figures need them re-checked on the publishing day.

### Other open items from the handoff

| Item | Recommendation | Where |
|---|---|---|
| Supabase Site URL and `.com` allowlist | Reported done; not verifiable from outside. Sign in once at `/login` after deploying | [Checklist §1](OWNER-INFRASTRUCTURE-CHECKLIST.md#1-supabase-site-url-and-redirect-urls) |
| Vercel → Settings → Domains | Confirm `www.chinvatbridge.com` is primary and every domain shows "Valid Configuration" | [Checklist §4](OWNER-INFRASTRUCTURE-CHECKLIST.md#4-vercel-domain-configuration) |
| Repository visibility | This folder (strategy, competitor notes, unsent outreach drafts, pricing proposals) goes to GitHub with `main`. Confirm the repository is private before pushing | — |
| A fixed-price first engagement | Set prices and delivery terms | [First-engagement proposal](first-engagement-proposal.md) |
| Naming the founder | Yes, with a short bio, also as article author | [Strategy](09-complete-seo-strategy.md) |
| Homepage H1 | Keep the current line (option A) | [On-page audit](04-on-page-audit.md#h1-options-for-the-owner) |
| AI-crawler policy on `.com` | Keep search and retrieval agents; decide on training crawlers | [Technical audit, T11](03-technical-seo-audit.md) |
| Platforms to name | Only those genuinely delivered | [Positioning](01-business-positioning.md#open-questions-for-the-owner) |
| Scornik Gerstein | Ask about the case study and a footer credit (draft provided, not sent) | [Backlinks](13-backlink-opportunities.md#drafts-for-owner-approval-not-sent) |
| Three published article descriptions naming UK businesses | Decide whether to make them international (left as they were on `main`) | Section C |
| `.com` mail authentication | SPF authorises only the Namecheap forwarder and there is no DMARC record; check with whoever set up Google Workspace. Separate from the website | [Checklist](OWNER-INFRASTRUCTURE-CHECKLIST.md#before-you-change-anything-protect-the-mail-records) |
| Local `.env.local` | Still `NEXT_PUBLIC_SITE_URL=https://www.chinvatbridge.uk`; set it to the `.com` value so local builds match production | — |
| Out-of-date documents | `docs/redesign/COPY_CHANGES.md` (homepage title row), the [implementation log](implementation-log.md) (404 entry) and the checklist's "Status at a glance" predate the latest changes; the [handoff](HANDOFF.md) and this report are current | — |

## G. Deployment readiness

**Verdict: not ready for production deployment.** The code is merged and verified. The items under "Blocked" must be resolved first, and pushing `main` is itself the deployment.

### Completed

- All SEO work, merged locally into `main` as a fast-forward (`64a4fc0` → `39579ab`).
- Independent pre-deployment audit; the 404 robots regression it found is fixed.
- On `main`: lint, typecheck and production build pass. All ten drafts unpublished (404, not in the sitemap, not listed or linked).
- Focused end-to-end tests on the same code: 159 passed, plus 33 after the fix, 0 failed. Energy-wire test passed on all three viewports.
- `pnpm audit --prod` clean (Next.js 16.4.5).
- Production build output: every canonical, sitemap, robots and structured-data URL on `.com`; no `.uk` string.
- Live infrastructure, verified 19 Nov at 17:54 and 18:06 UTC:
  - the Vercel `NEXT_PUBLIC_SITE_URL` (Production) is in effect;
  - `.com` apex → `www` (308, path and query kept);
  - `http` → `https` with HSTS;
  - `.uk` → `.com` with the path kept.

### Pending (owner actions; none blocks the code, but each is needed for the migration or for growth)

- Supabase: a test sign-in on `.com` after the deploy.
- Vercel Domains page review.
- Post-deploy checks of the canonical, robots and sitemap ([checklist §3](OWNER-INFRASTRUCTURE-CHECKLIST.md#3-deploy-the-branch)).
- Search Console: Domain property, sitemap, indexing requests. Bing setup.
- Search Console Change of Address (after the Cloudflare fix).
- Analytics choice and setup.
- Pricing wording in the database.
- Article publication, one by one.
- The other decisions in section F.

### Blocked (resolve before pushing `main`)

| Item | Why it blocks | Owner action |
|---|---|---|
| Service-page commitments | Deploying publishes promises that haven't been confirmed as true | Confirm or edit the phrases in section F |
| Privacy-policy line | The attribution code ships with this merge; its disclosure is legal text awaiting approval | Approve or edit the line |
| Stripe webhook endpoint | Unverified, and production-critical: if it names `.uk`, paying customers aren't being provisioned (this affects the live site today, whatever is deployed) | Confirm `https://www.chinvatbridge.com/api/webhooks/stripe`; resend failed events |
| Cloudflare query string | Reported fixed but not in effect. The domain migration stays incomplete: parameters and campaign tags on `.uk` links are lost, and the Change of Address should wait | Check the rule; confirm with the `curl` above |

Once all four are resolved, the deployment is: push `main` to GitHub (Vercel deploys production), then run the post-deploy checks in [checklist §3](OWNER-INFRASTRUCTURE-CHECKLIST.md#3-deploy-the-branch).
