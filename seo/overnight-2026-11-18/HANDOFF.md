# Handoff

**Session:** 18 November 2026. **Branch:** `seo/overnight-2026-11-18` (from `main` at `64a4fc0`; `main` is untouched).
**Status:** the research, strategy, technical audit, three service pages, technical fixes, enquiry attribution, nine article drafts and a case study are complete and verified locally. **19 November 2026:** an implementation pass (below) finished the website-side work the strategy calls for. Owner actions are needed before any of it reaches the live site; the infrastructure steps are in the [owner infrastructure checklist](OWNER-INFRASTRUCTURE-CHECKLIST.md). **19 November 2026, evening:** an independent [pre-deployment audit](#19-november-2026-pre-deployment-audit) found the branch ready to merge once the copy is approved, and fixed one regression (the 404 robots tag).

## Confirmation

No production publication, deployment, GitHub push, email, message or external outreach occurred. No account was created, no form was submitted, and no CMS, database, DNS, hosting, pricing or credential was changed. All research was read-only. Changes are local commits on a new branch, plus documents in this folder.

## The live site now (re-verified 19 Nov 2026, 18:06 UTC)

At 10:45 UTC the `.uk` redirect dropped the query string while production still used `.uk` as its own address, which very likely broke sign-in and the page after checkout. The owner has since reported doing all three urgent fixes. What can be seen from outside (read-only):

| Item | Status | Evidence |
|---|---|---|
| Vercel `NEXT_PUBLIC_SITE_URL` (Production) and redeploy | **Done and in effect** | Live `https://www.chinvatbridge.com/` (still `main`'s code) has canonical and `og:url` `https://www.chinvatbridge.com`; robots and the sitemap name only `.com` URLs |
| Supabase Site URL and `.com` redirect allowlist | **Reported done; not verifiable from outside** without sending a sign-in email | Sign in once at `/login` after the deploy ([checklist](OWNER-INFRASTRUCTURE-CHECKLIST.md#1-supabase-site-url-and-redirect-urls), step 5) |
| Cloudflare "Preserve query string" on the `.uk` redirect | **Reported on, but not in effect.** Both `.uk` hosts still 301 to the right `.com` path without the query | `https://www.chinvatbridge.uk/auth/callback?code=TEST…` → `https://www.chinvatbridge.com/auth/callback` at 17:54 and 18:06 UTC, answered by Cloudflare with no cache headers |

Production now builds sign-in links and Stripe returns on `.com`, so new sign-ins and checkouts no longer pass through the `.uk` redirect. The lost query now affects older `.uk` links that carry parameters (campaign tags, shared links). Fix it before the Search Console Change of Address: in the `chinvatbridge.uk` zone, check that the rule's "Preserve query string" is saved and deployed, and that no other rule (another redirect rule, a Page Rule or a Bulk Redirect) answers first.

**Check the Stripe dashboard today:** the webhook endpoint must be `https://www.chinvatbridge.com/api/webhooks/stripe`. If it still names `.uk`, every delivery since the redirect went live got a 301, which Stripe treats as a failed delivery, and this webhook is what provisions a paying customer's account. Resend any failed events from the dashboard.

Re-checked at 17:54 UTC: `.com` apex → `www` (308, path and query kept, by Vercel); `http` → `https`; `www.chinvatbridge.com` served by Vercel with HSTS. From the 10:45 check: no website DNS change needed; mail records unchanged.

## 19 November 2026: pre-deployment audit

An independent review of the whole branch (`main...0b4dd43`, 21 commits) before merging, with a read-only check of the live domains. Details in [technical verification](technical-verification.md#19-nov-2026-pre-deployment-audit).

**Ready to merge** once the owner approves the copy listed under [decisions](#decisions-requiring-human-approval): the service-page commitments and the privacy-policy line. Nothing else found needs a code change.

**Fixed: the 404 robots tag.** The implementation pass (`20d596c`) removed the not-found page's own `robots`, reasoning that Next.js already marks 404s `noindex`. Without it the page inherited the root layout's `index, follow`, so every 404, draft URLs included, carried two contradictory tags: `noindex` and `index, follow`. The practical effect was small (a 404 status is never indexed, and Google applies the more restrictive directive), but the earlier note that the 404 "now carries one robots tag" was wrong. `robots: { index: false, follow: false }` is restored in `src/app/not-found.tsx`. 404s now carry `noindex` and `noindex, nofollow`, which agree, as on `main`.

**Confirmed:**
- No secrets, env files, deletions or stray files in the diff.
- Every canonical, `og:url`, structured-data URL, sitemap entry and robots line in the build is `https://www.chinvatbridge.com`; there is no `.uk` string in the build output.
- The four service pages are indexable, distinctly named, and name no country in their titles.
- All ten drafts 404 in production and are absent from the sitemap, Insights and the homepage.
- Sign-in and Stripe return URLs follow `NEXT_PUBLIC_SITE_URL` in production.
- Lint, typecheck, build, the focused tests and `pnpm audit --prod` pass.

**Commits to merge:** all 22 on the branch, from `445b617` to this audit's commit, onto `main` at `64a4fc0`. `main` is unchanged locally and on GitHub, so a fast-forward is possible. The branch has not been pushed.

**Left as they are, for the owner:**
- Three published articles (already on `main`) whose descriptions still address UK businesses specifically ("small UK businesses", "a UK small business website", "mid-sized UK businesses"); `/insights` shows them too.
- `docs/redesign/COPY_CHANGES.md` still lists the superseded "for UK SMEs" title, and the [implementation log](implementation-log.md) still records the 404 robots removal as a fix.
- The [owner checklist](OWNER-INFRASTRUCTURE-CHECKLIST.md)'s "Status at a glance" describes the 10:45 state; the current state is in [the live site now](#the-live-site-now-re-verified-19-nov-2026-1806-utc).
- The local `.env.local` still sets `NEXT_PUBLIC_SITE_URL=https://www.chinvatbridge.uk`, so a local build without an override emits `.uk` URLs. Production is unaffected.

## 19 November 2026: final focused review

**International positioning.** Chinvat Bridge is UK-based and serves clients internationally, so titles now name the buyer, not a country, and "UK-based" stays as a fact in descriptions:

| Page | Title before → after |
|---|---|
| Home | AI, Automation & Custom Software for ~~UK~~ SMEs |
| AI integration | AI Consultancy & Integration for ~~UK~~ SMEs |
| Custom software | Custom Software Development for ~~UK~~ SMEs |
| SEO | SEO Services for ~~UK~~ Small Businesses |

Descriptions for home, the four service pages, /pricing ("prices in pounds") and /insights no longer say "UK small businesses". The data-protection copy keeps UK GDPR and adds "or the law that applies where you are". **Kept as genuine UK opportunities or facts:** "UK-based" and "UK Based // Working Globally"; the FAQ "Do you work with businesses outside the UK?"; the UK-specific articles (UK SEO cost, ONS and DSIT figures), which target real UK searches; `en-GB`; prices in pounds. No country pages were created, per the [strategy](09-complete-seo-strategy.md#international-expansion-opportunities): revisit when Search Console shows demand from one country. The [keyword map](06-keyword-to-url-map.csv) still lists the earlier UK title proposals; the titles above supersede them.

**Contact-form test stability.** Root cause: the suite runs against a production build with no mail credentials. The enquiry action treats a send within three seconds of the conversation opening as a bot and quietly returns "sent"; anything slower reaches the mail step and returns "unavailable". So the tests passed only by being mistaken for bots. A second hidden coupling: every send shared one rate-limit bucket (five per ten minutes). Fixed in the spec only, with Playwright's clock, routing and headers (production behaviour unchanged):
- `page.clock.fastForward(3_000)` before each send, so the real server path always runs (validation, rate limit, composing the email);
- only the "no mail transport" outcome is replaced with "sent", and any other result still fails the test;
- each test sends from its own IPv6 documentation-range address, with a random segment per run. A first version numbered addresses from 1 on every run; a full run straight after a repeat run, on the same server, reused addresses the limiter still remembered and three tests correctly failed as "limited". That is why the addresses are now unique per run.

Probed: with the fast-forward the raw action response is `unavailable` (then stubbed); without it, the bot branch answers `sent`. Contact spec with `--repeat-each 5`: 135 passed, 0 failed.

**Test status (actual).** Final production build passes; lint and typecheck pass. Last complete e2e run (after the contact fix, same long-lived server): **287 passed, 1 failed, 99 skipped by design**. Every contact test passed. The one failure was the homepage test "the energy wire reveals the plates in order and ends on Improve" (desktop), which timed out at 60 s. **Cause, from its Playwright trace:** the test scrolls the homepage in 27 steps, and each step's `page.evaluate` waits 0.3–7 s for a main thread busy rendering WebGL in software (headless Chromium has no GPU). The test normally takes 48–57 s, so it sits at the edge of the 60 s default; every failure was a timeout in the scroll loop, never a wrong order. In isolation it passed 6 times out of 8 before the fix. **Fix (test only):** `test.slow()` for this test, with the evidence in a comment. **Run once after the fix: passed (54.1 s).** The complete suite was not re-run after this last change, at the owner's request; the next full run will confirm it. A broader question for the separate test-strategy review: the suite takes about 20 minutes serially, mostly on software WebGL.

**Domain consistency.** The checklist was reconciled with what is live (table above): apex `.com` now goes to Vercel directly; the `.uk` redirect exists but needs "Preserve query string"; Vercel's dashboard state (whether the `.uk` domains are still listed, "Valid Configuration") can't be seen from outside and is listed for the owner to check.

## 19 November 2026: implementation pass

Commits `5bd0645` (owner-confirmed "Ltd" removal, committed as it stood), `1e8c8b4`, `dfe485a`, `20d596c`, plus the documentation commit. Details in the [implementation log](implementation-log.md#19-nov-2026-implementation-pass); results in [technical verification](technical-verification.md#19-nov-2026-implementation-pass).

**Completed locally**
- **Performance (T10):** the homepage's longest main-thread task was the energy wire's routing. It is now about twice as fast, with byte-identical output (mobile lab, 4× CPU: median TBT 607 → 491 ms, longest task 400 → 241 ms).
- **Service pages:** one distinct name each (AI Integration, Workflow Automation, Custom Software, SEO & Digital Growth) in kicker, breadcrumb, schema and footer, ending the AI/automation overlap. Unconfirmed commitments softened. `/services/seo` titled "SEO Services for UK Small Businesses".
- **/pricing:** title "SEO Packages & Pricing"; a "Billing and terms" summary taken from the terms (monthly billing, tax excluded and added at checkout where relevant, 30 days' notice, no guarantees); links to the three quoted services; breadcrumbs. Prices and plan wording untouched.
- **Articles:** draft-to-draft links can no longer 404 whatever the publishing order (`WhenPublished`). Each service page already lists its drafts and shows them from publication day. A published article's "full technical audit on every tier" claim corrected and its missing service-page link added. Sibling links added. The SEO cost draft follows the terms on tax instead of asserting VAT.
- **Structured data:** breadcrumbs on /pricing and /insights; fuller CollectionPage; articles part of the WebSite; one breadcrumb builder. No ratings, reviews or invented credentials anywhere; no `legalName`.
- **Indexing:** canonical, Open Graph, schema, sitemap and robots all `https://www.chinvatbridge.com` in the build; private routes `noindex`; the 404's own robots tag removed (a mistake: it made 404s inherit `index, follow`; restored in the [pre-deployment audit](#19-november-2026-pre-deployment-audit)); optional Search Console and Bing meta-tag verification via environment variables.
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

**19 Nov 2026, pre-deployment audit:** lint, types and build pass; the focused specs (`routes`, `service-pages`, `services`, `insights`, `hero`, `work`, `contact`) 159 passed, 0 failed, 75 skipped by design; the energy-wire test passed on all three viewports. After the 404 fix: lint, types and build pass, and `routes` 33 passed, 0 failed, 66 skipped by design. The full suite was not re-run. Details in [technical verification](technical-verification.md#19-nov-2026-pre-deployment-audit).

**19 Nov 2026, final:** lint, types and build pass. The contact-form timing dependency is fixed in the spec. The last complete run: 287 passed, 1 failed (the energy-wire test timing out, since given `test.slow()`; it passed when run once afterwards), 99 skipped by design. Details in the [final focused review](#19-november-2026-final-focused-review). Earlier results follow.

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

19 Nov, pre-deployment audit: `src/app/not-found.tsx` (robots restored); in this folder, `HANDOFF.md`, `technical-verification.md`.

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

1. **Today:** see [the live site now](#the-live-site-now-re-verified-19-nov-2026-1806-utc). The Vercel variable is in effect and Supabase is reported done. Cloudflare's "Preserve query string" is not yet in effect, so check the rule. Check that the Stripe webhook endpoint is on `.com`.
2. **Read and approve** the service-page copy in `src/data/service-pages.ts` (about 20 minutes), checking the commitments listed above. Then merge the branch and deploy, and work through the rest of the [owner infrastructure checklist](OWNER-INFRASTRUCTURE-CHECKLIST.md): Vercel domains, Search Console (sitemap, Change of Address) and Bing. Keep every mail record.
3. **Choose analytics** (enquiry attribution is already built; approve its privacy-policy line).
4. **Fix the /pricing plan wording** in the database (the page-level part is done).
5. **Publish** the spreadsheet article, then the SEO cost guide: read them under `pnpm dev`, then delete `draft: true` (process in the [editorial README](editorial/README.md#publishing-an-article-when-approved)).
6. **Ask Scornik Gerstein** about the case study and credit.

## Continuation point

If work resumes in a new session: start from the [90-day roadmap](10-90-day-roadmap.md). Enquiry attribution and the "how we built this site" case study are done. Remaining work waits on the owner decisions above; the next writing task after approvals is the Scornik Gerstein case study, using the [brief](editorial/scornik-gerstein-case-study-brief.md).
