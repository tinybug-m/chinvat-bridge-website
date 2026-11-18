# Executive summary

**Chinvat Bridge organic growth programme. 18 November 2026.**

## The situation

Chinvat Bridge has a well-built site, an honest voice and a sensible four-part offer: AI integration, workflow automation, custom software and SEO. Search engines could see very little of it:

- **The site points search engines at the wrong domain.** Both `chinvatbridge.com` and `chinvatbridge.uk` serve the full site, and every canonical tag, the sitemap and robots.txt name `.uk`, while the business runs its mail on `.com` and treats `.com` as primary. Until one domain redirects to the other, every ranking signal is split.
- **Three of the four services had no page.** Only SEO had one, so nothing could rank for "AI consultancy for small businesses", "business process automation consultant" or "bespoke software for small business".
- **Nothing is measured.** There is no analytics on the site, so enquiries can't be traced to the pages or searches that produced them.
- **Proof is thin and was partly broken.** The one real client link returned an error, there are no case studies, and no Companies House record could be found for "Chinvat Bridge Ltd".

## The position

> Chinvat Bridge connects the tools a small business already uses, takes the manual work out of the gaps between them, and builds the small piece of software or AI that nothing off the shelf can do. Then it helps the right customers find you.

The buyer is the owner or operations lead of a UK business with roughly 5–50 staff. The edge is candour (saying when not to buy), one builder across website, automation, AI and SEO, and the site itself as technical proof. Head terms belong to directories and large agencies; the plan goes after the long-tail commercial searches a specific, honest specialist can win.

## What was done this session (local, unpublished)

- **Three new service pages** (`/services/ai-integration`, `/services/workflow-automation`, `/services/custom-software`), linked from the nav, footer, hero, homepage and articles, with structured data and sitemap entries.
- **Technical fixes:** `.com` as the canonical origin in code and Supabase config; an offer-led homepage title; article structured data tied to the business; the dead client link replaced with the firm's live site.
- **Enquiry attribution:** each enquiry email now says which page started the visit, where the visitor came from, and the page they read before getting in touch. It is held in memory only, with no cookies.
- **Verified:** lint, types and production build pass; **280 end-to-end tests pass, none fail**, on desktop, tablet and mobile.
- **Eight full articles and a case study drafted** for review, chosen to fill the gap between reading and enquiring: replacing spreadsheets (the clearest UK search gap), SEO costs (using our real prices), connecting systems, choosing an AI consultant, technical SEO audits, and AI subscriptions vs integration.
- **A complete strategy:** technical and on-page audits, 79-keyword research (volumes honestly marked as not measured), competitor analysis, a keyword-to-URL map, 20 prioritised recommendations and a 90-day roadmap.

## The five things to do first

1. **Approve the service-page copy** (the commitments to confirm are listed in the [handoff](HANDOFF.md#decisions-requiring-human-approval)).
2. **Switch to `.com`:** Supabase site URL, the Vercel `NEXT_PUBLIC_SITE_URL`, deploy the branch, redirect `.uk`, then Search Console.
3. **Confirm the company's registered name and number**, and show them in the footer.
4. **Turn on measurement:** Search Console and cookieless analytics. Every enquiry email already records the page that prompted it (built locally).
5. **Publish the spreadsheet article and the SEO cost guide**, and ask Scornik Gerstein for a case study.

## What to expect

Domain consolidation and the new pages are foundations: visible in Search Console within weeks, in qualified enquiries within one or two quarters. No rankings or traffic figures are promised, because there is no baseline yet; the first month of data sets the targets. The single number that matters is **qualified organic enquiries per month**.

Start with the [handoff](HANDOFF.md), then the [90-day roadmap](10-90-day-roadmap.md).
