# Fixed-price first engagements: proposal

**For owner decision (strategy R11). Nothing here is on the site.** Prices are in [brackets] because setting them is the owner's call.

## Why

The [competitor analysis](07-competitor-analysis.md#independents-worth-studying-for-positioning) found that small firms with little proof win buyers by offering a **low-risk, fixed-price first step** that leaves the client with something useful whether or not they continue. Today Chinvat Bridge's AI, automation and software pages end with "scoped per project", which asks a cautious buyer to commit to a conversation with no defined outcome.

Two offers fit the business and the research:

1. **An operations review** for the AI, automation and software services.
2. **A technical SEO audit** for buyers not yet ready for a retainer.

## Market anchors (vendor-published, seen 18 Nov 2026)

| Offer | Published price | Source |
|---|---|---|
| Audit and opportunity map (automation, Bristol, founded 2025) | from £450 | Campbell Consultancy, DesignRush profile |
| AI readiness assessment (London agency) | £5,000–£12,000 | Whitehat SEO |
| Small-site SEO audit | £495 + VAT | Ink Digital |
| SEO audit (international agency, UK pages) | £1,000–£5,000 | SEO Sherpa |

These are vendors' own claims and are listed in the [source register](source-register.md). A price at the low end of these ranges suits the stated buyer (UK businesses with 5–50 staff) and the business's current proof level. It also gives a clear reason to pick Chinvat Bridge.

**Suggested ranges for the owner to consider:** operations review £[450–950]; technical SEO audit £[395–795] for sites up to [N] pages. Both ex VAT, matching the terms.

## Offer 1: Operations review

**Name options:** "Operations review" (plain, recommended), "Automation review", "AI and automation review".

**Proposed copy (for a section on the AI, automation and software pages, and a card on /pricing):**

> **Start with a fixed-price operations review**
> We look at how the work actually moves through your business, then tell you, in writing, what's worth automating, where AI would genuinely help, what needs a tool of its own, and what to leave alone.
>
> - A [60–90]-minute working session with the people who do the work
> - A review of up to [3] processes and the tools they touch
> - A written report: each opportunity ranked, with the approach (connect, automate, AI, build or leave), rough effort and running costs
> - A recommended first project with a defined scope
> - Data-protection points to settle before anything is built
>
> **£[price] + VAT, delivered within [10] working days. The report is yours to keep, whether or not you work with us afterwards.**
> [If you go ahead with the recommended first project within [30] days, the review fee is credited against it.]

**Where it goes:**
- Each of the three service pages: a short section above "How projects start", plus one FAQ ("Can we start with something small?").
- /pricing: a card beside the custom package.
- The CTA on those pages could become "Book an operations review", alongside "Describe a process".

**Delivery commitments to confirm before publishing:** turnaround; number of processes; whether the session is remote or on site; the credit rule.

## Offer 2: Technical SEO audit

**Proposed copy (a section on /services/seo, and a card on /pricing):**

> **A one-off technical SEO audit**
> Not ready for a monthly plan? We'll audit how search engines crawl, index and understand your site, and give you a prioritised list of fixes, each with the URL, the evidence and how to fix it.
>
> - Crawling and indexing: robots, sitemaps, status codes, redirects, canonical URLs, duplicate hosts
> - Rendering: whether search engines see the content people see
> - Structure, internal links and on-page signals
> - Structured data and Core Web Vitals
> - A prioritised fix list, and a [30]-minute call to walk through it
>
> **£[price] + VAT for sites up to [N] pages. Fixes can be done by your developer, or by us, quoted separately.** [If you start a monthly plan within [30] days, the audit fee is credited against your first month.]

**Supporting content:** the drafted article [What a technical SEO audit should include](editorial/articles/what-a-technical-seo-audit-should-include.md) already describes this deliverable; link it from the offer.

**Delivery commitments to confirm:** page-count limit; turnaround; whether implementation is offered.

## How to implement (when approved)

- **Data:** add an optional `firstStep` block (title, intro, items, price line, CTA) to `ServicePageContent` in `src/data/service-pages.ts`, and render it in `ServicePage.tsx` above "How projects start"; mirror it in `src/data/seo-service.ts`.
- **Pricing page:** a static card next to `CustomPlanCard` (not in the Supabase `plans` table, which is for subscriptions).
- **Checkout:** start with "book via the conversation" (no code); move to a Stripe one-off payment later if demand justifies it.
- **Measure:** enquiries mentioning the review or audit, and their conversion to first projects or retainers, in the [enquiry tracker](measurement-tracker-enquiries.csv).
