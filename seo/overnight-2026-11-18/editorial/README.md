# Editorial

Six full article drafts and one case study, ready for owner review. **None is published.** They live here as Markdown with their SEO metadata in front matter, not in `src/content/blog/posts/`, because adding them there would publish them on the next deploy.

## The drafts

| Article | Cluster → service page | Stage | Words | Publish order |
|---|---|---|---|---|
| [Outgrown your spreadsheets? When to replace them with software](articles/replace-spreadsheets-with-custom-software.md) | Software → /services/custom-software | Problem-aware | ~1,650 | First: the clearest UK search gap |
| [How much does SEO cost in the UK?](articles/how-much-does-seo-cost-uk.md) | SEO → /services/seo, /pricing | Investigation | ~1,450 | Second, after the /pricing fixes |
| [How to connect business systems that don’t talk to each other](articles/how-to-connect-business-systems.md) | Automation → /services/workflow-automation | Problem-aware | ~1,500 | Third |
| [How to choose an AI consultant for a small business](articles/how-to-choose-an-ai-consultant.md) | AI → /services/ai-integration | Decision | ~1,400 | Fourth |
| [What a technical SEO audit should include](articles/what-a-technical-seo-audit-should-include.md) | SEO → /services/seo | Investigation | ~1,550 | Fifth, after the domain fix is live (it mentions it) |
| [AI subscriptions or AI integration?](articles/ai-subscriptions-vs-ai-integration.md) | AI → /services/ai-integration | Investigation | ~1,000 | Sixth |
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

1. Create `src/content/blog/posts/<slug>.tsx` following the existing posts: export `meta` (slug, title, description, date, author, category, tags, readingMinutes) and `Content` (JSX using `<Link>` for internal links, `<a>` for external).
2. Use the front matter's `seo_title` for `meta.title` (the template adds "— Chinvat Bridge") and `meta_description` for `meta.description`.
3. Register it in `src/content/blog/posts/index.ts`.
4. Add it to the target service page's `relatedInsights` in `src/data/service-pages.ts` (or `SEO_RELATED_INSIGHTS` in `src/data/seo-service.ts`) with a one-line reason.
5. Run `pnpm lint`, `pnpm typecheck`, `pnpm build`, and the insights and routes e2e specs.
6. After deploy, request indexing in Search Console.

The H1 on article pages is `meta.title`, so a post's on-page heading will be its SEO title. If the shorter `h1` from the front matter is preferred on the page, that would need a small change to `PostMeta` and the article template; not done here.
