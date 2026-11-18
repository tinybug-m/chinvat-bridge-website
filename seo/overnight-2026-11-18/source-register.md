# Source register

Every external source used in this programme, with the date it was accessed and the claim it supports. All were accessed on **18 November 2026** unless stated. "SERP" means a result seen through a web-search tool that approximates google.co.uk; it shows that a page appears for a query, not its position. Competitor figures are what the competitor publishes about itself and are not verified.

## The site itself

| Source | Supports |
|---|---|
| `https://www.chinvatbridge.com/` and every internal URL reached by the crawl | Status codes, titles, descriptions, canonicals, Open Graph, H1/H2, JSON-LD, links and word counts ([baseline](02-current-seo-baseline.md), [technical audit](03-technical-seo-audit.md)) |
| `https://www.chinvatbridge.uk/` | Second live host; canonical target; Cloudflare-managed robots.txt |
| `https://www.chinvatbridge.com/robots.txt`, `/sitemap.xml` | Sitemap and robots point at `.uk` |
| `dig` for chinvatbridge.com / .uk (A, CNAME, MX) | `.com` on Vercel with Google Workspace MX; `.uk` behind Cloudflare |
| Local lab runs (Playwright Chromium, 4× CPU, 1.6 Mbps, 150 ms RTT) | FCP, LCP, CLS, long-task time, transfer size |
| Repository at `64a4fc0` | `NEXT_PUBLIC_SITE_URL`, Supabase auth URLs, plans table, services, content |

## Facts about third parties

| Source | Supports |
|---|---|
| https://scornik.vercel.app/ | 404, `x-vercel-error: DEPLOYMENT_NOT_FOUND` |
| https://www.scornik.com/ | Production site of Scornik Gerstein LLP: 200, Vercel, Next.js, hero "Your London Solicitors for…", no builder credit |
| https://www.sra.org.uk/consumers/register/organisation/?sraNumber=565232 (via search result) | Scornik Gerstein LLP is SRA-regulated; website www.scornik.com |
| https://find-and-update.company-information.service.gov.uk/search/companies?q=chinvat | No company containing "chinvat" (checked twice, by two methods) |
| WebSearch "Chinvat Bridge" | Brand SERP is entirely mythology results |

## Market data

| Source | Supports |
|---|---|
| ONS, Business insights and impact on the UK economy, 8 October 2026 — https://www.ons.gov.uk/businessindustryandtrade/business/businessservices/bulletins/businessinsightsandimpactontheukeconomy/8october2026 | 30% of UK businesses used at least one AI technology in September 2026 (9% in September 2023); 51% of businesses with 250+ employees |
| ONS, same series, 2 July 2026 | 29% in June 2026; LLM text generation 17% |
| DSIT, AI adoption survey 2026, executive summary, published 29 October 2026 — https://www.gov.uk/government/publications/ai-adoption-survey-2026/ai-adoption-survey-report-2026-executive-summary | 32% of UK businesses used at least one AI technology (16% in 2025); "Limited AI skills, expertise or knowledge affected 67% of businesses that had adopted AI, and 78% of those planning to adopt it" (verified against the page 18 Nov 2026); 3,503 interviews, January–April 2026 |

## Crawler documentation

| Source | Supports |
|---|---|
| https://platform.openai.com/docs/bots | GPTBot (training) is separate from OAI-SearchBot (ChatGPT search) and ChatGPT-User |
| https://support.claude.com/en/articles/8896518 | ClaudeBot (training) vs Claude-SearchBot and Claude-User (search and retrieval) |
| https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers | Google-Extended doesn't affect Google Search inclusion or ranking |
| https://docs.perplexity.ai/guides/bots | PerplexityBot is used for search, not training |

## Keyword evidence

| Source | Supports |
|---|---|
| `https://suggestqueries.google.com/complete/search?client=firefox&hl=en-GB&gl=gb&q=…` (about 60 seed queries with suffix sweeps) | Every "autocomplete-observed" tag in [keyword research](05-keyword-research.csv) |
| https://ahrefs.com/keyword-generator | Tried for volumes; no figures exposed without login. Hence "not measured" throughout. |
| WebSearch, about 30 commercial queries across the four services and verticals | Every "SERP observation" tag; ranking URLs seen |

## Competitors and benchmarks

| Source | Supports |
|---|---|
| https://www.softomatesolutions.com/ai-automation-agency-london/ | Price signals (from £1,500 workflow), case-study format, named company details |
| https://www.cloudswitched.com/services/ai | Cost ranges (£3,000–£5,000; £15,000–£50,000+), no proof |
| https://whitehat-seo.co.uk/blog/ai-consulting-for-small-business | Pillar-and-cluster structure; AI consulting price ranges |
| https://www.pulsion.co.uk/automation-consulting-services | Established studio page structure |
| https://ficode.com/services/bespoke-software-development-company | Bespoke software price range (£10,000–£200,000) |
| https://www.doublespark.co.uk/peterborough/websites/custom-web-application-development | Long local-modifier page |
| https://slink.co.uk/build/internal-tools | Short page with a sharp spreadsheet hook |
| https://n8nlab.io/n8n-automation-agency-london | Tool-specialist positioning; listicle tactic |
| https://digitaladaption.co.uk/business-process-automation-consultant-uk/ | Solo consultant ranking for the core automation query |
| https://www.designrush.com/agency/profile/flowmondo | Partner badges and reviews as trust |
| https://www.designrush.com/agency/profile/campbell-consultancy | £450 audit, ownership/no lock-in promises |
| https://www.lilachbullock.com/ai-consultants-uk-small-business/ | Independent AI consultant; day-rate claims (£400–£900) |
| https://www.chrisleverseo.com | Independent technical SEO; £70/hour |
| https://seosherpa.com/uk-en/services/technical-seo/ | SEO pricing (£500–£8,000/month; audit £1,000–£5,000) |
| https://profiletree.com/seo-for-small-businesses/ | "From around £300 to £1,200 a month" |
| https://clutch.co/profile/vectis-studio; https://www.designrush.com/agency/profile/tinyops-studio-llc; https://zapier.com/partnerdirectory/partner/fractional-hq | Positioning substitutes for proof |
| https://www.visionary-marketing.co.uk/blog/seo-pricing-uk-what-you-should-pay; https://whitehat-seo.co.uk/blog/seo-costs; https://www.limelightdigital.co.uk/seo-cost-uk/ | Published UK SEO cost ranges (vendor-stated) |
| https://ink-digital.co.uk/services/seo/website-audit/ | SEO audit price anchor (£495 + VAT, vendor-stated) |

## Authority opportunities

| Source | Supports |
|---|---|
| https://help.clutch.co/knowledge/free-features-clutch-offers; https://clutch.co/clutch-plus | Free Clutch profile; Verified tier about $499/year |
| https://www.crowncommercial.gov.uk/agreements/RM1557.15 | G-Cloud 15 runs from 6 August 2026 |
| https://n8n.io/experts/ | n8n expert programme: needs at least three active n8n customers |
| https://zapier.com/experts/apply | Zapier partner application exists (requirements not extracted) |
| https://www.smetoday.co.uk/editorial-submission-guidelines/ | SME Today contributor route (600–1,200 words) |
| https://smallbusiness.co.uk/?p=2545092 (via search) | Small Business UK contributor guidance |
| https://www.featured.com/pricing | Free journalist-request tier |

## Could not be verified

Search Console and analytics data; Google index status; any keyword volume; backlink metrics for any domain; GoodFirms, DesignRush, Sortlist and The Manifest pricing; Make, HubSpot, Xero, Supabase, Vercel, Stripe and Webflow partner requirements; contributor routes for TechRound, UKTN, Maddyness UK, Computer Weekly, BusinessCloud and Business Leader; Qwoted and ResponseSource pricing.
