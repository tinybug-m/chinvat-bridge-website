# Current SEO baseline

**As observed on 18 November 2026**, before any of this session's changes are deployed. Everything here was measured or seen directly; anything unavailable is marked as missing rather than estimated.

## Data we do not have

| Source | Status | Consequence |
|---|---|---|
| Google Search Console | No access in this session; verification status unknown | No impressions, clicks, CTR, positions, queries, countries, devices or index coverage. None are reported anywhere in this programme. |
| GA4 or any analytics | **Not installed**: no analytics script on any crawled page | No sessions, landing pages, sources or conversions exist to inspect. |
| CrUX field data | Not checked: the keyless PageSpeed Insights API was over its daily quota | Core Web Vitals below are lab measurements only. |
| Keyword volumes | No logged-in keyword tool available | Every keyword in the [research file](05-keyword-research.csv) is marked "not measured"; demand evidence is Google autocomplete and SERP composition. |
| Backlink data | No login-free source returned figures | Authority is unknown for the site and for competitors. |

The first job of the 30-day plan is therefore to create the baseline this document can't: verify Search Console on the canonical domain, add measurement, and record the starting numbers. See [measurement framework](15-measurement-framework.md).

## Domains and hosting

| | `www.chinvatbridge.com` | `www.chinvatbridge.uk` |
|---|---|---|
| Serves the site | Yes, 200 | Yes, 200 |
| Hosting path | Vercel, direct | Cloudflare proxy → Vercel |
| Declared canonical | `.uk` | `.uk` |
| Mail | Google Workspace (`smtp.google.com`) | Forwarding |
| Apex and `http` | 308 → `https://chinvatbridge.com` → 308 → `https://www.` | 308 → `https://www.` |

The production build sets `NEXT_PUBLIC_SITE_URL=https://www.chinvatbridge.uk`. This is the single most important baseline fact; see [technical audit T1](03-technical-seo-audit.md#t1-two-live-domains-canonicals-on-the-wrong-one--critical).

## Indexable inventory

Eleven URLs are listed in the sitemap and set to `index, follow`. Five more are reachable but correctly `noindex` (`/login`, `/client-portal`, three `/subscribe/details?plan=…` variants), and the design-study routes are `noindex` and unlinked.

| URL | Type | Words (visible, approx.) | Title | H1 |
|---|---|---|---|---|
| `/` | Home | 636 | Chinvat Bridge — AI, Automation, Software & SEO | Cross the bridge. Enter the future. |
| `/services/seo` | Service | 1,570 | SEO Services & Digital Growth — Chinvat Bridge | SEO that makes your business easier to find |
| `/pricing` | Pricing (SEO plans) | 379 | SEO & Content Pricing — Chinvat Bridge | SEO & content plans |
| `/insights` | Index | 269 | Insights — Chinvat Bridge | Ideas & observations |
| `/insights/where-ai-can-save-your-business-time` | Article | 996 | Where AI Can Actually Save Your Business Time — Chinvat Bridge | same |
| `/insights/what-should-you-automate-first` | Article | 909 | What Should You Automate First? — Chinvat Bridge | same |
| `/insights/when-should-a-business-build-custom-software` | Article | 967 | When Should a Business Build Custom Software? — Chinvat Bridge | same |
| `/insights/why-your-website-isnt-bringing-you-customers` | Article | 1,020 | Why Your Website Isn’t Bringing You Enough Customers — Chinvat Bridge | same |
| `/insights/where-the-name-chinvat-bridge-comes-from` | Article (brand) | 558 | Where the Name Chinvat Bridge Comes From — Chinvat Bridge | same |
| `/privacy`, `/terms` | Legal | 337–360 | own titles | own H1s |

Word counts include navigation and footer text, so body copy is somewhat shorter.

**Service architecture:** four services are presented, one has a page. AI, automation and software exist only as homepage sections (`/#services-ai` and so on). Site-wide navigation (header, footer, hero) links to those fragments.

**Content library:** five articles, all published on 15 September 2026 except the name-origin piece (29 October 2026). Four are client-facing and map one-to-one onto the four services; each is a sound, practical piece of about 900–1,000 words in a consistent, plain-spoken voice. None has a named author, none has been updated since publication, and none targets a researched query explicitly.

## Structured data

| Page | Types |
|---|---|
| All pages | `Organization` (name, legal name, URL, logo, email, `areaServed: Worldwide`, country GB), `WebSite` |
| `/services/seo` | `Service` (provider → Organization), `BreadcrumbList` |
| Articles | `Article` (Organization author/publisher by name only, no image), `BreadcrumbList` (Insights › Article) |
| `/insights` | `CollectionPage` |

All JSON-LD parses. All `@id` and URL values are on `.uk`.

## Metadata quality

Every indexable page has a unique title and description, a self-referencing canonical (on `.uk`), and full Open Graph and Twitter data with a 1200×630 share image. Titles are 25–69 characters and descriptions 134–159 characters. The weakest are the homepage title (brand first, in a brand SERP owned by mythology) and `/insights` ("Insights — Chinvat Bridge").

## Performance (lab, not field)

Mobile, 4× CPU and 1.6 Mbps throttling: LCP 1.4–2.3 s and CLS ≤ 0.006 on every page sampled, both within Google's "good" thresholds. The homepage has about 1.7 s of long-task time on throttled mobile (about 0.7 s on desktop), and inner pages 0.1–0.2 s. The homepage document is 559 KB uncompressed and 59 KB Brotli. Full table in [technical audit T10](03-technical-seo-audit.md#t10-homepage-main-thread-cost-on-mobile--medium).

## Conversion paths

- **One enquiry route:** a conversational contact form at `/#contact` on the homepage (name, email, company, interest, message), which emails the business. Every page's closing block and most CTAs lead there. Email is shown in the footer.
- **SEO self-serve:** `/pricing` → `/subscribe/details?plan=…` → Stripe Checkout → client portal. Three retainers: Starter £299, Growth £499, Scale £799 per month, plus a "custom package" card that leads back to the conversation.
- **No** phone number, calendar booking, lead magnet, or fixed-price first engagement.
- Enquiries are not tagged with the page they came from.

## Trust signals

- One real client project (Scornik Gerstein LLP, website design and build). Its link was dead (`DEPLOYMENT_NOT_FOUND`).
- Two concept sites, clearly labelled "Concept".
- No testimonials, reviews, case studies, named team members, company number, registered address or third-party profiles.
- No Companies House record found for "Chinvat Bridge" (see [technical audit T5](03-technical-seo-audit.md#t5-company-identity-is-not-verifiable--high-trust-and-compliance)).
- The site itself is real evidence of engineering skill: a custom Next.js build with Supabase auth, a client dashboard and a Stripe subscription flow.

## Brand search

A search for "Chinvat Bridge" returns only mythology results (Wikipedia, Britannica, World History Encyclopedia and similar). The research found no third-party mention of the business: no LinkedIn page, directory listing, press or reviews. Index status could not be checked with the tools available (the search tool ignores `site:`).

## Baseline numbers to record once access exists

Record these on the day Search Console and analytics go live, then monthly:

1. Indexed pages (Search Console › Pages), by domain.
2. Impressions, clicks, CTR and average position, split into brand (contains "chinvat") and non-brand, and by page group (home, service pages, pricing, insights).
3. Queries with impressions on each service page.
4. Organic sessions by landing page.
5. Enquiries by landing page and source, and how many were qualified (see the definition in the [measurement framework](15-measurement-framework.md)).
