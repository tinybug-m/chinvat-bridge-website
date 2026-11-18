# Service-page strategy

## Architecture

| URL | Service (homepage name) | Primary intent | State |
|---|---|---|---|
| `/services/ai-integration` | AI & Automation Integration | AI consultancy and integration for small businesses | Built locally |
| `/services/workflow-automation` | Automation & Workflows | Business process automation and API integration | Built locally |
| `/services/custom-software` | Software & Web | Custom and bespoke software for small businesses | Built locally |
| `/services/seo` | SEO & Digital Growth | SEO services for UK SMEs | Live; related links extended locally |

**Why these slugs.** Each slug is the plainest name of the service in the words buyers use ("AI integration", "workflow automation", "custom software"). They avoid "agency" and "consultant" (the job-seeker traps the autocomplete data showed) and leave room for child pages later (`/services/custom-software/client-portals`).

**Why not more pages now.** API integration, dashboards, client portals and chatbots each have some demand, but splitting them now would create thin pages that compete with their parents. They live as sections and FAQs of the three pages, and become their own pages only when there is enough distinct content and at least one example to show.

## Page anatomy (shared by all four)

Built from `components/services/ServiceBlocks.tsx`, the new `components/services/ServicePage.tsx` and the shared `components/services/structured-data.tsx` (which `/services/seo` now uses too), so every page reads as one system and matches the existing design:

1. **Header**: kicker (service name), H1 (benefit plus service phrase), lede, the service's own homepage diagram, CTA into the conversation, secondary "See what we do".
2. **Problem**: four recognisable symptoms in the buyer's words.
3. **What we do**: six offerings, each a concrete kind of work.
4. **Examples**: typical first projects, explicitly framed as patterns, not client results.
5. **Detail** (software only): how we build, with the stack and the site itself as evidence.
6. **Approach**: three principles and a candid note (what we won't promise).
7. **How we work**: the shared Discover / Define / Build / Improve, with a line per service.
8. **How projects start**: scoped per project, with scope and cost agreed before work; one CTA into the conversation. There is deliberately no link to /pricing, which sells SEO plans.
9. **FAQs**: five real buying questions (cost, data, risk, scope, fit).
10. **Related insights and services**: two or three articles, two sibling services.
11. **Closing CTA**: service-specific heading and button.
12. **Structured data**: `Service` (provider = the site's Organization, no offers, because nothing is priced) and `BreadcrumbList` (Home › Service).

## Per-page brief

### AI integration
- **Title:** AI Consultancy & Integration for UK SMEs — Chinvat Bridge
- **H1:** AI integration that earns its place in your business
- **Covers:** opportunity finding; tool and model choice; connecting AI to systems; assistants on your own information; guardrails and review; measurement.
- **Differentiator on the page:** "Practical before clever": start from the task, try the simplest option, keep a person where it matters, and no promises not yet measured.
- **Secondary keywords placed:** AI consultancy, AI integration, small businesses, SMEs, AI implementation, LLM (implied by "language models"), workflow, UK GDPR.
- **CTA:** Discuss an AI project.

### Workflow automation
- **Title:** Business Process Automation & Integration — Chinvat Bridge
- **H1:** Workflow automation for the work between your systems
- **Covers:** process mapping; connector platforms (Zapier, Make); custom API integrations; automated reporting; AI steps; alerts, logs and documentation.
- **Differentiator:** "fix the process first", "use what you already pay for", "build for the day it breaks". The last one answers the gap competitors leave around broken automations.
- **CTA:** Describe a process.

### Custom software
- **Title:** Custom Software Development for UK SMEs — Chinvat Bridge
- **H1:** Custom software built around the way your business works
- **Covers:** internal tools; client portals; dashboards; web applications; websites; integration.
- **Differentiator:** the "How we build" section names the stack and offers this site as proof, plus "off-the-shelf first" candour taken from the existing article.
- **CTA:** Describe what you need.

### SEO (existing)
Strong as it stands. Recommended next steps, all owner decisions:
- One price-signal sentence ("Plans start at £299 a month; prices and inclusions on the pricing page").
- Title test: "SEO Services for UK Small Businesses".
- When a fixed-price audit exists, a short section for it and a link to the audit article.

## Copy rules applied

- Nothing that can't be traced to the site, the repo or the existing articles (see the header comment in `src/data/service-pages.ts`).
- No numbers about outcomes. Cost is explained by its drivers, not quoted.
- Examples labelled as patterns. The only named client is the one the homepage already names.
- Platform names only where already used on the site (Zapier, Make).
- British English with curly apostrophes, matching `seo-service.ts`.

## How each page should evolve

| Trigger | Change |
|---|---|
| Owner sets a first-engagement price | Add it to "How projects start" and the FAQ on cost |
| A case study is approved | Replace one "example" with a link to the case study; add a "Recent work" block |
| GSC shows impressions for a sub-topic (e.g. "client portal development") with no matching section | Expand the section; if it grows past about 600 words of distinct content, split it into a child page |
| The owner confirms a platform specialism | Name it in the offerings and FAQs; consider a child page |
| A named person agrees to be shown | Add "Who you'll work with" above the closing CTA |
