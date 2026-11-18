---
status: draft — for owner review, not published
slug: what-a-technical-seo-audit-should-include
url: /insights/what-a-technical-seo-audit-should-include
seo_title: "What a Technical SEO Audit Should Include"
meta_description: "The checks that matter in a technical SEO audit — crawling, indexing, rendering, structure, structured data and Core Web Vitals — and the tool scores you can ignore."
h1: "What a technical SEO audit should include"
primary_keyword: what should a technical seo audit include
secondary_keywords:
  - technical seo audit
  - seo audit checklist
  - technical seo audit checklist
# 'seo audit services uk' (service intent) belongs to /services/seo.
  - seo audit cost uk
  - technical seo audit for small business
search_intent: commercial investigation
audience: Marketing leads, owners and developers of UK SMEs commissioning, or sceptical of, an SEO audit
funnel_stage: consideration
strategic_purpose: >
  Demonstrate technical depth in the SEO cluster, where credibility is won on expertise. Targets
  audit-specific investigation queries and positions Chinvat Bridge's developer background as the
  difference. Feeds /services/seo and, if the owner productises one, a fixed-price audit offer.
service_page: /services/seo
category: SEO & Discovery
tags: [seo, technical-seo]
reading_minutes: 9
internal_links:
  - anchor: "technical SEO audits and fixes"
    href: /services/seo
  - anchor: "How much does SEO cost in the UK?"
    href: /insights/how-much-does-seo-cost-uk
  - anchor: "Why your website isn’t bringing you enough customers"
    href: /insights/why-your-website-isnt-bringing-you-customers
external_references:
  - "Google Search Central, robots.txt introduction: https://developers.google.com/search/docs/crawling-indexing/robots/intro"
  - "Google Search Central, consolidate duplicate URLs (canonicalisation): https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls"
  - "Google Search Central, Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals"
  - "Google Search Central blog, changes to HowTo and FAQ rich results (August 2023): https://developers.google.com/search/blog/2023/08/howto-faq-changes"
cta: "Discuss your SEO goals → /#contact"
schema: Article, BreadcrumbList
review_notes:
  - "The aside about our own site (two live domains, canonicals on the old one) is true as of 18 Nov 2026 and makes the point well. Keep it only if the owner is comfortable, and only after the fix is live, so the article describes a solved problem."
  - "Core Web Vitals thresholds (LCP 2.5 s, INP 200 ms, CLS 0.1 at the 75th percentile) and the 2023 FAQ rich-result change are from Google's documentation. Re-check the linked pages on the day of publishing."
  - "Audit pricing is described in words. Published UK figures seen on 18 Nov 2026 run from £495 + VAT for small sites (Ink Digital) to £1,000–£5,000 (SEO Sherpa, an international agency, on its UK pages), all vendor-stated."
---

# What a technical SEO audit should include

A useful technical SEO audit answers three questions. Can search engines crawl and index the pages that matter? Do they understand what each page is about? Is anything on the site holding those pages back? It should end with a short, prioritised list of fixes, each tied to a URL and the evidence for it, rather than a 200-page export from a crawling tool. Here is what belongs in one, and what you can safely ignore. It is also the checklist behind the [technical SEO audits and fixes](/services/seo) in our plans.

## Crawling and indexing: can search engines reach the right pages?

This is the foundation, and the part where small problems cause the biggest losses.

- **robots.txt.** Check that it doesn't block anything important, and that it points to the sitemap. Remember that robots.txt controls *crawling*, not indexing: a blocked page can still appear in results if other pages link to it. To keep a page out of the index, allow crawling and use `noindex` ([Google's robots.txt guide](https://developers.google.com/search/docs/crawling-indexing/robots/intro)).
- **Indexing directives.** Look for `noindex` on pages that should rank, often left over from a staging site, and for its absence on pages that shouldn't (login, checkout, internal previews).
- **The sitemap.** It should list every page you want indexed and nothing else: no redirects, no `noindex` pages, no errors. `lastmod` dates should reflect real changes, not the build time.
- **Status codes and redirects.** Pages that should exist return 200; removed pages return 404 or 410, or redirect permanently (301 or 308) to their closest replacement. Watch for chains (A → B → C) and loops.
- **One version of every page.** `http` and `https`, `www` and bare domain, trailing slash or not, and in some cases **two whole domains** should all resolve to a single version, with a matching canonical tag ([Google on duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)). A canonical is a strong hint, not an instruction, so it needs to agree with your redirects, sitemap and internal links.

> We found the last of these on our own site while preparing this guide: the site answered on two domains, and every canonical pointed at the one we were moving away from. It's an easy mistake, invisible to visitors, and exactly what an audit is for.

## Rendering: does the page search engines see match the one people see?

Many modern sites build their content with JavaScript. Google can render JavaScript, but it costs time and can fail, and other search engines and AI crawlers vary in how well they cope. Check the HTML your server actually returns: are the main text, headings, links and structured data in it, or do they appear only after scripts run? In Search Console, the URL Inspection tool shows the page as Google rendered it. Sites built with frameworks that render on the server, or generate static pages, usually pass this easily; single-page apps often don't.

## Structure and internal links: can search engines tell what matters?

- **Every important page is linked**, with ordinary `<a href>` links, from somewhere a crawler will find it. A page reachable only through a search box or a script is effectively hidden.
- **Important pages are close to the homepage**, a few clicks away rather than buried.
- **Each commercial topic has its own URL.** A service described only as a section of the homepage (`/#services`) has nothing that can rank on its own.
- **Anchor text describes the destination.** "Workflow automation" tells a search engine more than "click here".
- **No orphans:** pages in the sitemap that nothing links to.

## On-page signals: does each page say what it is?

- A unique, descriptive `<title>` on every page, leading with what the page offers.
- A meta description that would make someone click: not a ranking factor, but it shapes the snippet.
- One clear H1, and headings that follow the page's actual structure.
- No two pages competing for the same search (cannibalisation): if they do, merge them or give each a distinct purpose.
- Descriptive alt text on meaningful images, and empty alt on decorative ones.

## Structured data: are you describing the business accurately?

Structured data (JSON-LD) tells search engines what a page represents: the organisation behind the site, a service, an article, a breadcrumb trail. An audit should check that it parses, that it matches what is visible on the page, and that the entities connect (articles and services pointing to the same organisation).

It should also be realistic about rich results. Some once-popular markup no longer produces them for most sites: since August 2023 Google shows FAQ rich results only for well-known, authoritative government and health websites, and it retired HowTo rich results the following month ([Google, August 2023, updated September 2023](https://developers.google.com/search/blog/2023/08/howto-faq-changes)). Adding FAQ markup to a small business's service page won't create a rich result, whatever a plugin suggests.

## Performance and Core Web Vitals: does the page load and respond well?

Google's [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals) measure loading (Largest Contentful Paint, good at 2.5 seconds or less), responsiveness (Interaction to Next Paint, good at 200 milliseconds or less) and visual stability (Cumulative Layout Shift, good at 0.1 or less), assessed at the 75th percentile of real visits ([web.dev](https://web.dev/articles/vitals)).

Two points an audit should make clear:

- **Field data beats lab data.** A lab test on one machine is useful for diagnosis; what real visitors experience, from Search Console's Core Web Vitals report or real-user monitoring, is what counts.
- **Fix what's failing, then stop.** Moving from "good" to "slightly better" rarely changes rankings. Moving a template from "poor" to "good" can help, and it helps visitors either way.

## What to ignore, or treat with suspicion

- **Tool "health scores".** A score of 72 out of 100 means whatever the tool's maker decided. Judge findings on their impact, not on the score.
- **Keyword density** and **text-to-HTML ratio.** Neither is how modern search engines assess a page.
- **The meta keywords tag.** Google ignores it.
- **Every missing alt attribute marked "critical".** Worth fixing for accessibility, but rarely a ranking emergency.
- **HTML validation errors** that don't affect rendering or crawling.
- **Hundreds of "issues" with no priority.** If everything is critical, nothing is.

## What the deliverable should look like

A good audit report is short enough to act on. For each finding it gives:

| Field | Example |
|---|---|
| What | Canonical tags point to an old domain |
| Where | Every page; example URLs listed |
| Evidence | The canonical tag on the homepage, and the response headers of both domains |
| Severity | Critical: splits all ranking signals |
| Fix | Set the canonical origin; redirect the old domain; update Search Console |
| Who | Developer and site owner |
| How to check | Old-domain URLs redirect; canonical matches; Search Console shows the new URLs indexed |

Findings should be ordered by impact, the audit should say what was *not* checked, and there should be a plan to retest after the fixes. The audit itself changes nothing until someone makes those fixes, so ask whether implementation is included.

## What an audit costs

It depends mostly on the size and complexity of the site and on whether fixes are included. Published UK prices for a small-site audit start at a few hundred pounds, and larger or more complex sites run to several thousand. See [how much does SEO cost in the UK?](/insights/how-much-does-seo-cost-uk) for how audits compare with ongoing work.

## In short

A technical SEO audit worth paying for checks crawling and indexing, rendering, structure and internal links, on-page signals, structured data and real-world performance, and ignores vanity scores. It delivers a prioritised list of specific fixes with evidence, and a way to confirm each one worked. If your site already gets visitors who don't enquire, start with [why your website isn’t bringing you enough customers](/insights/why-your-website-isnt-bringing-you-customers) instead.

Every one of [our SEO plans](/services/seo) begins with a technical audit and fixes. If you'd like a second opinion on your site, [tell us where search is holding you back](/#contact).
