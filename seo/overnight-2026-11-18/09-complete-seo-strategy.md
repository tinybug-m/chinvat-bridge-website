# Complete SEO strategy

**For:** Chinvat Bridge. **Prepared:** 18 November 2026. **Horizon:** 90 days, with longer-term opportunities noted.
**Objective:** qualified B2B enquiries from organic search. Traffic, rankings and article count are supporting measures only.

## Executive summary

Chinvat Bridge has a well-built site, an honest voice and a clear four-part offer, but organic search can't yet see most of it:

1. **The site tells search engines its home is `chinvatbridge.uk`**, while the business, its mail and this mission treat `.com` as primary, and both domains serve the full site. Until one domain is canonical and the other redirects, every link and ranking signal is split.
2. **Three of the four services had no page.** AI, automation and software existed only as homepage sections. Pages for all three are now built locally.
3. **Nothing is measured.** There is no analytics on the site, and Search Console status is unknown, so qualified enquiries can't yet be traced to pages or queries.
4. **Proof is thin and partly broken.** The one real client link was dead (fixed locally), there are no case studies, and the legal entity named in the footer could not be found on Companies House.

The strategy is to fix the foundations in the first 30 days, then compete where a small, honest specialist can win. That means long-tail commercial searches from UK SME owners whose tools don't talk to each other: "business process automation consultant UK", "AI consultancy for small businesses", "bespoke software for small business", "replace spreadsheets with software", "how much does SEO cost UK". Not the head terms held by directories and large agencies.

## Business and audience positioning

Summary of [business positioning](01-business-positioning.md):

- **Buyer:** owner, MD or operations lead of a UK business with roughly 5–50 staff, running on SaaS plus spreadsheets, with no in-house developer.
- **Position:** *connect the tools a small business already uses, take the manual work out of the gaps between them, build the small piece of software or AI that nothing off the shelf can do, then help the right customers find you.*
- **Defensible because:** candour (the content already says when not to buy), one builder across website, automation, AI and SEO, the site itself as technical proof, and small first versions.
- **Not:** an "AI agency", a city-by-city agency, or a firm with partner badges it hasn't earned.

## Current SEO baseline

See [current baseline](02-current-seo-baseline.md). In short: eleven indexable URLs, five articles, one service page; strong technical hygiene apart from the domain split; lab Core Web Vitals within thresholds; no analytics; no brand visibility, because the name's SERP belongs to Zoroastrian mythology.

## Technical SEO findings

See [technical audit](03-technical-seo-audit.md). Ranked:

| | Finding | Severity | State |
|---|---|---|---|
| T1 | Two live domains; canonicals, sitemap and robots on `.uk` | Critical | Code ready; needs env var, Supabase URL, redirect and Search Console (human) |
| T2 | No indexable URL for three services | High | Built locally |
| T3 | Dead client link | High | Fixed locally |
| T4 | No measurement | High | Plan ready; owner picks tool |
| T5 | Legal entity unverifiable | High | Owner |
| T6–T15 | Title, H1, article schema, breadcrumbs, mobile main-thread cost, robots policy, internal anchors, Organization detail, study routes, duplicate robots meta | Medium/Low | Most fixed locally; rest documented |

## Keyword research

See [keyword research](05-keyword-research.csv): 79 keywords across AI, automation, data, software, SEO and buying guides. **No volumes are claimed**: none could be measured without a logged-in tool. Demand evidence is Google autocomplete (UK locale) plus observed SERP composition. Highest-value clusters:

| Cluster | Lead query | Why it's winnable |
|---|---|---|
| AI consultancy for SMEs | AI consultancy for small businesses UK | Results are blog-style pages from SEO firms, not specialists |
| Business process automation | business process automation services / consultant UK | A solo consultant's page appears in results, so specificity can beat size |
| Spreadsheet replacement | replace spreadsheets with software | Mostly US low-code vendors; few UK SME-focused answers |
| SEO cost | how much does SEO cost UK | We publish real prices; competitor guides are self-interested |
| Custom software for small business | bespoke software for small business | Head term is directory-held; the SME long tail isn't |
| Client portals | client portal development | Agencies but no directories; a natural fit for the stack |

## Keyword-to-URL mapping

See [keyword-to-URL map](06-keyword-to-url-map.csv). One primary intent per URL; seven cannibalisation risks checked and resolved in [content gap analysis](08-content-gap-analysis.md#cannibalisation-check).

## Commercial search-intent analysis

| Intent | Example | Right destination | Wrong destination |
|---|---|---|---|
| Solution-aware, ready to talk | business process automation consultant UK | Service page with a "describe a process" CTA | An article |
| Commercial investigation: cost | how much does SEO cost UK | Cost guide that links to /pricing | /pricing directly (too early) |
| Commercial investigation: choosing | how to choose an AI consultant | Hiring guide with honest criteria | Service page (too salesy) |
| Problem-aware | outgrown spreadsheets | Problem article, then service page | Service page (the reader hasn't named the solution yet) |
| Job seekers / course buyers | AI consultant salary, AI automation agency course | Nowhere | Avoid these phrasings in titles |
| Local | SEO consultant London | Nowhere (no presence shown there) | City page (doorway risk) |

The autocomplete data shows two traps to avoid in titles and H1s: "AI consultant UK" (jobs and salary) and "AI automation agency" (people starting agencies). Prefer "AI consultancy for small businesses", "AI integration" and "business process automation".

## Competitor analysis

See [competitor analysis](07-competitor-analysis.md). The UK field is fragmented: small and mid-size agencies with broad URL sets, thin proof and self-ranking listicles, plus directories (Clutch, DesignRush, G-Cloud) on head terms. The table stakes Chinvat lacks are a price signal for non-SEO work, named people with company details, one case study, and a third-party profile.

## Content gap analysis

See [content gap analysis](08-content-gap-analysis.md). The library has one awareness article per service and nothing at the commercial-investigation stage (cost, comparison, how to choose), which is where competitors capture buyers.

## Service-page optimisation strategy

See [service-page strategy](11-service-page-strategy.md). Four pages, each with one commercial intent, shared structure, cross-links, Service and BreadcrumbList data, and a CTA into the conversation. Three were built locally this session.

## New landing-page opportunities

| Page | When | Gate |
|---|---|---|
| `/work/scornik-gerstein` case study | Days 31–60 | Client permission; facts from the project |
| `/work/chinvat-bridge-website` ("how we built this site") | Days 31–60 | None: all facts are in the repo |
| Productised first engagement (operations review or technical SEO audit) | Days 31–60 | Owner sets scope and price |
| Client portals (split from the software page) | Days 61–90 | Enough distinct content and one example |
| Law-firm websites and SEO | After the case study | Case study live |
| n8n / Make / Xero integration sub-pages | Only if genuinely delivered | Owner confirms capability |
| `/services` hub | Any time, low priority | None |

## Editorial and topical-authority strategy

See [editorial README](editorial/README.md) and [calendar](editorial/editorial-calendar.csv). Principle: **one cluster per service page**, each built from the same three layers.

1. **Problem** pieces (spreadsheets; systems that don't talk; website not generating enquiries).
2. **Investigation** pieces (cost guides, comparisons, how to choose).
3. **Proof** pieces (case studies, "how we built this").

Each article links up to its service page with a descriptive anchor, across to one sibling, and ends with the service's own CTA. Publishing cadence: two strong articles a month beats eight thin ones; the 90-day plan is six articles plus two case studies.

## Internal linking architecture

See [internal linking plan](12-internal-linking-plan.md). Hub-and-spoke: the homepage and footer link to the four service pages; each service page links to its articles and two sibling services; articles link up with descriptive anchors. Implemented locally for every existing page.

## Local and UK SEO strategy

- **Google Business Profile**, only if the business meets clients in person (Google requires in-person contact with customers during stated hours and excludes online-only businesses; [guidelines](https://support.google.com/business/answer/13762416)). If the owner does meet clients at their premises or at a staffed location, set it up as a service-area business; otherwise skip it and rely on LinkedIn, Clutch and consistent company details as entity signals. Creating a profile for an ineligible business risks suspension and misrepresents it.
- **UK signals:** `en-GB` is already set; British spelling throughout; prices in pounds; "UK" in titles where buyers use it. Add the registered office to the footer and schema once confirmed.
- **No city pages.** Remote-first is stated plainly instead.
- **Bing Places and Apple Business Connect:** free, minutes each, on the same eligibility basis.

## International expansion opportunities

The site says it works globally and would serve any international enquiries from the same pages, with prices in pounds. Autocomplete shows English-speaking demand for the same phrasings (AI consultant for small business, workflow automation consultant), but SERPs abroad are local agencies and offshore vendors. Recommendation: **no country pages or hreflang in the next 90 days.** Keep "we work remotely with businesses elsewhere" in FAQs. Revisit if Search Console shows more than about 20% of non-brand impressions from one country, *and* there is a client there; the Scale SEO plan already offers hreflang work to clients.

## Link acquisition strategy

See [backlink opportunities](13-backlink-opportunities.md). The order of effort:

1. Links the business can earn without asking strangers: a client credit from Scornik Gerstein; a LinkedIn company page; Companies House-backed profiles (once confirmed); Clutch free profile; Google Business Profile only if eligible.
2. One citable data explainer each quarter, built on ONS and DSIT AI-adoption figures plus Chinvat's own analysis (original data only if a survey is run, with its method and sample size stated).
3. Expert contributions to UK SME publications with published contributor routes (SME Today, Small Business UK).
4. Journalist-request platforms (Featured.com free tier), answered only where there is real expertise.

No purchased links, link exchanges, private networks or mass directory submissions.

## Conversion optimisation

See [conversion optimisation](14-conversion-optimisation.md). Highest leverage: enquiry attribution (built locally); give the service pages a specific first step; add named people and company details; publish one case study.

## Analytics and measurement

See [measurement framework](15-measurement-framework.md). The north-star metric is **qualified organic enquiries per month**. Supporting: non-brand impressions and clicks per service page, service-page entrances, enquiry rate per service page, and the indexing state of `.com`.

## Recommendations

**Priority:** P1 = this month; P2 = within 60 days; P3 = within 90 days or when gated. **Impact** is on qualified enquiries. **Effort:** S < 1 day, M 1–3 days, L > 3 days.

| ID | Recommendation | Priority | Impact | Effort | Confidence | Dependencies | Evidence | Measure |
|---|---|---|---|---|---|---|---|---|
| R1 | Consolidate on `www.chinvatbridge.com`: set the env var, Supabase URL and redirect `.uk`, then Change of Address in Search Console | P1 | High | S | High | Owner access to Vercel, Supabase, Cloudflare, GSC | [T1](03-technical-seo-audit.md#t1-two-live-domains-canonicals-on-the-wrong-one--critical) | `.uk` URLs redirect; `.com` indexed |
| R2 | Verify Search Console (Domain property) and Bing Webmaster Tools; submit the sitemap | P1 | High (enables everything) | S | High | DNS access | [baseline](02-current-seo-baseline.md#data-we-do-not-have) | Data flowing |
| R3 | Deploy the three service pages and new internal links | P1 | High | S (built) | Medium-high | R1 ideally first; owner review of claims | [T2](03-technical-seo-audit.md#t2-three-services-have-no-url-of-their-own--high) | Impressions per service page within 4–8 weeks |
| R4 | Add cookieless analytics. Enquiry attribution (first page, referrer, page before contact) is **built locally**. | P1 | High | S (attribution done) | High | Owner picks tool; approves privacy line | [T4](03-technical-seo-audit.md#t4-no-measurement--high) | Enquiries attributable by page |
| R5 | Resolve the legal-entity question; add company number and registered office to the footer and schema | P1 | Medium (trust; directories) | S | High | Owner | [T5](03-technical-seo-audit.md#t5-company-identity-is-not-verifiable--high-trust-and-compliance) | Footer shows verifiable details |
| R6 | Fix the Starter-plan contradiction and jargon on /pricing; state VAT | P1 | Medium | S | High | Owner; DB edit | [on-page audit](04-on-page-audit.md#pricing) | Fewer "what's included" questions |
| R7 | Entity profiles: LinkedIn company page now; Google Business Profile only if the business meets clients in person (Google's eligibility rule) | P1 | Medium (brand, trust) | S | Medium | R5; GBP eligibility | [local SEO](#local-and-uk-seo-strategy) | Profiles live; brand search shows the business |
| R8 | Publish the flagship spreadsheet article and the SEO cost guide | P1 | Medium-high | S (drafted) | Medium | Owner review | [content gaps](08-content-gap-analysis.md) | Impressions; enquiries citing them |
| R9 | Write the Scornik Gerstein case study and ask for a "website by" credit | P2 | High (proof, link) | M | Medium | Client permission | [T3](03-technical-seo-audit.md#t3-dead-link-on-the-only-real-client-project--high) | Case study live; referring domain |
| R10 | Publish the "how we built this site" case study (drafted) | P2 | Medium | S (drafted) | High | Owner review | [positioning](01-business-positioning.md) | Visits from software page |
| R11 | Decide on a productised first engagement and its price; add it to the service pages (copy drafted in the [proposal](first-engagement-proposal.md)) | P2 | High | S (drafted) + owner pricing | Medium | Owner pricing decision | [competitors](07-competitor-analysis.md#independents-worth-studying-for-positioning) | Enquiry rate on service pages |
| R12 | Name the founder (and team) with short bios; add a named author to articles | P2 | Medium | S | Medium | Owner consent | [competitors table stakes](07-competitor-analysis.md#table-stakes-chinvat-must-match) | Engagement; E-E-A-T |
| R13 | Publish the remaining four drafted articles, two a month | P2 | Medium | S each (drafted) | Medium | Owner review | [calendar](editorial/editorial-calendar.csv) | Non-brand impressions per cluster |
| R14 | Clutch free profile, then ask the first two or three clients for reviews | P2 | Medium | S | Medium | Clients | [backlinks](13-backlink-opportunities.md) | Reviews count |
| R15 | Homepage H1, option B | P3 | Low-medium | S | Medium | Owner design decision | [on-page audit](04-on-page-audit.md#h1-options-for-the-owner) | Engagement on hero |
| R16 | Publish the data explainer (UK SME AI adoption figures, read properly; drafted) | P3 | Medium (links) | S (drafted) | Medium | R13 cadence; re-check figures | [backlinks](13-backlink-opportunities.md) | Referring domains |
| R17 | Measure mobile INP; optimise the homepage main thread only if above 200 ms | P3 | Low-medium | M | Medium | R2/R4 field data | [T10](03-technical-seo-audit.md#t10-homepage-main-thread-cost-on-mobile--medium) | INP p75 |
| R18 | Decide AI-crawler policy for `.com` | P3 | Low-medium | S | Medium | Owner preference | [T11](03-technical-seo-audit.md#t11-robots-policy-differs-between-the-domains--medium) | robots.txt matches decision |
| R19 | Remove design-study routes from production | P3 | Low | S | High | None | [T14](03-technical-seo-audit.md#t14-design-study-routes-are-public--low) | 404 on those paths |
| R20 | Upgrade Next.js for the security advisory the build reports | P1 (security, not SEO) | n/a | S–M | High | Regression test run | Build output, 18 Nov 2026 | Build without the advisory |

## Action plans

The day-by-day plan is in [90-day roadmap](10-90-day-roadmap.md). In summary:

### 30-day plan
Foundations and measurement: R1, R2, R3, R4, R5, R6, R7, R8, R20. Baseline recorded on day 1 of data.

### 60-day plan
Proof and conversion: R9, R10, R11, R12, R14, plus two more articles (R13).

### 90-day plan
Authority and refinement: R13 continues, R16, R15, R17, R18, R19. Review Search Console for the first queries each service page earns, and rewrite titles where impressions arrive without clicks.

## Risks and assumptions

| Assumption or risk | Why it matters | Mitigation |
|---|---|---|
| `.com` is the intended primary domain | The whole consolidation depends on it | Supported by the mission brief, the contact address and Google Workspace MX on `.com`. If `.uk` has more inbound links, Change of Address still carries them. |
| The service-page claims are true | A page that over-promises costs more trust than it earns | Six claims are listed for the owner to confirm before deploy |
| Demand exists for the targeted long tail | Volumes could not be measured | Autocomplete shows people type these queries; Search Console will show within 60 days which pages earn impressions, and the plan re-ranks content then |
| A new domain with no links ranks slowly | Months, not weeks, for competitive commercial terms | Lead with long-tail and problem-led content; earn a few relevant links early (client credit, profiles, one data piece) |
| Four service lines read as "does everything" | Dilutes the position | One promise across all four (connect, automate, build the missing piece), and cross-links that show them as one offer |
| Content is written but not published | Drafts help no one | Two articles in the first 30 days are on the critical path, not optional |
| The owner's time is the bottleneck | Most P1 items are owner actions | The roadmap front-loads short, high-impact owner tasks (about a day of work in total in week 1) |

## What would change this plan

- **Search Console shows the site is barely indexed:** R1–R2 dominate; hold back content until pages are indexed.
- **Keyword volumes become available** (Keyword Planner or a tool trial): re-rank the P2 and P3 content by measured demand.
- **A vertical client signs** (law, accountancy): bring the vertical page forward.
- **The owner confirms platform expertise** (n8n, Xero): add those sub-pages; the SERPs are thin.
