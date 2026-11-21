# SEO 90-day execution plan

**Prepared:** 21 November 2026. **Replaces:** `seo/overnight-2026-11-18/10-90-day-roadmap.md` (kept as history).
**Day 1** is the day the migration items (M1–M3 in `SEO_REMEDIATION_REGISTER.md`) are done and this branch is approved for deployment.

**Goal:** qualified B2B enquiries from organic search for AI Integration, Workflow Automation, Custom Software and SEO. Traffic and article counts are supporting signals only.

**No rankings or traffic figures are promised.** There is no baseline; targets are set on day 30 from the first month of `.com` data.

**Who does what:**
- **Owner:** decisions, account access and anything public: Cloudflare, Stripe, Supabase, Vercel, Search Console, publishing approval, outreach.
- **Claude:** code, analysis and drafts on a branch. Nothing is pushed, deployed, sent or published without the owner's approval.

**Effort:** S is under 2 hours; M is half a day to 2 days; L is more than 2 days.

## Before day 1 (this week)

| Task | Who | Effort | Dependency | Business impact | Done when |
|---|---|---|---|---|---|
| Fix the Cloudflare `.uk` redirect (M1) | Owner | S | — | Restores campaign tags and old links; unblocks Change of Address | `pnpm seo:check-migration` all pass |
| Check the Stripe webhook URL and resend failed events (M2) | Owner | S | — | Paying customers get accounts (revenue-critical, not SEO) | Endpoint on `.com`; no failed deliveries |
| Check the Supabase Site URL and allow-list; test a sign-in (M3) | Owner | S | — | Sign-in works | Magic link signs you in on `.com` |
| Search Console exports or read-only access (M4) | Owner | S | — | Everything measurable depends on it | Baseline tables filled |
| Decide the /pricing facts (T1) and approve the SQL | Owner | S | — | Removes the contradiction on the two highest-intent SEO pages | Live /pricing has no "assets", no Basic/Full clash |
| Confirm the six commitments and the privacy line (T3, T4) | Owner | S | — | Pages promise only what is delivered | Recorded in the register |
| Review and approve this branch for deployment | Owner | S | The above, ideally | Titles, attribution fix, ICO source, working test suite | Pushed by you, or by me with your approval |

## Days 1–30: foundations and measurement

| Task | Who | Effort | Dependency | Impact | Measure |
|---|---|---|---|---|---|
| Change of Address `.uk` → `.com` | Owner | S | M1 passing; both properties owned | Consolidates signals onto `.com` | `.uk` URLs "Page with redirect" in Search Console |
| Submit the sitemap; inspect the 16 URLs; request indexing for `/` and the four service pages | Owner, with Claude reading the results | S | M4 | Faster discovery of the new pages | Indexed count, per URL |
| Record the baseline with `gsc-summary.py`, per property and period | Claude | S | M4 exports | Turns guesses into numbers | `SEO_MEASUREMENT_BASELINE.md` filled |
| Install Plausible (or the chosen tool) behind an env var; add the privacy line | Claude codes; owner approves cost and wording, activates | S | S1 approval | Landing pages and campaigns become visible | First week of data |
| One test enquiry on production | Owner approves, then sends or watches | S | Deploy | Proves the attribution email works end to end | Email shows the "First page" line |
| Keyword Planner volumes for the 79 keywords; re-rank | Owner creates or grants Ads access; Claude re-ranks | M | Ads account | Effort goes where demand is | `SEO_KEYWORD_STRATEGY_UPDATED.md` gets measured volumes |
| Align the SEO cost guide's plan paragraph with the new /pricing unit; add the unit line under the plans (`Pricing.tsx`) | Claude | S | T1 facts | Article and pricing agree | Both read the same unit |
| Rich Results Test on one service page and one article | Owner (manual tool) | S | Deploy | Confirms the structured data reads correctly | No errors |
| LinkedIn: confirm or create the company page; then `sameAs` | Owner; Claude adds `sameAs` | S | A1 | Brand disambiguation (the name's search results are mythology) | Page exists; `sameAs` live |
| **Day 30 review** | Both | S | Data | Set the first real targets | Targets written into the baseline |

## Days 31–60: proof and conversion

| Task | Who | Effort | Dependency | Impact | Measure |
|---|---|---|---|---|---|
| Publish "How we built our own site, client portal and checkout" | Owner approves; Claude publishes on a branch | S | Owner read | Proof for custom software *and* technical SEO; no client permission needed | Impressions; visits from the software page |
| Ask Scornik Gerstein about a case study and a "Website by" credit | Owner (draft email exists) | S | — | The only real client proof, and a relevant link | Answer recorded |
| Decide on a fixed-price first step (operations review and/or technical SEO audit) | Owner | M | — | A low-risk way in for buyers with little proof to go on | Offer on the service pages |
| Name the founder, with a short bio and as article author (if agreed) | Owner decides; Claude implements | S | A4 | E-E-A-T; trust | Live |
| Publish "How to connect business systems that don't talk to each other" | Owner approves | S | Owner read; ideally K1 shows demand | Supports the strongest cluster (workflow automation) | Impressions for the cluster |
| B2B refresh of "Why your website isn't bringing you enough customers", with a shorter `seoTitle` (C4) | Claude drafts; owner approves | M | — | Fixes the intent mismatch on the SEO cluster's oldest article | CTR, from the baseline |
| **Day 60 review:** pages with impressions but CTR under 1% get title and description rewrites; queries in positions 8–20 get content strengthened | Claude proposes; owner approves | M | Data | Acts on what Google already shows | Before/after CTR, same-length periods |

## Days 61–90: authority and refinement

| Task | Who | Effort | Dependency | Impact | Measure |
|---|---|---|---|---|---|
| Publish "What a technical SEO audit should include" | Owner approves | S | Redirect fixed (the article mentions consolidation) | Supports technical SEO, the prioritised SEO angle | Impressions |
| Publish the Scornik Gerstein case study (if permitted) | Claude drafts; client and owner approve | M | Permission | Proof; unlocks the law-firm keywords | Live; referring domain if credited |
| Publish "Does your business need a client portal?" | Owner approves | S | After "How we built…", which gives the portal example the draft asked for | Custom-software cluster | Impressions |
| Clutch free profile; ask the first clients for reviews | Owner | S | A client willing | Third-party trust; directory visibility | Reviews count |
| Data explainer on the UK AI-adoption figures: re-check against the **latest** ONS and DSIT releases, then publish and pitch | Claude re-checks; owner approves and pitches | M | Figures re-verified that day | The one link-earning asset | Referring domains (Search Console → Links) |
| Decide on the design-study routes and the `/services` hub (X6, X7) | Owner | S | — | Tidiness | — |
| Field Core Web Vitals check; act only if p75 mobile INP > 200 ms | Claude | M | Search Console CWV data | Avoids unmeasured performance work | INP p75 |
| **Day 90 review:** enquiries by landing page; what earned impressions; next quarter's clusters | Both | M | Data | Next plan grounded in data | Written review |

## Content priorities and assessment

**Published (7).**
- Every outbound link returns 200 (21 Nov).
- The four September articles and the brand article were reviewed in the 18 Nov programme. Their only open issue is the intent mismatch in the website article (C4).
- The spreadsheets article now cites its UK GDPR source (C1).
- The SEO cost guide is accurate apart from the volume-versus-price contradiction with /pricing (T2).

**Drafts, in recommended publishing order.** Each needs your read first; nothing publishes automatically.

| Order | Draft | Supports | Gate | Why this position |
|---|---|---|---|---|
| First | `how-we-built-this-site` | Custom software, SEO | None besides your read | Proof without needing anyone's permission; every fact is from the repository |
| Second | `how-to-connect-business-systems` | Workflow automation | Your read; ideally a K1 demand check (its phrase was never tested) | Strongest cluster; core positioning |
| Third | `what-a-technical-seo-audit-should-include` | SEO | M1 fixed | Technical SEO is where the site is its own proof |
| Fourth | `does-your-business-need-a-client-portal` | Custom software | After the first, which supplies the portal example | — |
| Fifth | `how-to-choose-an-ai-consultant` | AI integration | Re-check ONS/DSIT; have a demo to show (the article tells readers to ask for one) | Decision-stage; needs proof first |
| Sixth | `ai-subscriptions-vs-ai-integration` | AI integration | Your read; demand check (phrasing untested) | — |
| Seventh | `how-to-choose-a-technology-partner` | All | Your ownership and handover answers | Needs business decisions |
| Eighth | `uk-small-business-ai-adoption-2026` | AI (links) | Re-verify every figure against the latest releases | Link-earning; figures date fastest |

**Not started:** the Scornik Gerstein case study (permission); "Zapier, Make or a custom integration?" (only for platforms genuinely delivered); "What custom software costs in the UK" (only if you'll publish ranges).

## Technical priorities

- Fix the redirect (M1).
- Change of Address.
- Run `pnpm seo:check-migration` and `pnpm seo:crawl` monthly and before each deploy.
- Run the Rich Results Test once after deploy.
- No speculative performance work; act only on field data.

## Authority priorities

In order, and nothing bought or automated:
- LinkedIn page, then `sameAs`.
- Scornik credit and case study.
- Clutch profile and reviews.
- Data explainer and contributor pitches (SME Today, Small Business UK).

Google Business Profile only if you meet clients in person. No directory submissions beyond these, and no unverified profiles in structured data.
