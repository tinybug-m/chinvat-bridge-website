# Implementation log

All work is on the local branch **`seo/overnight-2026-11-18`**, created from `main` at `64a4fc0` (clean working tree at the start). Nothing was pushed, deployed or published. `.env.local` was not modified.

## Commit `445b617` — fix(seo): .com as the canonical origin, offer-led home title, linked article schema, live client link

| File | Change | Justification |
|---|---|---|
| `src/lib/constants.ts` | `SITE_URL` fallback `.uk` → `https://www.chinvatbridge.com` | [T1](03-technical-seo-audit.md#t1-two-live-domains-canonicals-on-the-wrong-one--critical): canonicals, sitemap and robots all pointed at `.uk`. Production still reads `NEXT_PUBLIC_SITE_URL`, which the owner must change. |
| `src/lib/constants.ts` | `SITE_TITLE` → "AI, Automation & Custom Software for UK SMEs — Chinvat Bridge"; `SITE_DESCRIPTION` rewritten (154 chars) | [T6](03-technical-seo-audit.md#t6-homepage-title--medium): brand SERP is mythology; title now leads with the offer |
| `supabase/config.toml` | Auth `site_url` → `.com`; `.com/**` added to redirect URLs, `.uk/**` kept for the switch-over | Magic links and OAuth must follow the canonical origin. Takes effect only on `supabase config push` or a dashboard change. |
| `src/actions/enquiry.ts` | Email footer names `chinvatbridge.com` | Consistency with the primary domain |
| `src/app/(pages)/insights/[slug]/page.tsx` | Article JSON-LD: `@id`, `url`, `inLanguage`, `image`; author and publisher reference the site's Organization `@id`; breadcrumbs Home › Insights › Article | [T8](03-technical-seo-audit.md#t8-article-structured-data--medium), [T9](03-technical-seo-audit.md#t9-article-breadcrumbs-skip-home--low) |
| `src/components/home/work/projects.ts` | Scornik Gerstein href → `https://www.scornik.com/` | [T3](03-technical-seo-audit.md#t3-dead-link-on-the-only-real-client-project--high): the preview returned `DEPLOYMENT_NOT_FOUND` |
| `tests/e2e/work.spec.ts` | Expected href updated | Follows the data |

## Commit `9e94f37` — feat(services): pages for AI integration, workflow automation and custom software

| File | Change | Justification |
|---|---|---|
| `src/data/service-pages.ts` (new) | Typed content for three service pages; header comment lists the source of every claim | [T2](03-technical-seo-audit.md#t2-three-services-have-no-url-of-their-own--high); [service-page strategy](11-service-page-strategy.md) |
| `src/components/services/ServicePage.tsx` (new) | Template reusing `ServiceBlocks`, `PageHeader`, `PlateDiagram` and the homepage diagrams; `Service` + `BreadcrumbList` JSON-LD; `serviceMetadata()` via the existing `pageMetadata()` | Follows the `/services/seo` pattern; no new dependencies |
| `src/app/(pages)/services/{ai-integration,workflow-automation,custom-software}/page.tsx` (new) | Static routes | Indexable URLs |
| `src/app/sitemap.ts` | Service pages listed from `SERVICE_PAGES` + `SEO_SERVICE`, `lastmod` from each page's `updated` | Keeps the "real dates only" rule |
| `src/components/site/nav.ts` | `DISCIPLINE_LINKS` → service pages (footer, every page) | [internal linking plan](12-internal-linking-plan.md) |
| `src/components/home/hero/content.ts` | Hero discipline links → service pages | Same |
| `src/data/services.ts` | Homepage plates' `href` → service pages (label becomes "Explore the service" automatically) | Same |
| `src/data/seo-service.ts` | Related services: software → its page; automation page added | Same |
| `src/content/blog/posts/*.tsx` (three files) | `/#services` anchors → matching service pages | [T12](03-technical-seo-audit.md#t12-generic-internal-anchors--medium) |
| `tests/e2e/service-pages.spec.ts` (new) | H1, CTA target, Service/Breadcrumb JSON-LD, related links resolve, footer links, article schema | Covers the new behaviour |
| `tests/e2e/{hero,routes,services}.spec.ts` | Expected hrefs, new routes, metadata and sitemap dates | Follows the data |
| `docs/redesign/COPY_CHANGES.md` | New section listing every wording change | The project's convention for owner review |

## Commit `04af081` — docs(seo): research, strategy, editorial drafts and handoff

Everything under `seo/overnight-2026-11-18/`. See the [handoff](HANDOFF.md#files-created) for the list.

## Commit `21afd32` — feat(contact): each enquiry says which page prompted it

| File | Change | Justification |
|---|---|---|
| `src/components/site/journey.ts` (new) | In-memory record of the visit's first page (with any `utm_` parameters), referring host and the page before the current one. No cookies or storage. | [T4](03-technical-seo-audit.md#t4-no-measurement--high), [conversion leak](14-conversion-optimisation.md#current-journey): enquiries could not be traced to pages |
| `src/components/site/JourneyRecorder.tsx` (new), `src/components/site/SiteShell.tsx` | Records each route change; mounted once in the site shell (every page) | Same |
| `src/components/home/contact/ContactChat.tsx` | Sends `journey` with the enquiry | Same |
| `src/lib/enquiry-journey.ts` (new), `src/actions/enquiry.ts` | Server keeps only plain paths and bare host names; adds "First page: … (from host)" and "Page before contact: …" to the email | Untrusted input; checked against hostile values (script URLs, header-injection attempts, non-strings), which are dropped |
| `src/app/(pages)/privacy/page.tsx`, `src/lib/legal.ts` | Privacy policy lists this information; "Last updated" 18 Nov 2026 | The policy must describe what an enquiry includes. **Owner to approve the wording.** |
| `tests/e2e/contact.spec.ts`, `tests/e2e/routes.spec.ts` | New test: an enquiry sent after a service page carries that page; privacy `lastmod` expectation | Covers the behaviour |

## Deliberately not changed

| Item | Why |
|---|---|
| `NEXT_PUBLIC_SITE_URL` in Vercel and `.env.local` | Production configuration and the owner's credentials file |
| Homepage H1 | Design-critical; options in the [on-page audit](04-on-page-audit.md#h1-options-for-the-owner) |
| Pricing plan copy | Lives in the production database; pricing changes need approval |
| Footer "Ltd", company number and address | The facts aren't confirmed (T5) |
| Analytics | Vendor and privacy-policy choice for the owner |
| Homepage performance work | No field evidence of harm; design-critical code (T10) |
| robots.txt AI-crawler rules | Policy choice (T11) |
| Next.js upgrade | The build prints a security advisory for 16.4.3. A framework upgrade is outside this SEO change and should be its own reviewed change. |
| New articles in `src/content/blog/posts/` | Adding them would publish them on the next deploy |
