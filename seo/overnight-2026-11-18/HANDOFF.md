# Handoff

**Session:** 18 November 2026. **Branch:** `seo/overnight-2026-11-18` (from `main` at `64a4fc0`; `main` is untouched).
**Status:** the research, strategy, technical audit, three service pages, technical fixes and six article drafts are complete and verified locally. Owner actions, listed below, are needed before any of it reaches the live site.

## Confirmation

No production publication, deployment, GitHub push, email, message or external outreach occurred. No account was created, no form was submitted, and no CMS, database, DNS, hosting, pricing or credential was changed. All research was read-only. Changes are local commits on a new branch, plus documents in this folder.

## What I learned about the market

- UK search for AI, automation and custom software is **fragmented**. Head terms are held by directories (Clutch, DesignRush, G-Cloud listings) and by agencies with hundreds of URLs. Below them sit small firms with generic pages, unsourced metrics and self-ranking "best agencies" lists.
- **Small specialists can rank.** A solo consultant's page ranks for the core business-process-automation query, and a 500-word page with a sharp spreadsheet hook ranks for internal tools.
- **The clearest gap:** UK results for replacing spreadsheets with custom software are US low-code vendors, with no UK SME answer.
- **The common trust substitutes** competitors use in place of client logos: a cheap fixed-price first step, ownership/no-lock-in promises, a named niche, or first-hand evidence.
- **Verticals:** automotive dealerships and van hire are owned by DMS and SaaS vendors, so no pages are recommended. Law firms are viable only once the Scornik Gerstein case study exists.
- **Search demand is real but unmeasured.** No volumes could be obtained without a logged-in tool, so all demand evidence is Google autocomplete plus SERP composition. Nothing in this folder claims a search volume.

## Most important SEO findings

1. **Critical:** the site is served on both `www.chinvatbridge.com` and `www.chinvatbridge.uk`, and every canonical, the sitemap and robots point at `.uk`, while the business, its mail and this mission treat `.com` as primary.
2. Three of the four services had **no indexable page**.
3. **No analytics** of any kind, so qualified enquiries can't be traced to pages.
4. The only real client link was **dead** (`scornik.vercel.app` → `DEPLOYMENT_NOT_FOUND`).
5. **No Companies House record** for "Chinvat Bridge", although the footer says "Chinvat Bridge Ltd"; there is no company number or registered office on the site.
6. The homepage title led with a brand name whose search results are entirely Zoroastrian mythology.
7. Technical hygiene is otherwise good: clean metadata, correct noindex on private pages, real sitemap dates, LCP and CLS within thresholds. The homepage carries about 1.7 s of mobile main-thread work in lab tests.

Details: [technical audit](03-technical-seo-audit.md), [baseline](02-current-seo-baseline.md).

## Highest-value commercial keyword opportunities

AI consultancy for small businesses (UK); business process automation consultant UK; workflow automation services; bespoke or custom software for small business; replace spreadsheets with software; client portal development; how much does SEO cost UK; SEO packages UK; technical SEO audit. See [keyword research](05-keyword-research.csv) (79 rows) and the [URL map](06-keyword-to-url-map.csv).

## Competitor insights

Softomate (price-led, sprawling), Whitehat (pillar and cluster, high prices), Cloudswitched (breadth without proof), Digital Adaption (a solo consultant that ranks), Slink (short page, sharp hook), and Campbell Consultancy (the most similar profile: £450 audit, no lock-in). See [competitor analysis](07-competitor-analysis.md).

## Completed strategy

[Complete strategy](09-complete-seo-strategy.md) with 20 prioritised recommendations, a [90-day roadmap](10-90-day-roadmap.md), [service-page strategy](11-service-page-strategy.md), [internal linking](12-internal-linking-plan.md), [backlinks](13-backlink-opportunities.md), [conversion](14-conversion-optimisation.md), [measurement](15-measurement-framework.md), [positioning](01-business-positioning.md), [content gaps](08-content-gap-analysis.md), [on-page audit](04-on-page-audit.md) and a [source register](source-register.md).

## Technical improvements implemented (local)

- `.com` canonical fallback; Supabase auth URLs (`.uk` kept for the switch-over); enquiry email footer.
- Homepage title and meta description.
- Article structured data linked to the Organization, with image; breadcrumbs from Home.
- Scornik Gerstein link → `https://www.scornik.com/`.
- Sitemap includes the new service pages with their own dates.

## Existing pages optimised

Homepage (title, description, plate links, hero links), `/services/seo` (related services), three articles (internal links), and the footer on every page (discipline links).

## New landing pages

**Built locally:** `/services/ai-integration`, `/services/workflow-automation`, `/services/custom-software`.
**Planned:** Scornik Gerstein case study; "how we built this site"; a productised first engagement (owner prices it); client portals (later); law-firm page (after the case study); a `/services` hub (low priority).

## Articles fully drafted (not published)

In [editorial/articles](editorial/articles/), with front matter and review notes:
1. Outgrown your spreadsheets? When to replace them with software
2. How much does SEO cost in the UK?
3. How to connect business systems that don’t talk to each other
4. How to choose an AI consultant for a small business
5. What a technical SEO audit should include
6. AI subscriptions or AI integration?

## Backlink and authority opportunities

Client credit from Scornik Gerstein; Google Business Profile; LinkedIn page; Clutch free profile; SME Today and Small Business UK contributor routes; Featured.com free tier; an original-data explainer on ONS and DSIT AI-adoption figures. Two outreach drafts are in [backlink opportunities](13-backlink-opportunities.md#drafts-for-owner-approval-not-sent); neither has been sent.

## Tests and verification

Lint pass; typecheck pass; production build pass (Next.js prints a security advisory for 16.4.3); **e2e 280 passed / 0 failed / 95 skipped by design** on desktop, tablet and mobile; rendered metadata, sitemap, robots and visual layout checked; all article references and quoted figures verified against their sources. See [technical verification](technical-verification.md).

## Files created

`seo/overnight-2026-11-18/`: `00-executive-summary.md`, `01-business-positioning.md`, `02-current-seo-baseline.md`, `03-technical-seo-audit.md`, `04-on-page-audit.md`, `05-keyword-research.csv`, `06-keyword-to-url-map.csv`, `07-competitor-analysis.md`, `08-content-gap-analysis.md`, `09-complete-seo-strategy.md`, `10-90-day-roadmap.md`, `11-service-page-strategy.md`, `12-internal-linking-plan.md`, `13-backlink-opportunities.md`, `14-conversion-optimisation.md`, `15-measurement-framework.md`, `source-register.md`, `implementation-log.md`, `technical-verification.md`, `HANDOFF.md`, `editorial/README.md`, `editorial/editorial-calendar.csv`, and six files in `editorial/articles/`.

Code: `src/data/service-pages.ts`, `src/components/services/ServicePage.tsx`, three `page.tsx` routes under `src/app/(pages)/services/`, `tests/e2e/service-pages.spec.ts`.

## Files modified

`src/lib/constants.ts`, `supabase/config.toml`, `src/actions/enquiry.ts`, `src/app/(pages)/insights/[slug]/page.tsx`, `src/app/sitemap.ts`, `src/components/home/work/projects.ts`, `src/components/site/nav.ts`, `src/components/home/hero/content.ts`, `src/data/services.ts`, `src/data/seo-service.ts`, three files in `src/content/blog/posts/`, `tests/e2e/{hero,routes,services,work}.spec.ts`, `docs/redesign/COPY_CHANGES.md`.

## Decisions requiring human approval

| Decision | Recommendation | Where |
|---|---|---|
| Canonical domain | `www.chinvatbridge.com`; redirect `.uk` | [T1](03-technical-seo-audit.md#t1-two-live-domains-canonicals-on-the-wrong-one--critical) |
| Legal entity on the site | Confirm the registered name and number; show the number and registered office; drop "Ltd" if not incorporated | [T5](03-technical-seo-audit.md#t5-company-identity-is-not-verifiable--high-trust-and-compliance) |
| Service-page claims to confirm before deploying | (a) "scope and cost are agreed before any work starts" for AI, automation and software; (b) automation: "we build in alerts and logs, and write down how each workflow works"; (c) software: support "agreed before the build begins, whether we support it or your own team"; (d) software: "We also designed and built the website of Scornik Gerstein LLP"; (e) "we use Zapier or Make where they fit"; (f) "We’re based in the UK and work remotely with businesses elsewhere" (AI FAQ) | `src/data/service-pages.ts` |
| Analytics vendor and privacy wording | Cookieless (Vercel Web Analytics or Plausible), plus enquiry landing-page capture | [measurement](15-measurement-framework.md#tooling) |
| Pricing page copy | Fix the Starter "Basic" vs "Full" audit contradiction; define "asset"; state VAT; drop jargon | [on-page audit](04-on-page-audit.md#pricing) |
| A productised first engagement | Operations review and/or technical SEO audit, with a published price | [strategy R11](09-complete-seo-strategy.md#recommendations) |
| Naming the founder | Yes, with a short bio; also as article author | R12 |
| Homepage H1 | Option B ("Cross the bridge." / "Practical AI and software for your business.") | [on-page audit](04-on-page-audit.md#h1-options-for-the-owner) |
| AI-crawler policy on `.com` | Keep search and retrieval agents allowed; decide on training crawlers | [T11](03-technical-seo-audit.md#t11-robots-policy-differs-between-the-domains--medium) |
| Platforms to name | Only those genuinely delivered (n8n? Xero API? HubSpot?) | [positioning](01-business-positioning.md#open-questions-for-the-owner) |
| Case study and footer credit | Ask Scornik Gerstein (draft provided, not sent) | [backlinks](13-backlink-opportunities.md#drafts-for-owner-approval-not-sent) |
| Next.js security upgrade | Run it as a separate, tested change | Build output |
| Publishing each article | Review the notes in each file's front matter | [editorial README](editorial/README.md) |

## Outstanding issues

- No Search Console, analytics, keyword-volume or backlink data was available; the baseline numbers must be recorded once access exists.
- The lab-only performance figures need confirming with field data.
- The two concept sites in "Recent work" are clearly labelled as concepts and were left as they are.

## Exact next actions

1. **Read and approve** the service-page copy in `src/data/service-pages.ts` (about 15 minutes), checking the six claims listed above.
2. **Supabase:** Site URL → `https://www.chinvatbridge.com`; add `https://www.chinvatbridge.com/**` to the redirect URLs.
3. **Vercel:** set `NEXT_PUBLIC_SITE_URL=https://www.chinvatbridge.com` for Production; merge `seo/overnight-2026-11-18` into `main`; deploy.
4. **Redirect** `chinvatbridge.uk` and `www.chinvatbridge.uk` to `https://www.chinvatbridge.com` (path-preserving 301/308) in Vercel or Cloudflare.
5. **Search Console:** Domain property for `chinvatbridge.com`; Change of Address from `.uk` if it was verified; submit the sitemap; request indexing of the four service pages. Bing Webmaster Tools too.
6. **Confirm the company details** and add them to the footer.
7. **Choose analytics**, then have the enquiry landing-page capture added.
8. **Fix the /pricing wording.**
9. **Publish** the spreadsheet article, then the SEO cost guide (process in the [editorial README](editorial/README.md#publishing-an-article-when-approved)).
10. **Ask Scornik Gerstein** about the case study and credit.

## Continuation point

If work resumes in a new session: start from the [90-day roadmap](10-90-day-roadmap.md). The next technical task with the most value that needs no owner decision is the **enquiry landing-page and referrer capture** described in [conversion optimisation](14-conversion-optimisation.md#current-journey), implemented in `src/components/home/contact/ContactChat.tsx` and `src/actions/enquiry.ts`, with a privacy-policy sentence drafted for approval. After that comes the **"how we built this site" case study**, whose facts are all in this repository's history.
