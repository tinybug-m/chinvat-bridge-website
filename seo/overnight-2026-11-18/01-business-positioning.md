# Business and audience positioning

## What the business is, on the evidence

Chinvat Bridge is a small, founder-led technology consultancy based in the UK and working remotely. It sells four things today:

| Service | How it is sold | Evidence it can be delivered |
|---|---|---|
| SEO & Digital Growth | Monthly retainers at £299, £499 and £799, self-serve through Stripe, plus custom scope | Plans table, terms, live checkout and client dashboard; this site's own technical SEO is well above the small-business norm |
| Software & Web | Quoted per project | This site (custom Next.js, Supabase auth, client portal, Stripe subscriptions, admin) and the Scornik Gerstein LLP website |
| Automation & Workflows | Quoted per project | Stated on the site; the codebase shows integration work (Stripe webhooks, Supabase, SMTP email). No client automation project is shown. |
| AI & Automation Integration | Quoted per project | Stated on the site, with a sensible article on where AI helps. No client AI project is shown. |

"Data analytics", "data integration", "Analytics & BI", "Technical Architecture" and "Digital Strategy" appear as supporting capabilities. They are best treated as **parts of the three operations services** (dashboards and reporting under software and automation; data integration under automation), not as standalone service pages. There is no evidence of BI-platform depth (Power BI, Looker) that would let a standalone BI page compete, and the keyword research found those SERPs dominated by specialists and directories.

## Who buys, and who is worth the effort

The research and the existing content point to the same buyer: **the owner, managing director or operations lead of a UK business with roughly 5–50 staff**. Their work runs on a handful of SaaS tools plus spreadsheets and email, they feel the cost of manual work between those tools, and they have no in-house developer.

| Segment | Why it matters | Verdict |
|---|---|---|
| UK service SMEs (professional services, trades with an office, agencies, clinics, small e-commerce) | Highest density of "tools that don't talk to each other" pain; buy on trust and clarity, not procurement | **Primary.** Write for them. |
| Professional services specifically (law, accountancy) | The one real client is a law firm; portals, intake and document workflows fit the offer | **Secondary overlay, later.** Needs a written case study first. |
| Founders and startups wanting an MVP | Demand exists ("mvp development uk"), but these are price-sensitive buyers chasing offshore quotes | Not a focus. Mention only as a use of custom software. |
| Mid-market and enterprise | Procurement, frameworks (G-Cloud), insurance and references a small firm lacks | Not now. |
| International | The site already says "working globally"; English-speaking markets search similar terms | Serve from the same pages. No country pages (see [complete strategy](09-complete-seo-strategy.md#international-expansion-opportunities)). |

### Verticals that were tested

| Vertical | Evidence | Fit | Landing page? |
|---|---|---|---|
| Automotive dealerships | Dealer search results belong to DMS vendors (Dragon2000, Pinewood, CDK) and trade press; no UK demand signal for independent integration consultancy; no proof of work | Weak: integrations run through incumbent DMS vendors and their partner programmes | **No.** Revisit only if a dealer client arrives. |
| Vehicle and van rental | Results are off-the-shelf SaaS (Coastr, RentSyst, Prohire); operators buy products, not builds | Weak | **No.** At most a use-case mention on the software page. |
| Law firms and solicitors | Real project; clear demand for legal web design and SEO; specialist agencies (Intellistart, MagnifyLab, WhiteHat, ProfileTree) own both SERPs; SRA marketing rules apply | Good *with* a case study | **Later.** One combined "websites and SEO for law firms" page after the Scornik Gerstein case study is written and approved. |
| Accountancy practices | Autocomplete shows "SEO for accountants" and portal demand; no work in the sector | Plausible | **Later.** |

Full evidence: [keyword research](05-keyword-research.csv) and the verticals section of [content gap analysis](08-content-gap-analysis.md).

## Recommended position

### Statement

> **Chinvat Bridge connects the tools a small business already uses, takes the manual work out of the gaps between them, and builds the small piece of software or AI that nothing off the shelf can do. Then it helps the right customers find you.**

Short form for titles and social: *Practical AI, automation and software for UK SMEs.*

### Why this position and not another

The [competitor analysis](07-competitor-analysis.md) tested three candidate positions. This combines the strongest parts of two and leaves out the third:

- **"Connect what you already have"** is the clearest single promise across AI, automation and software. It matches the plainest pain in the SERPs ("tools that don't talk to each other") and the voice of the existing articles, which tell readers to try what they already pay for first.
- **"Replace the workaround"** (spreadsheet to proper software) is the clearest *search gap*: UK results for replacing spreadsheets with custom software are mostly US low-code vendors, with few UK SME-focused answers. It becomes the hook for the software page and a flagship article, not the whole brand.
- **"Fixed-price operations review"** is the best *conversion* answer to having little proof, but a near-identical UK offer already exists (Campbell Consultancy, from £450), and pricing a new product is an owner decision. It is recommended as an offer to consider, not as the position.

### What makes it defensible for a small firm

1. **Honesty as a feature.** The existing articles already say "you may not need us for this one". Competitors publish unsourced percentages; candour is rarer and more believable. Keep it.
2. **One builder across the stack.** Competitors split websites, automation, AI and SEO between different firms or bolt them on. One engineer who can wire the CRM, build the portal and fix the site's technical SEO is a real advantage for an SME that wants one partner.
3. **The site is the proof.** Custom build, client portal, Stripe subscriptions, clean technical SEO. Say so on the software page (done) and in a case study about the site itself.
4. **Small first versions.** A defined first project with scope and cost agreed up front suits buyers who have been burned by large IT projects.

### What not to claim

- No percentages, hours saved, ROI, revenue or "trusted by" statements until a client has agreed to a measured case study.
- No partner badges or platform expertise (Zapier, Make, n8n, HubSpot, Xero, Power BI) beyond "we use connector platforms such as Zapier or Make where they fit". Expert-directory listings require customers and certifications that aren't evidenced yet.
- No "AI agency" framing. The research shows that searches for "AI automation agency" are dominated by people wanting to *start* one.
- No London or city pages. The site shows no local presence there (confirm with the owner); either way, city pages would be doorway pages.
- No "Ltd" or legal-entity claims until the registered company details are confirmed (see [technical audit T5](03-technical-seo-audit.md#t5-company-identity-is-not-verifiable--high-trust-and-compliance)).

## Messaging pillars for pages and articles

| Pillar | Says | Shows up as |
|---|---|---|
| Start from the work | We look at your week, not at the technology | Problem-first page sections; "where small businesses usually start" examples |
| Use what you already have | Check existing tools before building | FAQs on Zapier vs custom, off-the-shelf vs custom |
| Small, owned, maintainable | A defined first version, mainstream stack, documented | Software page "How we build"; automation "Alerts, logs and documentation" |
| Plain numbers | Agree what "working" means before building | "Measuring whether it works" offering; cost FAQs that explain what drives price |
| Found by the right people | SEO is part of the same craft | SEO page; websites built to be found |

## Open questions for the owner

1. The registered company name and number (the Companies House search found none).
2. Whether to name the founder on the site (named people are table stakes across the competitors that convert).
3. Which platforms the team genuinely delivers on (n8n? Make? Xero API? HubSpot?), so pages can name them.
4. Whether to productise a fixed-scope first engagement (an "operations review" or a "technical SEO audit"), and at what price.
5. Ownership and handover terms for software and automation (who owns code and accounts), which competitors rarely state and buyers value.
