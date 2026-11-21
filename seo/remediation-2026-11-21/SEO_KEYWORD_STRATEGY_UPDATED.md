# Keyword strategy, updated

**Updated:** 21 November 2026. **Replaces:** the decisions in `seo/overnight-2026-11-18/05-keyword-research.csv` and `06-keyword-to-url-map.csv`. Those files are kept unchanged as the original research.

## What this is, and what it is not

**No search volume has been measured for any keyword.** The column says "not measured" on every row, and it stays that way until Google Keyword Planner or Search Console data exists. The decisions below rest on:

- the 18 Nov research: Google autocomplete (en-GB) plus SERP composition through a US-based search tool, with no positions;
- a 21 Nov autocomplete check of "SME" versus "small business" phrasing (below);
- intent, fit with the four services, and cannibalisation between this site's own URLs.

They are therefore **qualitative**, and every "Prioritise" should be re-ranked once volumes arrive (see [what would change these decisions](#what-would-change-these-decisions)).

## Positioning: "SMEs" or "small businesses"?

**Finding (21 Nov 2026, Google autocomplete, `hl=en-GB&gl=gb`, presence not volume):**

| Typed | What autocomplete offers |
|---|---|
| custom software for sme | custom software for **small business**; custom software development for **small businesses** |
| workflow automation for sme | workflow automation for **small business**; ai workflow automation for smes |
| seo for sme | nothing relevant (seo and sem; seo sem meaning) |
| ai consultant for sme | ai consultant for sme; ai consultant for **small businesses** |
| seo for small business | 10 suggestions, all on-topic |
| custom software for small business | 4 suggestions, all on-topic |

Google rewrites "SME" queries into "small business" phrasing for software, automation and SEO, and "seo for sme" has no relevant completion. Buyers type "small business".

**Decision:**
- **Titles say "Small Businesses".** Done locally: the homepage, `/services/ai-integration` and `/services/custom-software`. `/services/seo` already said it.
- **"SME" stays in body copy** where it reads naturally; it costs nothing there.
- **The buyer is unchanged:** owner, MD or operations lead of a business with roughly 5–50 staff.
- **The homepage title no longer says "Custom Software".** `/services/custom-software` targets that term, so the homepage and that page stop competing for it. The new title is "AI, Automation & Software for Small Businesses — Chinvat Bridge", 63 characters.
- **Not changed:** `/insights` keeps "…for SMEs". It is an index page with low commercial intent, and a "Small Businesses" version would run past 65 characters.

**Still a question for measurement:** whether to put "UK" back into titles. The 19 Nov decision removed it, because the business works internationally. Most of the researched demand is UK-phrased ("…uk"). Search Console's country split will show whether non-UK impressions exist. Until then, "UK-based" stays in the descriptions.

## The four service clusters, revisited

| Cluster | Verdict | Why |
|---|---|---|
| AI integration (`/services/ai-integration`) | Keep | Real demand phrasing ("ai consultant for small business"). The SERP is blog-style pages, not specialists. |
| Workflow automation (`/services/workflow-automation`) | Keep; **strongest cluster** | A solo consultant appears for the core query, so specificity can compete. "AI workflow automation" moves here from the AI page. |
| Custom software (`/services/custom-software`) | Keep | Head terms are directory-held, but the small-business long tail and the spreadsheet angle are open. |
| SEO (`/services/seo`, `/pricing`) | Keep, **but fix /pricing first** | The two highest-intent SEO URLs (the cost guide and /pricing) currently undermine each other. Lead with *technical* SEO, where the site itself is proof. |

No new service pages are recommended.

## Decision counts

79 keywords:

| Decision | Count |
|---|---|
| Prioritise | 11 |
| Retain | 42 |
| Reassign | 1 |
| Investigate | 13 |
| Remove | 12 |

- **Prioritise:** the main target of a live page, and the best evidence of fit.
- **Retain:** keep where it is, at the existing priority.
- **Reassign:** move to a different URL.
- **Investigate:** an untested hypothesis, or gated on an owner decision or capability.
- **Remove:** wrong intent, not offered, or not winnable.

## Updated keyword-to-URL map

One primary intent per URL. Titles are those on branch `seo/remediation-2026-11-21`, not yet deployed.

| URL | Primary keyword | Secondary keywords | Title | State |
|---|---|---|---|---|
| `/` | brand + "AI, automation and software for small businesses" | technology consultancy uk | AI, Automation & Software for Small Businesses — Chinvat Bridge | Changed locally |
| `/services/ai-integration` | ai consultant for small business | ai consultancy uk; ai integration services (uk); ai implementation consultant for small business; llm integration services | AI Consultancy & Integration for Small Businesses — Chinvat Bridge | Changed locally |
| `/services/workflow-automation` | business process automation services / consultant uk | workflow automation services/consultant; api integration services uk; reporting automation; crm integration; **ai workflow automation services** (moved here) | Business Process Automation & Integration — Chinvat Bridge | Live |
| `/services/custom-software` | custom / bespoke software for small business | custom/bespoke software development uk; internal tools; client portal development; web application development; dashboards | Custom Software Development for Small Businesses — Chinvat Bridge | Changed locally |
| `/services/seo` | seo for small business uk; technical seo services uk | seo consultant uk; seo audit services uk | SEO Services for Small Businesses — Chinvat Bridge | Live |
| `/pricing` | seo packages uk | seo pricing uk | SEO Packages & Pricing — Chinvat Bridge | Live; wording blocked on the owner |
| `/insights/replace-spreadsheets-with-custom-software` | replace spreadsheets with software | spreadsheet to database; excel to web app | When to Replace Spreadsheets With Software — Chinvat Bridge | Live |
| `/insights/how-much-does-seo-cost-uk` | how much does seo cost uk | seo cost uk; monthly seo cost uk | How Much Does SEO Cost in the UK? — Chinvat Bridge | Live; contradicts /pricing |
| `/insights/where-ai-can-save-your-business-time` | where ai can save business time | ai for smes | (unchanged) | Live |
| `/insights/what-should-you-automate-first` | what to automate first | automate manual processes | (unchanged) | Live |
| `/insights/when-should-a-business-build-custom-software` | when to build custom software | build vs buy software | (unchanged) | Live |
| `/insights/why-your-website-isnt-bringing-you-customers` | website not generating enquiries | — | (unchanged; 69 characters) | Live; needs the B2B refresh |
| Drafts | as in the original map | — | — | See the 90-day plan for order |

**Cannibalisation, after these changes:**

| Pair | Status |
|---|---|
| Homepage vs `/services/custom-software` | Reduced: the homepage no longer names "Custom Software" |
| AI page vs workflow page on "AI workflow automation" | Resolved: assigned to the workflow page |
| `/services/seo` vs `/pricing` vs the cost guide | Assignments stand: service / packages / cost. Check against Search Console queries once available |
| Custom software page vs the build-vs-buy article vs the spreadsheets article | Stand: distinct intents. Check with data |

## What would change these decisions

- **Keyword Planner volumes:** re-rank every Prioritise and Retain. Move any Prioritise with negligible UK volume down.
- **Search Console queries:** promote queries already earning impressions in positions 8–20. Rewrite titles where impressions arrive without clicks.
- **The owner confirms n8n, Xero or Zapier delivery:** promote those Investigate rows.
- **The Scornik Gerstein case study is approved:** promote the law-firm rows.

## All 79 keywords

| Keyword | Cluster | Intent | Geo | Original priority | Measured volume | Decision | Target URL | Reason |
|---|---|---|---|---|---|---|---|---|
| ai consultancy uk | AI integration | commercial | UK | P1 | not measured | **Prioritise** | /services/ai-integration | Core commercial term; the page title now says 'AI Consultancy & Integration'. |
| ai consultant for small business | AI integration | commercial | global, US-skewed | P1 | not measured | **Prioritise** | /services/ai-integration | Autocomplete confirms the 'small business' phrasing (21 Nov); title aligned. |
| business process automation consultant uk | Automation | commercial | UK | P1 | not measured | **Prioritise** | /services/workflow-automation | Best evidence that a specific small-firm page can compete. |
| business process automation services | Automation | commercial | global | P1 | not measured | **Prioritise** | /services/workflow-automation | Matches the page title 'Business Process Automation & Integration'. |
| technical seo services / consultant uk | SEO | commercial | UK | P2 | not measured | **Prioritise** | /services/seo | Fewer entrants; the strongest proof (this site) is technical. |
| how much does seo cost uk | SEO | commercial investigation | UK | P1 | not measured | **Prioritise** | /insights/how-much-does-seo-cost-uk (published 20 Nov) | Live, but contradicts /pricing until the plan wording is fixed. |
| seo monthly cost uk / seo cost uk / seo prices uk | SEO | commercial investigation | UK | P1 | not measured | **Prioritise** | /insights/how-much-does-seo-cost-uk | As above. |
| seo for small business uk | SEO | commercial | UK | P2 | not measured | **Prioritise** | /services/seo | Title already 'SEO Services for Small Businesses'. |
| bespoke software for small business | Software | commercial | UK | P1 | not measured | **Prioritise** | /services/custom-software | SME long tail; title now 'for Small Businesses'. |
| custom software for small business | Software | commercial/informational | UK-neutral | P1 | not measured | **Prioritise** | /services/custom-software | Autocomplete rewrites 'custom software for sme' to this (21 Nov). |
| replace spreadsheets with software | Software | problem-aware | UK | P1 | not measured | **Prioritise** | /insights/replace-spreadsheets-with-custom-software (published 20 Nov) | Clearest gap in the research; verify with a google.co.uk position check. |
| ai consultants uk small business | AI integration | commercial | UK | P1 | not measured | **Retain** | /services/ai-integration | Variant of the above. |
| small business ai consultant uk | AI integration | commercial | UK | P1 | not measured | **Retain** | /services/ai-integration | Variant of the above. |
| ai consulting for smes | AI integration | commercial | UK | P1 | not measured | **Retain** | /services/ai-integration | 'SME' phrasing is the rarer form in autocomplete; keep in body copy, not titles. |
| ai integration services | AI integration | commercial | global (offshore-heavy) | P2 | not measured | **Retain** | /services/ai-integration | Exact service name; offshore-heavy SERP, so long-term. |
| ai integration services uk | AI integration | commercial | UK | P2 | not measured | **Retain** | /services/ai-integration | As above, UK. |
| ai consultant cost uk | AI integration | commercial investigation | UK | P2 | not measured | **Retain** | /insights/how-to-choose-an-ai-consultant (draft) | Investigation intent; the draft's cost section serves it. |
| ai consultant hourly rate uk | AI integration | commercial investigation | UK | P3 | not measured | **Retain** | /insights/how-to-choose-an-ai-consultant (draft) | Section of the hiring guide. |
| ai implementation consultant for small business | AI integration | commercial | global | P2 | not measured | **Retain** | /services/ai-integration | Long tail of the service page. |
| ai for smes | AI integration | informational/commercial | UK/intl | P2 | not measured | **Retain** | /insights/where-ai-can-save-your-business-time | Existing article; refresh rather than a new piece. |
| ai strategy for smes | AI integration | informational/commercial | UK | P3 | not measured | **Retain** | /insights/how-to-choose-an-ai-consultant (draft) | Section only; not sampled. |
| ai workflow automation uk | AI integration | commercial | UK | P2 | not measured | **Retain** | /services/workflow-automation | Already on the workflow page (AI steps section). |
| ai automation services cost uk | AI integration | commercial | UK | P3 | not measured | **Retain** | /insights/how-to-choose-an-ai-consultant (draft) | Section of the hiring guide. |
| custom ai chatbot for business uk | AI integration | commercial | UK | P3 | not measured | **Retain** | /services/ai-integration | Crowded; niche angle only (assistants on your own information). |
| ai chatbot cost uk | AI integration | commercial investigation | UK | P3 | not measured | **Retain** | /insights/how-to-choose-an-ai-consultant (draft) | Section only. |
| llm integration services | AI integration | commercial | global | P3 | not measured | **Retain** | /services/ai-integration | Mention only; low-frequency suggestion. |
| business process automation consultancy uk | Automation | commercial | UK | P1 | not measured | **Retain** | /services/workflow-automation | Variant. |
| workflow automation consultant | Automation | commercial | global | P1 | not measured | **Retain** | /services/workflow-automation | Jobs-heavy autocomplete; keep, don't lead with it. |
| workflow automation services | Automation | commercial | global | P1 | not measured | **Retain** | /services/workflow-automation | Not sampled. |
| workflow automation agency uk | Automation | commercial | UK | P2 | not measured | **Retain** | /services/workflow-automation | Avoid 'agency' in titles. |
| automate manual processes | Automation | problem-aware | global | P2 | not measured | **Retain** | /insights/what-should-you-automate-first | Existing article. |
| api integration services uk | Automation | commercial | UK | P2 | not measured | **Retain** | /services/workflow-automation | Section of the workflow page. |
| api integration services | Automation | commercial | global (offshore-heavy) | P3 | not measured | **Retain** | /services/workflow-automation | Offshore-heavy; low priority. |
| crm integration services | Automation | commercial | global | P3 | not measured | **Retain** | /services/workflow-automation | Mention only. |
| zapier agency uk / zapier consultant uk | Automation | commercial | UK | P3 | not measured | **Retain** | /services/workflow-automation | Mention; the Zapier directory owns the SERP. |
| reporting automation services uk | Automation | commercial | UK | P2 | not measured | **Retain** | /services/workflow-automation | Few UK specialists seen. |
| dashboard development services uk | Data | commercial | UK | P2 | not measured | **Retain** | /services/custom-software | Section. |
| custom dashboard development uk cost | Data | commercial investigation | UK | P3 | not measured | **Retain** | /insights/custom-software-cost-uk (not started) | Section of a future cost guide. |
| seo consultant uk | SEO | commercial | UK | P2 | not measured | **Retain** | /services/seo | Dense SERP. |
| seo audit services uk | SEO | commercial | UK | P2 | not measured | **Retain** | /services/seo | Productised audit page only if launched. |
| seo audit cost uk | SEO | commercial investigation | UK | P2 | not measured | **Retain** | /insights/what-a-technical-seo-audit-should-include (draft) | Section. |
| seo packages uk / seo pricing uk / seo pricing packages uk | SEO | commercial | UK | P1 | not measured | **Retain** | /pricing | Blocked in practice by the /pricing wording. |
| website not generating leads / enquiries | SEO | problem-aware | UK | P2 | not measured | **Retain** | /insights/why-your-website-isnt-bringing-you-customers | Article targets local consumer businesses; needs the B2B refresh. |
| custom software development uk | Software | commercial | UK | P2 | not measured | **Retain** | /services/custom-software | Directory-held head term; long-term. |
| bespoke software development uk | Software | commercial | UK | P2 | not measured | **Retain** | /services/custom-software | As above. |
| web application development uk | Software | commercial | UK | P2 | not measured | **Retain** | /services/custom-software | Section. |
| internal tools development uk | Software | commercial | UK | P2 | not measured | **Retain** | /services/custom-software | A short page ranks; section now, child page only with proof. |
| spreadsheet to database / excel to web app | Software | informational | global | P2 | not measured | **Retain** | /insights/replace-spreadsheets-with-custom-software | DIY intent; section. |
| client portal development | Software | commercial | UK | P2 | not measured | **Retain** | /services/custom-software | Section; child page when there is an example. |
| client portal development cost | Software | commercial investigation | UK | P2 | not measured | **Retain** | /insights/does-your-business-need-a-client-portal (draft) | Investigation intent. |
| bespoke crm development uk | Software | commercial | UK | P3 | not measured | **Retain** | /services/custom-software | Mention. |
| software development cost uk | Software | commercial investigation | UK | P2 | not measured | **Retain** | /insights/custom-software-cost-uk (not started) | Needs the owner's view on publishing ranges. |
| how much does custom software cost | Software | commercial investigation | global | P2 | not measured | **Retain** | /insights/custom-software-cost-uk (not started) | As above. |
| ai workflow automation services | AI integration | commercial | global | P2 | not measured | **Reassign** | /services/workflow-automation | Was mapped to the AI page; 'workflow automation' belongs to the workflow page, so mapping it to the AI page created the overlap the 19 Nov rename tried to end. |
| chatgpt vs custom ai for business | AI integration | commercial investigation | global | P2 | not measured | **Investigate** | /insights/ai-subscriptions-vs-ai-integration (draft) | Phrasing never tested; check demand before publishing the draft first. |
| xero integration with chatgpt / hubspot integration with claude | AI integration | commercial investigation | global | P4 | not measured | **Investigate** | later article | Only with real build experience (owner to confirm). |
| ai readiness assessment / ai audit for business | AI integration | commercial | UK | P3 | not measured | **Investigate** | owner decision | Depends on whether a fixed-price first engagement is launched. |
| connect business systems / systems that don't talk to each other | Automation | problem-aware | UK | P1 | not measured | **Investigate** | /insights/how-to-connect-business-systems (draft) | Phrasing taken from competitor copy, never tested; core positioning, so worth measuring first. |
| system integration for small business | Automation | commercial investigation | UK | P2 | not measured | **Investigate** | /insights/how-to-connect-business-systems (draft) | Hypothesis only. |
| zapier vs make | Automation | commercial investigation | global | P2 | not measured | **Investigate** | /insights/zapier-make-or-custom-integration (not started) | Untested; vendor pages likely dominate. |
| n8n consultant uk / n8n agency uk | Automation | commercial | UK | P3 (gated) | not measured | **Investigate** | owner decision | Only if n8n is genuinely delivered. |
| custom xero integration uk / xero integration developer | Automation | commercial | UK | P3 (gated) | not measured | **Investigate** | owner decision | Only with real Xero API work. |
| fix broken zapier / automation rescue | Automation | commercial | global | P3 | not measured | **Investigate** | /services/workflow-automation | Gap hypothesis; check demand. |
| how to choose a technology partner / questions to ask a software agency | Buying guides | commercial investigation | UK | P2 | not measured | **Investigate** | /insights/how-to-choose-a-technology-partner (draft) | Hypothesis only. |
| b2b seo agency uk | SEO | commercial | UK | P3 | not measured | **Investigate** | /services/seo | Not sampled. |
| seo for solicitors / law firms | SEO | commercial | UK | P3 (gated) | not measured | **Investigate** | later law-firm page | Gated on the case study. |
| website design for law firms / solicitors | Software | commercial | UK | P3 (gated) | not measured | **Investigate** | later /work/scornik-gerstein | Gated on the case study. |
| ai implementation | AI integration | informational | global | skip | not measured | **Remove** | none | Jobs and courses intent (confirmed in the original research). |
| ai automation agency uk | AI integration | commercial | UK | P3 | not measured | **Remove** | none | Head term polluted by people starting agencies; never use 'agency' framing. |
| llm integration | AI integration | informational | global | skip | not measured | **Remove** | none | Developer intent. |
| business process automation | Automation | informational | global | skip | not measured | **Remove** | none | Head term: definitions, jobs, vendors. |
| power bi consultant uk | Automation | commercial | UK | skip | not measured | **Remove** | none | Not offered. |
| data integration services | Data | commercial | global | skip | not measured | **Remove** | none | Enterprise intent. |
| business intelligence consultancy | Data | commercial | UK | skip | not measured | **Remove** | none | Jobs and ambiguous intent. |
| seo consultant london | SEO | commercial local | London | skip | not measured | **Remove** | none | No London presence: doorway risk. |
| seo agency uk / seo company uk | SEO | commercial | UK | skip | not measured | **Remove** | none | Not winnable. |
| mvp development uk | Software | commercial | UK | skip | not measured | **Remove** | none | Not a focus. |
| next.js development agency uk | Software | commercial | UK | skip | not measured | **Remove** | none | Low volume; stack is proof, not a target. |
| software development company near me | Software | commercial local | local | skip | not measured | **Remove** | none | Local pack. |
