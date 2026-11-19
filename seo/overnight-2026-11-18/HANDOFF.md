# Handoff

**Session:** 18 November 2026. **Branch:** `seo/overnight-2026-11-18` (from `main` at `64a4fc0`; `main` is untouched).
**Status:** the research, strategy, technical audit, three service pages, technical fixes, enquiry attribution, nine article drafts and a case study are complete and verified locally. **19 November 2026:** an implementation pass (below) finished the website-side work the strategy calls for. Owner actions are needed before any of it reaches the live site; the infrastructure steps are in the [owner infrastructure checklist](OWNER-INFRASTRUCTURE-CHECKLIST.md).

## Confirmation

No production publication, deployment, GitHub push, email, message or external outreach occurred. No account was created, no form was submitted, and no CMS, database, DNS, hosting, pricing or credential was changed. All research was read-only. Changes are local commits on a new branch, plus documents in this folder.

## 19 November 2026: implementation pass

Commits `5bd0645` (owner-confirmed "Ltd" removal, committed as it stood), `1e8c8b4`, `dfe485a`, `20d596c`, plus the documentation commit. Details in the [implementation log](implementation-log.md#19-nov-2026-implementation-pass); results in [technical verification](technical-verification.md#19-nov-2026-implementation-pass).

**Completed locally**
- **Performance (T10):** the homepage's longest main-thread task was the energy wire's routing. It is now about twice as fast, with byte-identical output (mobile lab, 4× CPU: median TBT 607 → 491 ms, longest task 400 → 241 ms).
- **Service pages:** one distinct name each (AI Integration, Workflow Automation, Custom Software, SEO & Digital Growth) in kicker, breadcrumb, schema and footer, ending the AI/automation overlap. Unconfirmed commitments softened. `/services/seo` titled "SEO Services for UK Small Businesses".
- **/pricing:** title "SEO Packages & Pricing"; a "Billing and terms" summary taken from the terms (monthly billing, tax excluded and added at checkout where relevant, 30 days' notice, no guarantees); links to the three quoted services; breadcrumbs. Prices and plan wording untouched.
- **Articles:** draft-to-draft links can no longer 404 whatever the publishing order (`WhenPublished`). Each service page already lists its drafts and shows them from publication day. A published article's "full technical audit on every tier" claim corrected and its missing service-page link added. Sibling links added. The SEO cost draft follows the terms on tax instead of asserting VAT.
- **Structured data:** breadcrumbs on /pricing and /insights; fuller CollectionPage; articles part of the WebSite; one breadcrumb builder. No ratings, reviews or invented credentials anywhere; no `legalName`.
- **Indexing:** canonical, Open Graph, schema, sitemap and robots all `https://www.chinvatbridge.com` in the build; private routes `noindex`; the duplicate 404 robots tag removed; optional Search Console and Bing meta-tag verification via environment variables.
- **Tests:** all ten drafts guarded; a new check that no sitemap page links to a missing internal page.

**Found while preparing the owner checklist (not changed):** both domains' DNS is on Cloudflare. The `.com` apex already 308-redirects to `www` with the path kept. Both `.uk` hosts still serve the full site. On `.com`, the SPF record authorises only Namecheap's forwarder although Google Workspace receives the mail, and there is no DMARC record. Worth a look for deliverability; see the checklist.

## What I learned about the market

- UK search for AI, automation and custom software is **fragmented**. Head terms are held by directories (Clutch, DesignRush, G-Cloud listings) and by agencies with hundreds of URLs. Below them sit small firms with generic pages, unsourced metrics and self-ranking "best agencies" lists.
- **Small specialists can compete.** A solo consultant's page appears in results for the core business-process-automation query, and a 500-word page with a sharp spreadsheet hook appears for internal tools (the search tool shows presence, not position).
- **The clearest gap:** UK results for replacing spreadsheets with custom software are mostly US low-code vendors, with few UK SME-focused answers.
- **The common trust substitutes** competitors use in place of client logos: a cheap fixed-price first step, ownership/no-lock-in promises, a named niche, or first-hand evidence.
- **Verticals:** automotive dealerships and van hire are owned by DMS and SaaS vendors, so no pages are recommended. Law firms are viable only once the Scornik Gerstein case study exists.
- **Search demand is real but unmeasured.** No volumes could be obtained without a logged-in tool, so all demand evidence is Google autocomplete plus SERP composition. Nothing in this folder claims a search volume.

## Most important SEO findings

1. **Critical:** the site is served on both `www.chinvatbridge.com` and `www.chinvatbridge.uk`, and every canonical, the sitemap and robots point at `.uk`, while the business, its mail and this mission treat `.com` as primary.
2. Three of the four services had **no indexable page**.
3. **No analytics** of any kind, so qualified enquiries can't be traced to pages.
4. The only real client link was **dead** (`scornik.vercel.app` → `DEPLOYMENT_NOT_FOUND`).
5. **No Companies House record** for "Chinvat Bridge", although the footer said "Chinvat Bridge Ltd". Resolved 19 Nov 2026: the business is not a limited company, so "Ltd" was removed from the footer, checkout footer, terms and Organization schema (`legalName` dropped).
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
- **Next.js 16.4.5** (security): clears two moderate advisories; the build no longer stops on them. A separate commit (`08b0c9a`), so it can go to `main` on its own.
- **Drafts in the site, unpublished:** the ten drafts are post modules with `draft: true`. Production never serves them; `pnpm dev` shows them in place. Publishing one is deleting a line and setting its date.
- **Enquiry attribution:** every enquiry email now says which page started the visit, the referring site, and the page read just before contacting. It is held in memory only (no cookies or storage), sanitised on the server, and disclosed in the privacy policy.

## Existing pages optimised

Homepage (title, description, plate links, hero links), `/services/seo` (related services), three articles (internal links), and the footer on every page (discipline links).

## New landing pages

**Built locally:** `/services/ai-integration`, `/services/workflow-automation`, `/services/custom-software`.
**Drafted:** "how we built this site" (case study). **Planned:** Scornik Gerstein case study; a productised first engagement (owner prices it); client portals (later); law-firm page (after the case study); a `/services` hub (low priority).

## Articles fully drafted (not published)

In [editorial/articles](editorial/articles/), with front matter and review notes:
1. Outgrown your spreadsheets? When to replace them with software
2. How much does SEO cost in the UK?
3. How to connect business systems that don’t talk to each other
4. How to choose an AI consultant for a small business
5. What a technical SEO audit should include
6. AI subscriptions or AI integration?
7. How we built our own site, client portal and checkout (case study; every fact checked against the repository)
8. Does your business need a client portal?
9. How to choose a technology partner
10. What the UK's AI adoption figures actually say about small businesses (the link-earning data explainer; every figure checked against ONS and DSIT)

## Backlink and authority opportunities

Client credit from Scornik Gerstein; LinkedIn page; Clutch free profile; Google Business Profile only if the business meets clients in person (Google excludes online-only businesses); SME Today and Small Business UK contributor routes; Featured.com free tier; a data explainer on ONS and DSIT AI-adoption figures. Two outreach drafts are in [backlink opportunities](13-backlink-opportunities.md#drafts-for-owner-approval-not-sent); neither has been sent.

## Tests and verification

**19 Nov 2026:** lint, types and build pass. Full e2e: **287 passed, 1 failed, 99 skipped by design**. The failure is a pre-existing contact-form timing dependency (no mail credentials locally; see [technical verification](technical-verification.md#19-nov-2026-implementation-pass)), and that test passed three times out of three on re-run. The 18 Nov results follow.

- Lint, typecheck and production build pass. Next.js prints a security advisory for 16.4.3 and stops the first build attempt; the re-run completes.
- **Full e2e suite: 283 passed, 0 failed** (378 tests, 95 skipped by the suite's own per-viewport conditions) on desktop, tablet and mobile, after the code-review fixes.
- **Affected specs on the final build: 126 passed, 0 failed.**
- Rendered metadata, canonicals, sitemap, robots and the visual layout were checked on a local production server.
- Every figure and external reference in the drafts was verified against its source.
- **Independent review:** a code review (8 findings, all fixed) and an adversarial content review (4 must-fix and 11 should-fix, all fixed; most could-improve items fixed; the rest are listed with reasons).

See [technical verification](technical-verification.md).

## Files created

`seo/overnight-2026-11-18/`: `00-executive-summary.md`, `01-business-positioning.md`, `02-current-seo-baseline.md`, `03-technical-seo-audit.md`, `04-on-page-audit.md`, `05-keyword-research.csv`, `06-keyword-to-url-map.csv`, `07-competitor-analysis.md`, `08-content-gap-analysis.md`, `09-complete-seo-strategy.md`, `10-90-day-roadmap.md`, `11-service-page-strategy.md`, `12-internal-linking-plan.md`, `13-backlink-opportunities.md`, `14-conversion-optimisation.md`, `15-measurement-framework.md`, `source-register.md`, `implementation-log.md`, `technical-verification.md`, `HANDOFF.md`, `pricing-copy-proposal.md`, `first-engagement-proposal.md`, `measurement-tracker-enquiries.csv`, `measurement-tracker-monthly.csv`, `editorial/README.md`, `editorial/editorial-calendar.csv`, `editorial/scornik-gerstein-case-study-brief.md`, and ten files in `editorial/articles/`.

Code: `src/data/service-pages.ts`, `src/components/services/ServicePage.tsx`, three `page.tsx` routes under `src/app/(pages)/services/`, `tests/e2e/service-pages.spec.ts`, `src/components/site/journey.ts`, `src/components/site/JourneyRecorder.tsx`, `src/lib/enquiry-journey.ts`.

19 Nov: `OWNER-INFRASTRUCTURE-CHECKLIST.md`; `src/components/insights/WhenPublished.tsx`.

## Files modified

`src/lib/constants.ts`, `supabase/config.toml`, `src/actions/enquiry.ts`, `src/app/(pages)/insights/[slug]/page.tsx`, `src/app/sitemap.ts`, `src/components/home/work/projects.ts`, `src/components/site/nav.ts`, `src/components/home/hero/content.ts`, `src/data/services.ts`, `src/data/seo-service.ts`, three files in `src/content/blog/posts/`, `src/components/site/SiteShell.tsx`, `src/components/home/contact/ContactChat.tsx`, `src/app/(pages)/privacy/page.tsx`, `src/lib/legal.ts`, `tests/e2e/{contact,hero,routes,services,work}.spec.ts`, `docs/redesign/COPY_CHANGES.md`.

19 Nov: `src/components/home/services/energy/route.ts`, `src/components/organisms/sections/Pricing.tsx`, `src/app/(pages)/pricing/page.tsx`, `src/app/(pages)/insights/page.tsx`, `src/app/(pages)/insights/[slug]/page.tsx`, `src/app/layout.tsx`, `src/app/not-found.tsx`, `src/components/services/structured-data.tsx`, `src/components/site/nav.ts`, `src/data/service-pages.ts`, `src/data/seo-service.ts`, ten files in `src/content/blog/posts/`, `.env.example`, `tests/e2e/{routes,service-pages}.spec.ts`; in this folder, `HANDOFF.md`, `implementation-log.md`, `technical-verification.md`, `03-technical-seo-audit.md`, `pricing-copy-proposal.md`, `editorial/README.md`.

## Decisions requiring human approval

| Decision | Recommendation | Where |
|---|---|---|
| Canonical domain | `www.chinvatbridge.com`; redirect `.uk` | [T1](03-technical-seo-audit.md#t1-two-live-domains-canonicals-on-the-wrong-one--critical) |
| Service-page commitments to confirm before deploying | Softened on 19 Nov where they were promises (source citations, post-launch measurement, data handling, support). **Still to confirm, as written:** **Automation:** "We build in alerts and logs, and write down how each workflow works"; workflows "fail loudly", failed steps can be retried; Zapier or Make used "where they are reliable enough". **Software:** tested "with them before it replaces anything"; built "in short cycles, shown to you as it takes shape". **AI:** review steps, limits and a record of outputs (the guardrails offering). Already backed by the live site, so not listed: scope and cost agreed first (the terms: other work "quoted and agreed separately"); the Scornik Gerstein credit (homepage Recent work); "based in the UK and work remotely" (footer). | `src/data/service-pages.ts` |
| Analytics vendor | Cookieless (Vercel Web Analytics or Plausible) | [measurement](15-measurement-framework.md#tooling) |
| Privacy-policy line for enquiry attribution (added locally, dated 18 Nov 2026) | Approve or edit: "With a message you send us, the page you were reading, the first page of your visit (including any campaign tags in the link you followed), and the name of the website that referred you, if any, so we know what prompted it. The page keeps this in memory while you browse; nothing is saved to your device." | `src/app/(pages)/privacy/page.tsx` |
| Pricing page copy | The page-level part is done in code (terms summary, service links, title). **Still yours, in the database:** the Starter "Basic" vs "Full technical SEO audit" contradiction; what an "asset" is; the jargon labels ("Core Protocols", "content velocity", "Enterprise-grade"); whether Scale's "Dedicated senior SEO consultant" is literally true. Whether you are VAT-registered (the site says only "applicable tax", as the terms do). Wording and SQL in the proposal; prices unchanged. | [pricing copy proposal](pricing-copy-proposal.md) |
| A productised first engagement | Operations review and/or technical SEO audit, with a published price. Copy, placement, market anchors and suggested price ranges are drafted; set the prices and delivery terms. | [first-engagement proposal](first-engagement-proposal.md) |
| Naming the founder | Yes, with a short bio; also as article author | R12 |
| Homepage H1 | Keep the current line (option A). A descriptive option B was rendered and grows the H1 to four lines; screenshots are in `assets/`. The new title and the lede carry the meaning. | [on-page audit](04-on-page-audit.md#h1-options-for-the-owner) |
| AI-crawler policy on `.com` | Keep search and retrieval agents allowed; decide on training crawlers | [T11](03-technical-seo-audit.md#t11-robots-policy-differs-between-the-domains--medium) |
| Platforms to name | Only those genuinely delivered (n8n? Xero API? HubSpot?) | [positioning](01-business-positioning.md#open-questions-for-the-owner) |
| Case study and footer credit | Ask Scornik Gerstein (draft provided, not sent) | [backlinks](13-backlink-opportunities.md#drafts-for-owner-approval-not-sent) |
| Next.js security upgrade | **Done** on this branch (16.4.5, full suite green); merge with the branch or cherry-pick `08b0c9a` onto `main` first | `package.json` |
| Publishing each article | Review the notes in each file's front matter | [editorial README](editorial/README.md) |

## Outstanding issues

- No Search Console, analytics, keyword-volume or backlink data was available; the baseline numbers must be recorded once access exists.
- The lab-only performance figures need confirming with field data.
- The two concept sites in "Recent work" are clearly labelled as concepts and were left as they are.

## Exact next actions

1. **Read and approve** the service-page copy in `src/data/service-pages.ts` (about 20 minutes), checking the commitments listed above.
2. **Infrastructure, in order:** follow the [owner infrastructure checklist](OWNER-INFRASTRUCTURE-CHECKLIST.md): Supabase URLs, the Vercel variable, deploy, the `.uk` redirect (a Cloudflare redirect rule is the documented path- and query-preserving option), Search Console (sitemap, Change of Address) and Bing. Keep every mail record.
3. **Choose analytics** (enquiry attribution is already built; approve its privacy-policy line).
4. **Fix the /pricing plan wording** in the database (the page-level part is done).
5. **Publish** the spreadsheet article, then the SEO cost guide: read them under `pnpm dev`, then delete `draft: true` (process in the [editorial README](editorial/README.md#publishing-an-article-when-approved)).
6. **Ask Scornik Gerstein** about the case study and credit.

## Continuation point

If work resumes in a new session: start from the [90-day roadmap](10-90-day-roadmap.md). Enquiry attribution and the "how we built this site" case study are done. Remaining work waits on the owner decisions above; the next writing task after approvals is the Scornik Gerstein case study, using the [brief](editorial/scornik-gerstein-case-study-brief.md).
