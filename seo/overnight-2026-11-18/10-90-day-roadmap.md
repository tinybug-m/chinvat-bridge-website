# 90-day roadmap

Day 1 is the day the owner starts acting on this plan. Each task names its owner: **Owner** (business decision or account access), **Dev** (code; most is already done locally on branch `seo/overnight-2026-11-18`), or **Editor** (content review and publishing). Recommendation IDs (R1…) refer to the [complete strategy](09-complete-seo-strategy.md#recommendations).

## Days 1–30: foundations and measurement

**Goal:** one canonical domain, a measurable site, four indexable service pages, and two strong new articles.

| When | Task | Who | ID | Done when |
|---|---|---|---|---|
| Day 1 | Review this branch; confirm or edit the claims listed in the [handoff](HANDOFF.md#decisions-requiring-human-approval) | Owner | R3 | Service-page copy approved |
| Day 1 | Confirm the registered company name and number | Owner | R5 | Known |
| Day 1–2 | Supabase Auth: Site URL → `.com`; add `.com/**` to redirects | Owner | R1 | Magic link from `.com` works |
| Day 2 | Vercel: `NEXT_PUBLIC_SITE_URL=https://www.chinvatbridge.com`; merge the branch; deploy | Owner/Dev | R1, R3 | Live canonical is `.com` |
| Day 2 | Redirect `.uk` and `www.chinvatbridge.uk` → `https://www.chinvatbridge.com/$path` (301/308) | Owner | R1 | `curl -I` shows the redirect |
| Day 2 | Search Console: Domain property for `chinvatbridge.com`; Change of Address from `.uk` if it was verified; submit the sitemap. Same in Bing Webmaster Tools. | Owner | R1, R2 | Sitemap "Success" |
| Day 3 | Request indexing for the four service pages and the homepage | Owner | R2 | Requested |
| Days 3–5 | Choose analytics (see [measurement](15-measurement-framework.md#tooling)); approve the privacy-policy line for enquiry attribution, which is already built | Owner/Dev | R4 | First enquiry email shows its first page and referrer |
| Day 5 | Record the baseline: GSC indexed pages, impressions and clicks (brand vs non-brand), enquiries | Owner | R2 | Baseline row in the tracker |
| Days 5–7 | Fix the /pricing contradictions and jargon; state VAT | Owner | R6 | Plans read plainly |
| Day 7 | Upgrade Next.js for the security advisory; rerun the e2e suite | Dev | R20 | Build clean |
| Days 7–10 | Google Business Profile (service-area), Bing Places | Owner | R7 | Verified |
| Days 10–14 | Publish "Outgrown your spreadsheets?" | Editor | R8 | Live, linked from the software page |
| Days 14–21 | Publish "How much does SEO cost in the UK?" | Editor | R8 | Live, linked from the SEO page and /pricing |
| Days 21–30 | Ask Scornik Gerstein for permission for a case study and a "website by" credit | Owner | R9 | Answer |
| Day 30 | First review: indexing of the new pages, first impressions per service page, any enquiries with a landing page | Owner | — | Notes in the tracker |

**Exit criteria for day 30:** `.uk` redirects; Search Console shows `.com` pages indexed; four service pages indexed; analytics recording; two articles live.

## Days 31–60: proof and conversion

**Goal:** give buyers reasons to believe, and a specific first step.

| When | Task | Who | ID |
|---|---|---|---|
| Days 31–40 | Write and publish the Scornik Gerstein case study (if approved): brief, constraints, what was built, what changed; no invented numbers | Owner/Editor | R9 |
| Days 31–45 | "How we built this site": the client portal, subscription checkout and technical SEO, from the repo's own history | Editor/Dev | R10 |
| Days 35–45 | Decide on a productised first engagement (an "operations review" or a "technical SEO audit"), its scope and its price; add it to the relevant service pages | Owner | R11 |
| Days 35–45 | Name the founder on the About section and as article author, with a short bio | Owner | R12 |
| Days 40–50 | Publish "How to connect business systems that don’t talk to each other" | Editor | R13 |
| Days 45–55 | Publish "How to choose an AI consultant" | Editor | R13 |
| Days 45–60 | Clutch free profile; ask the first two or three clients for reviews | Owner | R14 |
| Day 60 | Review: queries each service page is earning; titles with impressions but few clicks; enquiries by page | Owner | — |

**Exit criteria for day 60:** one or two case studies live; a named person on the site; a defined first step on at least one service page; four new articles live.

## Days 61–90: authority and refinement

**Goal:** earn the first relevant links, and tune pages to the queries that are actually arriving.

| When | Task | Who | ID |
|---|---|---|---|
| Days 61–70 | Publish "What a technical SEO audit should include" | Editor | R13 |
| Days 61–75 | Rewrite titles and descriptions for pages with impressions and CTR below 1% (from GSC) | Editor | — |
| Days 61–80 | First data piece: UK SME AI adoption, combining ONS and DSIT figures with a short survey or analysis; pitch it to two UK SME publications | Owner/Editor | R16 |
| Days 65–80 | Publish "AI subscriptions or AI integration?" | Editor | R13 |
| Days 70–80 | Submit one contributor article to SME Today or Small Business UK | Owner | R16 |
| Days 70–85 | Decide on homepage H1 option B; decide AI-crawler policy | Owner | R15, R18 |
| Days 75–90 | Check mobile INP in field data; act only if above 200 ms | Dev | R17 |
| Days 80–90 | Remove the design-study routes from production | Dev | R19 |
| Day 90 | Quarter review against the [measurement framework](15-measurement-framework.md); set the next quarter's clusters (client portals, law-firm page if the case study is live) | Owner | — |

**Exit criteria for day 90:** six new articles and one or two case studies live; at least one earned, relevant referring domain; every enquiry attributable to a landing page; a clear view of which service page produces qualified enquiries.

## What is already done (this session, local only)

- The `.com` fallback in code, the Supabase config and the enquiry email footer
- Three service pages, wired into the nav, footer, hero, homepage plates, sitemap and articles
- Homepage title and description
- Enquiry attribution (first page, referrer, page before contact) in every enquiry email, with a privacy-policy line
- Article structured data and breadcrumbs
- The Scornik Gerstein link
- Six full article drafts ready for review in [editorial/articles](editorial/articles/)

Nothing has been deployed, pushed or published.
