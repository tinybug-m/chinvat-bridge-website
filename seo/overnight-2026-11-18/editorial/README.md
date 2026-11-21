# Editorial

Nine full article drafts and one case study, written for owner review. **One is published** (20 Nov 2026: the spreadsheets article). The SEO cost guide was published the same day and returned to draft on 21 Nov until /pricing defines its content unit; it and the other eight keep `draft: true`. Current status and publishing order: `seo/remediation-2026-11-21/SEO_90_DAY_EXECUTION_PLAN.md`.

Each exists twice:
- **Here, as Markdown:** the brief. Its front matter holds the keyword, audience, purpose, internal links and the review notes to check before publishing.
- **In the site, as a draft post:** `src/content/blog/posts/<slug>.tsx`, registered in `index.ts` with `draft: true`. Drafts are never built or served in production (an e2e test checks that they 404 and stay out of the sitemap and the Insights index). Under `pnpm dev` they appear in place, at `/insights/<slug>`, labelled "Draft, not published", so you can read them exactly as they will look.

Edit the `.tsx` file when changing wording; it is the version that will be published. The Markdown was converted once with a script, so later edits are not synced back.

## The drafts

| Article | Cluster → service page | Stage | Words | Publish order |
|---|---|---|---|---|
| [Outgrown your spreadsheets? When to replace them with software](articles/replace-spreadsheets-with-custom-software.md) | Software → /services/custom-software | Problem-aware | ~1,650 | First: the clearest UK search gap |
| [How much does SEO cost in the UK?](articles/how-much-does-seo-cost-uk.md) | SEO → /services/seo, /pricing | Investigation | ~1,450 | Second, after the /pricing fixes |
| [How to connect business systems that don’t talk to each other](articles/how-to-connect-business-systems.md) | Automation → /services/workflow-automation | Problem-aware | ~1,500 | Third |
| [How to choose an AI consultant for a small business](articles/how-to-choose-an-ai-consultant.md) | AI → /services/ai-integration | Decision | ~1,400 | Fourth |
| [What a technical SEO audit should include](articles/what-a-technical-seo-audit-should-include.md) | SEO → /services/seo | Investigation | ~1,550 | Fifth, after the domain fix is live (it mentions it) |
| [AI subscriptions or AI integration?](articles/ai-subscriptions-vs-ai-integration.md) | AI → /services/ai-integration | Investigation | ~1,000 | Sixth |
| [What the UK's AI adoption figures actually say about small businesses](articles/uk-small-business-ai-adoption-2026.md) (data explainer) | AI (link-earning) → /services/ai-integration | Awareness | ~1,450 | Days 61–80; re-check figures on the day and after each ONS release |
| [How to choose a technology partner](articles/how-to-choose-a-technology-partner.md) | All services | Decision | ~1,200 | After the AI-consultant and SEO-cost guides (links to both); owner decides our own ownership and handover answers first |
| [Does your business need a client portal?](articles/does-your-business-need-a-client-portal.md) | Software → /services/custom-software | Investigation | ~1,250 | After the case study (links to it) |
| [How we built our own site, client portal and checkout](articles/how-we-built-this-site.md) (case study) | Proof → /services/custom-software, /services/seo | Decision | ~1,150 | Any time: every fact is from this repository |

Word counts exclude front matter. The full calendar, including planned pieces not yet drafted, is in [editorial-calendar.csv](editorial-calendar.csv).

## How each was chosen

Each answers a question a buyer asks *between* reading a general article and making an enquiry. The [content gap analysis](../08-content-gap-analysis.md) found the library had nothing at that stage. Each targets one intent that no existing page serves, checked for cannibalisation in the [content gap analysis](../08-content-gap-analysis.md#cannibalisation-check), and links up to exactly one service page. Topics from the mission brief that the existing library already covers (where AI saves time, what to automate first, when to build custom software, why a website doesn't bring customers) were **not** rewritten.

## Standards they were written to

- An answer in the first paragraph; useful to a reader who never becomes a customer.
- British English; plain, confident sentences; no generic AI openers.
- No invented statistics, case studies, quotes or clients. Every figure is from a primary source, linked and verified on 18 Nov 2026 (ONS, DSIT, Google, ICO). Market price ranges are described in words, with their vendor sources listed in the review notes.
- Examples are labelled as illustrative.
- Only capabilities the site already claims; platforms named only where the site already names them.
- Internal links follow the [internal linking plan](../12-internal-linking-plan.md): one up-link to the service page, one sibling, a closing CTA with the service's own wording.
- Every external URL was checked and returned 200 on 18 Nov 2026.

## Publishing an article (when approved)

1. Read it under `pnpm dev` at `/insights/<slug>`, and work through the review notes in its Markdown front matter.
2. In `src/content/blog/posts/<slug>.tsx`: delete `draft: true`, and set `date` to the publishing day.
3. Remove its slug from the draft list in the "draft articles are not served" test in `tests/e2e/routes.spec.ts` (all ten are listed).
4. Run `pnpm lint`, `pnpm typecheck`, `pnpm build`, and the insights, routes and service-pages e2e specs.
5. After deploy, request indexing in Search Console.

Nothing else needs editing (since 19 Nov 2026):
- **Service pages:** every draft is already listed in its service page's related insights (`src/data/service-pages.ts`, `SEO_RELATED_INSIGHTS` in `src/data/seo-service.ts`). Unpublished slugs are skipped, so the link appears on the day the article is published.
- **Links between articles:** any sentence that points to another draft is wrapped in `<WhenPublished slug="…">` (`src/components/insights/WhenPublished.tsx`). It shows only once that article is published, so the drafts can go live in any order without a link to a missing page. Three published articles carry such sentences too: they link their cluster's drafts from publication day. Use the same wrapper when a new draft refers to another unpublished one.
- **A guard:** the e2e test "no page in the sitemap links to a missing page on the site" fails the build check if a published page ever links to an unpublished one.

The page heading is `meta.title` (the full, title-cased H1); the `<title>` and social title use the shorter `meta.seoTitle` when it is set.
