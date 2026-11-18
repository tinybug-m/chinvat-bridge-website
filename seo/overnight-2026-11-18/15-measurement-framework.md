# Measurement framework

## North star

**Qualified organic enquiries per month**: enquiries whose first landing page came from organic search and which meet the [qualified definition](14-conversion-optimisation.md#what-qualified-means).

Everything below either leads to that number or explains why it moved.

## Metrics

| Layer | Metric | Source | Cadence | First target |
|---|---|---|---|---|
| Foundations | `.uk` URLs redirecting; `.com` pages indexed / submitted | Search Console › Pages | Weekly for 4 weeks, then monthly | All 14 sitemap URLs indexed on `.com` by day 45 |
| Visibility | Non-brand impressions, by page group (home, each service page, pricing, insights) | Search Console › Performance, with a regex filter excluding `chinvat` | Monthly | Each service page earns impressions for at least 10 distinct non-brand queries by day 60 |
| Visibility | Queries per service page, and their average position | Search Console | Monthly | Any query in positions 8–20 is a rewrite candidate |
| Traffic | Organic clicks and entrances per service page and article | Search Console + analytics | Monthly | — (no baseline yet) |
| Engagement | Share of organic entrances that reach `/#contact` | Analytics (path) | Monthly | — |
| Conversion | Enquiries with landing page and source | Enquiry email/tracker | Per enquiry | 100% of enquiries attributed by day 30 |
| Conversion | Qualified enquiries, by service and landing page | Tracker | Monthly | The north star |
| Commercial | Enquiries → proposals → clients, by source | Tracker | Quarterly | — |
| Authority | Referring domains (relevant, earned) | Search Console › Links; Ahrefs Webmaster Tools (free for verified sites) | Quarterly | 3+ relevant referring domains by day 90 |
| Experience | Core Web Vitals (LCP, INP, CLS) at p75 | Search Console CWV report, or the analytics tool's web-vitals | Monthly once there is data | All "good"; act on INP over 200 ms |

No numeric traffic targets are set, because there is no baseline yet. Set them on day 30 from the first month of data.

## Tooling

| Need | Recommendation | Why | Cost |
|---|---|---|---|
| Search data | Google Search Console (Domain property for `chinvatbridge.com`) and Bing Webmaster Tools | Only source of query data | Free |
| Site analytics | A cookieless tool: Vercel Web Analytics (already on Vercel) or Plausible | Aggregate, no cookie banner needed when no cookies or personal identifiers are stored. Describe it in the privacy policy either way. | Vercel: free tier available; Plausible: paid (check current pricing) |
| If GA4 is preferred | GA4 with Consent Mode and a consent banner | UK PECR requires consent for analytics cookies | Free; adds a banner |
| Enquiry attribution | First page (with utm_ parameters), referring host and page before contact, sent with the enquiry | **Built locally** (commit `21afd32`); in memory only, no cookies or storage; works with any analytics choice | Done |
| Backlinks | Ahrefs Webmaster Tools (free with site verification) | Replaces the missing backlink data | Free |
| Keyword volumes | Google Keyword Planner (needs a Google Ads account, no spend required) | Fills the "not measured" column | Free |

Installing any of these involves an owner choice (vendor, privacy policy wording, account ownership), so nothing was installed in this session.

## Trackers

Two empty CSV templates, ready to copy into a spreadsheet:

- [measurement-tracker-enquiries.csv](measurement-tracker-enquiries.csv): one row per enquiry. The first page, referrer and page before contact come straight from the lines the enquiry email now carries; qualified, proposal and won are filled in by hand.
- [measurement-tracker-monthly.csv](measurement-tracker-monthly.csv): one row per month, from Search Console and the enquiry tracker. Brand vs non-brand uses the filter below.

## Reporting rhythm

- **Monthly, 30 minutes:** export GSC performance by page; fill the tracker; note the top five queries per service page; list pages with impressions but CTR under 1% (title or description rewrite), and queries in positions 8–20 (content to strengthen).
- **Quarterly:** enquiries → clients by source; referring domains; decide the next quarter's clusters.

## Brand vs non-brand

Because the brand name is shared with a mythological concept, filter brand as queries matching `chinvat` **and** a business term (`ltd|consult|seo|software|automation|ai|contact|pricing`). Treat other "chinvat" queries as mythology traffic: real, but not commercial.
