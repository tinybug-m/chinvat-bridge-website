# Internal linking plan

## Model

Hub and spoke, with the four service pages as hubs.

- **Site-wide:** header and mobile menu (Services, Work, Approach, About, Insights, Pricing), and the footer "Disciplines" column, which links all four service pages from every page (done locally). The header's "Services" still points at the homepage section; a services hub or a dropdown is optional later.
- **Homepage:** hero discipline links and the four service plates all go to the service pages (done locally). Previously three of four went to homepage anchors or to articles.
- **Service pages** link down to their articles, across to two sibling services, and out to the conversation.
- **Articles** link up to their service page with a descriptive anchor in the body, across to one sibling article, and end with a CTA.

## Links changed this session

| From | Anchor | Was | Now |
|---|---|---|---|
| Footer "Disciplines" column (every page) | AI & Automation / Workflows / Software & Web | `/#services-ai`, `/#services-automation`, `/#services-software` | `/services/ai-integration`, `/services/workflow-automation`, `/services/custom-software` |
| Hero discipline index | AI integration / Automation & workflows / Software & web | homepage anchors | service pages |
| Homepage service plates | "Read the article" | three articles | "Explore the service" → service pages |
| Where AI can save your business time | process automation | `/#services` | `/services/workflow-automation` |
| Where AI can save your business time | AI integration | `/#services` | `/services/ai-integration` |
| What should you automate first? | workflow automation | `/#services` | `/services/workflow-automation` |
| When should a business build custom software? | software project | `/#services` | `/services/custom-software` |
| /services/seo related services | Custom software development | `/#services-software` | `/services/custom-software` |
| /services/seo related services | Workflow automation and integration | — | `/services/workflow-automation` (new) |

The homepage plates no longer link to the three articles, so those articles lose one homepage link each. They are still linked from the homepage Insights list, the Insights index, the footer chain and now from each service page's "Related insights", which is a more relevant source.

## Link map after this session

| Page | Links out to (contextual) | Linked from (contextual) |
|---|---|---|
| /services/ai-integration | AI article; automate-first article; workflow page; software page; /#contact; /pricing | Home (hero, plate), footer, AI article, workflow page |
| /services/workflow-automation | automate-first article; custom-software article; AI page; software page; /#contact | Home, footer, AI article, automate-first article, AI page, software page, SEO page |
| /services/custom-software | custom-software article; automate-first article; website article; workflow page; SEO page; /#contact | Home, footer, custom-software article, AI page, workflow page, SEO page |
| /services/seo | website article; software page; workflow page; /pricing | Home, footer, software page |

## Rules for new articles

1. **One up-link in the first third of the body** to the article's service page, with an anchor that describes the service ("workflow automation and integration", not "click here" or "our services").
2. **One sibling link** to the closest existing article.
3. **A closing CTA** using the service page's own CTA wording.
4. **Update the service page's `relatedInsights`** in `src/data/service-pages.ts` (or `SEO_RELATED_INSIGHTS`) when the article is published, so the link runs both ways.
5. **Vary anchors** across articles; never use the same exact-match anchor to a service page from more than two articles.

## Planned links for the drafted articles

| Article | Early up-link (first third) → page | Sibling link |
|---|---|---|
| When to replace spreadsheets with software | "custom software" → /services/custom-software (closing: "custom software built around the way you work") | When should a business build custom software? |
| How much does SEO cost in the UK? | "our SEO service" → /services/seo; later "what our SEO service includes" → /services/seo and "our SEO plans" → /pricing | Why your website isn’t bringing you enough customers |
| How to connect business systems | "workflow automation and integration" → /services/workflow-automation (closing: "how we approach automation projects") | What should you automate first? |
| How to choose an AI consultant | "how we approach AI projects" → /services/ai-integration (closing: "our AI integration work") | Where AI can actually save your business time |
| What a technical SEO audit should include | "technical SEO audits and fixes" → /services/seo (closing: "our SEO plans") |
| AI subscriptions or AI integration? | "AI integration" → /services/ai-integration (closing: "proper integration into your systems") | How to choose an AI consultant |
| Does your business need a client portal? | "software we build" → /services/custom-software (closing: "building your own") | How we built our own site, client portal and checkout |
| How we built our own site, client portal and checkout | "custom software" → /services/custom-software; "SEO service" → /services/seo | When should a business build custom software? | How much does SEO cost in the UK? |
| Zapier, Make or a custom integration? (planned) | "custom API integrations" → /services/workflow-automation | How to connect business systems |

## Orphans and dead ends

- No orphaned indexable pages: every sitemap URL is linked from at least the footer or the Insights index.
- `/client-portal` (noindex preview) is linked from /pricing; correct.
- The design-study routes are unlinked and noindex; recommend removing them from production.
- Every new service page ends with a CTA and related links, so none is a dead end.
