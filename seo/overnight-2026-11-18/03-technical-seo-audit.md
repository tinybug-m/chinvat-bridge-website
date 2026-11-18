# Technical SEO audit

**Audited:** 18 November 2026, live site at `https://www.chinvatbridge.com` (and its twin at `https://www.chinvatbridge.uk`), plus the local repository on `main` at `64a4fc0`.
**Method:** a stdlib crawler that followed every internal link from the homepage (16 HTML URLs reached); `curl` checks of redirects, headers, robots and the sitemap; DNS lookups; lab performance runs in headless Chromium with Lighthouse-like mobile throttling (4× CPU, 1.6 Mbps, 150 ms RTT). The raw crawl is kept in the session scratchpad, not in the repo.
**Not available:** Google Search Console, GA4 and CrUX field data (no access, and the keyless PageSpeed Insights API was over its daily quota; see [measurement framework](15-measurement-framework.md)). Nothing below claims index coverage or field Core Web Vitals.

Severity scale: **Critical** blocks rankings or splits signals; **High** materially limits commercial visibility or trust; **Medium** worth fixing this quarter; **Low** tidy-up.

## Summary

| Finding | Severity | Status after this session |
|---|---|---|
| T1. The site is served on two domains and every canonical points at the one the business is moving away from | Critical | Code ready locally; needs a Vercel env change and a domain redirect (human) |
| T2. Three of the four services have no indexable URL | High | Three service pages built locally |
| T3. The only real client project links to a dead deployment | High | Link corrected locally to the production site |
| T4. No analytics or conversion measurement of any kind | High | Plan written; needs owner choice of tool and consent approach |
| T5. Company identity cannot be verified on Companies House | High (trust/compliance) | Decision for the owner; nothing changed |
| T6. Homepage title leads with a brand name the SERP gives to mythology | Medium | Title rewritten locally |
| T7. Homepage H1 says nothing about what the company does | Medium | Options documented; visible copy unchanged |
| T8. Article structured data is thin and disconnected from the Organization | Medium | Fixed locally |
| T9. Article breadcrumbs skip Home | Low | Fixed locally |
| T10. Homepage main-thread cost on mobile (lab TBT ≈ 1.7 s) | Medium | Documented with a measurement plan; not changed |
| T11. Robots policy differs between the two domains | Medium | Decision documented |
| T12. Generic internal anchors point at a homepage anchor | Medium | Fixed locally with the new service pages |
| T13. Organization schema lacks `sameAs`, number and address detail | Low | Waiting on verified profiles and company details |
| T14. Design-study routes are public | Low | Documented |
| T15. 404 page emits two robots meta tags | Low | Documented; harmless |

What is already good, and should be kept: HTTPS with HSTS; `http` and apex both 308 to `https://www.`; trailing slashes 308 to the slashless URL; query strings resolve to a clean canonical; one H1 per page; every indexable page has its own title, description, canonical, Open Graph and Twitter data (from `pageMetadata()`); private routes (`/login`, `/subscribe/*`, `/client-portal`, `/dashboard`, `/admin`) are `noindex, nofollow` or redirect to login; the sitemap's `lastmod` values come from real content dates; images carry descriptive alt text; LCP and CLS are healthy in lab tests on every page sampled.

---

## T1. Two live domains, canonicals on the wrong one — Critical

**Evidence**

| Check | `www.chinvatbridge.com` | `www.chinvatbridge.uk` |
|---|---|---|
| Status | 200 | 200 |
| Hosting | Vercel directly (`server: Vercel`, CNAME to `vercel-dns`) | Cloudflare proxy in front of Vercel (`server: cloudflare`, `cf-ray`) |
| `<link rel="canonical">` on `/` | `https://www.chinvatbridge.uk` | `https://www.chinvatbridge.uk` |
| `og:url` | `.uk` | `.uk` |
| `robots.txt` Sitemap line | `https://www.chinvatbridge.uk/sitemap.xml` | same, plus a Cloudflare-managed AI-crawler block |
| `sitemap.xml` `<loc>` values | all `.uk` | all `.uk` |
| MX records | `smtp.google.com` (Google Workspace) | registrar / Cloudflare forwarding |

The mission names `.com` as the primary website, the contact address moved to `artin@chinvatbridge.com` in commit `1c3024f`, and `.com` is where the business's mail runs. Every signal the site sends to search engines, however, says the canonical home is `.uk`. Both hosts return full pages with 200, so search engines see two copies and are told to prefer the one the business is moving away from. Links people build to `.com` then point at a URL that declares it is not canonical.

**Cause in code:** `SITE_URL` in [src/lib/constants.ts](../../src/lib/constants.ts) reads `NEXT_PUBLIC_SITE_URL`, which is `https://www.chinvatbridge.uk` in `.env.local` and, by the evidence above, in Vercel production. The fallback in code was also `.uk`. The same value feeds Stripe redirect URLs and Supabase magic-link redirects through `getSiteOrigin()`, and `supabase/config.toml` sets `site_url` and `additional_redirect_urls` to `.uk`.

**Recommended correction (in this order, all production actions for a human):**
1. Decide the canonical host. Recommendation: `https://www.chinvatbridge.com` (it matches the mission, the mail domain and the Scornik-style `.com` convention of the market).
2. In Supabase Auth → URL configuration, set Site URL to `https://www.chinvatbridge.com` and add `https://www.chinvatbridge.com/**` to the redirect allow-list. Keep `.uk` in the list until the redirect is live, so in-flight magic links still work.
3. In Vercel → Project → Environment Variables (Production), set `NEXT_PUBLIC_SITE_URL=https://www.chinvatbridge.com` and redeploy.
4. Make `.uk` (apex and `www`) 301/308 to the same path on `.com`. Either add the `.uk` domains in Vercel as redirects to `www.chinvatbridge.com`, or add a Cloudflare Redirect Rule (`https://www.chinvatbridge.uk/*` → `https://www.chinvatbridge.com/${1}`, 301, preserve query string).
5. In Google Search Console, add a Domain property for `chinvatbridge.com`; if a `.uk` property exists, use **Change of Address** from it to `.com`; submit `https://www.chinvatbridge.com/sitemap.xml`. Do the same in Bing Webmaster Tools.
6. Check the Stripe dashboard for any hard-coded `.uk` URLs (webhook endpoint, customer portal return URL) and the Gmail "Sent from … chinvatbridge.uk" footer in the enquiry email.

**Done locally:** the code fallback, `supabase/config.toml` and the enquiry email footer now say `.com`, so a deployment with the env var unset can no longer emit `.uk`. `.env.local` was deliberately left alone, since it holds the owner's credentials. See [implementation log](implementation-log.md).

**Measure:** after the switch, `curl -sI https://www.chinvatbridge.uk/insights` returns 301/308 to `.com`; the `.com` homepage canonical is `.com`; Search Console's page indexing report shows `.com` URLs as "Indexed" and `.uk` as "Page with redirect" within a few weeks.

## T2. Three services have no URL of their own — High

**Evidence:** the homepage presents four services, but only SEO has a page (`/services/seo`). AI & Automation Integration, Automation & Workflows and Software & Web exist only as sections inside the homepage (`/#services-ai`, `/#services-automation`, `/#services-software`). `/services` and `/services/ai` return 404. The header, footer "Disciplines" column and the hero's discipline links all point to those fragments, and each service plate's "learn more" link points to a blog article, not to a service page.

A URL fragment is not a separate document to a search engine. There is nothing that can rank for "AI consultancy for small businesses", "business process automation consultant UK" or "bespoke software development for small business", which are the commercial queries the [keyword research](05-keyword-research.csv) found live demand for. Three quarters of the offer is invisible to commercial search.

**Correction:** one substantive service page per service, each aimed at a distinct commercial intent, linked from the nav, footer, hero and homepage plates, with Service and BreadcrumbList structured data. Built locally: `/services/ai-integration`, `/services/workflow-automation`, `/services/custom-software`. See [service-page strategy](11-service-page-strategy.md).

## T3. Dead link on the only real client project — High

**Evidence:** the homepage "Recent work" list links Scornik Gerstein LLP, the one commissioned project, to `https://scornik.vercel.app/`. On 18 Nov 2026 that URL returned `404` with `x-vercel-error: DEPLOYMENT_NOT_FOUND`. The firm's production site, `https://www.scornik.com/`, returns 200 from Vercel, is a Next.js build, and its hero reads "Your London Solicitors for…", matching the screenshot alt text in `src/components/home/work/projects.ts`. The firm is SRA-regulated (SRA number 565232, per the research agent's register lookup). The production site does not credit a builder anywhere in its HTML.

The most credible proof the business has currently sends visitors to an error page.

**Correction (done locally):** the link now points at `https://www.scornik.com/`. **Human check:** confirm with the client that linking to their live site is fine, and ask whether they would add a "Website by Chinvat Bridge" credit, which would be a relevant, earned link.

## T4. No measurement — High

**Evidence:** none of the crawled pages loads GA4, Google Tag Manager, Vercel Web Analytics, Plausible, Fathom, Clarity or any other analytics script. The enquiry flow (`src/actions/enquiry.ts`) emails the message but records no source page, referrer or campaign. Search Console status is unknown.

Without this the programme cannot answer its own primary question: which pages and queries produce qualified enquiries.

**Correction:** see [measurement framework](15-measurement-framework.md). The short version: verify Search Console for `.com` now; add an analytics tool that stores nothing on, and reads nothing from, the visitor's device beyond what is strictly necessary (PECR covers any storage or access, not only cookies, so check the vendor's documentation) and describe it in the privacy policy. Enquiry attribution is now built locally (commit `21afd32`). Choosing an analytics vendor is an owner decision, so none was installed.

## T5. Company identity is not verifiable — High (trust and compliance)

**Evidence:** the footer says "© 2026 Chinvat Bridge Ltd", the Organization schema sets `legalName: "Chinvat Bridge Ltd"`, and the terms refer to the company. A Companies House name search for "chinvat" on 18 Nov 2026 returned no companies at all, and the research agent's six name variants also returned nothing. No company number or registered office appears anywhere on the site.

Two consequences. First, buyers, directories (Clutch, G-Cloud) and Google's quality raters all look for a verifiable business; an untraceable "Ltd" weakens every trust signal the strategy depends on. Second, a registered UK company must show its registered name, number and registered office on its website under the Company, Limited Liability Partnership and Business (Names and Trading Disclosures) Regulations 2015 (SI 2015/17), and only a registered limited company may describe itself as "Ltd". The same name appears in the terms (as the contracting party), the checkout shell and the Organization schema, all of which were already live before this branch.

**Correction (owner):** confirm the exact registered name and number. If the company is registered under another name, use that name in the footer and schema. If incorporation is pending, remove "Ltd" until it completes. Then add the company number and registered office to the footer and to the Organization schema (`legalName`, `identifier`, `address`). Nothing was changed, because the facts aren't known.

## T6. Homepage title — Medium

**Evidence:** `<title>Chinvat Bridge — AI, Automation, Software & SEO</title>`. The research agent found that a search for "Chinvat Bridge" returns only mythology results (Wikipedia, Britannica and similar), with no sign of the business, so brand searches are contested and the title does little for non-brand discovery.

**Correction (done locally):** the homepage title now leads with the offer and the market: `AI, Automation & Custom Software for UK SMEs — Chinvat Bridge` (61 characters). The meta description was tightened to name the buyer and the four services.

## T7. Homepage H1 — Medium

**Evidence:** `<h1>Cross the bridge. Enter the future.</h1>`. It is the brand line from the company's LinkedIn overview and the visual centre of the hero, but it tells neither a visitor nor a search engine what the company does. The lede beneath it does that job ("We bridge the gap between complex challenges and intelligent technology: AI and automation, custom software, SEO, and data analytics.").

**Not changed:** the hero is built around the line, and a commit note records that the H1 is kept short so it stays the desktop LCP element. Options for the owner are in [on-page audit](04-on-page-audit.md#homepage). Google relies on the title more than the H1, and the title is fixed, so this is a lower priority than T1–T5.

## T8. Article structured data — Medium

**Evidence:** each article emits `Article` with `author` and `publisher` as bare `{ "@type": "Organization", "name": "Chinvat Bridge" }`, no `image`, no `url`, and no link to the site's Organization node (`/#organization`). Google's Article documentation recommends `image`, and a publisher that resolves to the same entity as the site's Organization is what lets search engines join the articles to the business.

**Correction (done locally):** `author` and `publisher` reference `${SITE_URL}/#organization`; `image` uses the site's share image; `url` and `inLanguage` added. A named author is not invented; adding a real author with a short bio is an editorial decision recorded in the [handoff](HANDOFF.md).

## T9. Article breadcrumbs skip Home — Low

**Evidence:** `BreadcrumbList` on articles is `Insights › Article`, while `/services/seo` is `Home › SEO & Digital Growth`.

**Correction (done locally):** `Home › Insights › Article`.

## T10. Homepage main-thread cost on mobile — Medium

**Evidence (lab, 18 Nov 2026):**

| Page | Profile | FCP | LCP | CLS | TBT (long-task sum) | Transfer | Requests |
|---|---|---|---|---|---|---|---|
| `/` | mobile | 2.10 s | 2.10 s | 0.006 | 1,683 ms | 785 KB | 50 |
| `/` | desktop | 1.14 s | 1.14 s | 0.004 | 685 ms | 725 KB | 45 |
| `/services/seo` | mobile | 1.43 s | 1.43 s | 0 | 101 ms | 504 KB | 38 |
| `/insights/what-should-you-automate-first` | mobile | 1.63 s | 1.63 s | 0 | 166 ms | 520 KB | 39 |
| `/pricing` | mobile | 2.26 s | 2.26 s | 0 | 156 ms | 540 KB | 46 |

The homepage HTML is 559 KB uncompressed (59 KB with Brotli). About 171 KB is inline SVG and about 323 KB is the React Server Components payload, which repeats that markup. TBT here is the sum of long tasks over 50 ms under 4× CPU throttling, which approximates Lighthouse TBT, not field INP.

LCP and CLS are comfortably inside Google's "good" thresholds, so this isn't holding rankings back today. The risk is INP on mid-range phones, since the hero, the energy wire and the WebGL mark all run on the main thread during load. Inner pages are light.

**Correction:** measure first. Once field data exists (Search Console's Core Web Vitals report, or the analytics tool's web-vitals), act only if mobile INP is above 200 ms. Candidate fixes, in order of safety: defer the energy-flow routing until after first input, lazy-mount the WebGL scenes when they near the viewport, and render the large decorative SVGs from static files rather than inline JSX so they leave the RSC payload. Nothing was changed: it is design-critical code and there is no field evidence of harm.

## T11. Robots policy differs between the domains — Medium

**Evidence:** `.com/robots.txt` is the app's own (`Allow: /` plus the sitemap). `.uk/robots.txt` is a Cloudflare-managed file that adds `Content-Signal: search=yes,ai-train=no,use=reference` and disallows GPTBot, ClaudeBot, Google-Extended, CCBot, GoogleOther, Applebot-Extended, Bytespider and about 25 others, before repeating the app's rules.

Per the operators' documentation (sources in the [source register](source-register.md)), most of those are AI-training crawlers; Google-Extended and Applebot-Extended are usage-control tokens rather than separate crawlers, and GoogleOther is a generic Google fetcher not used for Search. The agents that fetch pages for AI search answers (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot) and Googlebot are not blocked. Blocking Google-Extended does not affect Google Search; it may limit Gemini's use of the content for grounding.

**Correction:** once `.com` is canonical, its robots.txt is the one that counts, and today it blocks nothing. That is a reasonable default for a business that wants to be cited by AI assistants. If the owner prefers the `.uk` stance (no training, yes to search), add the same Cloudflare-managed robots to `.com` by moving it behind Cloudflare, or add explicit `Disallow` groups for the training agents in `src/app/robots.ts`. Recorded as a decision; not changed.

## T12. Generic internal anchors — Medium

**Evidence:** the AI, automation and custom-software articles link "process automation", "AI integration", "workflow automation" and "software project" to `/#services`. The SEO page's "Related services" sends custom software to `/#services-software`. None of these passes relevance to a page that could rank.

**Correction (done locally):** each now points at the matching service page with descriptive anchor text. See [internal linking plan](12-internal-linking-plan.md).

## T13. Organization schema detail — Low

**Evidence:** the root Organization node has name, legal name, URL, logo, email, `areaServed: "Worldwide"` and a postal address with only `addressCountry: "GB"`. There is no `sameAs`, because the research found no LinkedIn company page, directory listing or other profile that could be verified as the business's.

**Correction:** when the company details (T5) and profiles exist, add `sameAs` (LinkedIn, Clutch), `identifier` (company number) and a full registered address. Not changed: none of these can be verified today.

## T14. Design-study routes are public — Low

**Evidence:** `/bridge-studies` and `/hero-studies/{crossing,monument,portal}` return 200 with `noindex, nofollow`. They aren't linked or in the sitemap, and they weigh 360–560 KB each.

**Correction:** no SEO harm. Consider removing them from production builds, or gating them behind an env flag, so stray links never show unfinished studies to a prospect.

## T15. Duplicate robots meta on 404 — Low

**Evidence:** 404 responses carry both `<meta name="robots" content="noindex">` (added by Next.js) and `content="noindex, nofollow"` (from `not-found.tsx`). Search engines combine them, and the status is a correct 404, so this has no effect. It is listed only for completeness.

## Not applicable or deliberately not recommended

- **hreflang:** the site is English for a UK market; it says it works globally, and any international enquiries are served from the same pages. One locale needs no hreflang. Revisit only if a non-English or region-specific version is created.
- **Pagination:** the Insights index has five articles; no pagination exists or is needed yet.
- **City or country landing pages:** the keyword research found London modifiers on SEO and software queries, but the site shows no presence there (confirm with the owner). Pages for places it doesn't operate in would be doorway pages. Not recommended.
