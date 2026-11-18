# On-page audit

Page by page: does each page serve a distinct search intent, say something useful, and lead somewhere? Technical issues are in the [technical audit](03-technical-seo-audit.md); this file covers copy, structure, intent and conversion.

## Homepage

**Intent it should serve:** brand searches, plus broad "AI, automation and software for small businesses" consideration. It is the router to four service pages.

| Element | Live today | Assessment | Action |
|---|---|---|---|
| Title | Chinvat Bridge — AI, Automation, Software & SEO | Leads with a name whose SERP belongs to mythology; says nothing about the buyer | **Changed locally:** AI, Automation & Custom Software for UK SMEs — Chinvat Bridge |
| Description | UK-based technology consultancy helping businesses solve practical operational and digital problems… | Accurate but generic ("practical operational and digital problems") | **Changed locally:** names the buyer and the four services in 154 characters |
| H1 | Cross the bridge. Enter the future. | A brand line. Tells neither a visitor nor a search engine what the company does. | Owner decision, options below |
| Lede | We bridge the gap between complex challenges and intelligent technology: AI and automation, custom software, SEO, and data analytics. | Does the descriptive work. "Complex challenges" and "intelligent technology" are abstract. | Optional tightening, below |
| Service plates | Three of four linked to articles ("Read the article") | Sent commercial interest to informational pages | **Changed locally:** all four link to their service page ("Explore the service") |
| Recent work | Scornik Gerstein link dead | The only real proof sent people to an error | **Fixed locally:** production URL |
| Capabilities | Six names (LLMs & Models, Workflows & APIs…) | Fine as a type specimen; adds little for search | No change |
| About | Quote and name origin | Distinctive and well written; no named person | Consider adding the founder's name and role (owner decision) |
| Contact | Conversation form | Clear and well built; the only conversion path | See [conversion optimisation](14-conversion-optimisation.md) |

### H1 options for the owner

The H1 is built into the hero design and is the desktop LCP element, so any change should keep its length and rhythm.

- **Option A (keep, now recommended):** "Cross the bridge. Enter the future." Rely on the new title and the lede for relevance. Cost: the most prominent text on the site carries no meaning for a first-time visitor.
- **Option B (tested, not recommended as written):** "Cross the bridge. / Practical AI and software for your business." Rendered on 18 Nov 2026 in a local build: at the hero's display size the H1 grows from 2 lines to 4 on both desktop (166 px to 332 px tall) and mobile (87 px to 173 px), and pushes the eyebrow up under the header. See the screenshots: [A desktop](assets/h1-option-a-desktop.png), [B desktop](assets/h1-option-b-desktop.png), [A mobile](assets/h1-option-a-mobile.png), [B mobile](assets/h1-option-b-mobile.png). A descriptive second line would need to stay within about 18 characters, the length of "Enter the future.", to keep two lines; for example "Automate the rest." or "Better systems.", neither of which says much more than the current line.
- **Option C:** move the brand line to the eyebrow and make the H1 "Practical AI, automation and software for UK SMEs." This is the clearest for search and the biggest change to the design.

### Lede, optional

Current: "We bridge the gap between complex challenges and intelligent technology: AI and automation, custom software, SEO, and data analytics."
Suggested: "We connect the tools your business already uses, automate the manual work between them, and build the software and AI that off-the-shelf can’t, then help the right customers find you." This matches the [positioning](01-business-positioning.md) statement. Check it against the three-line limit noted in `crossing-content.ts` before adopting it.

## Service pages

### /services/seo (existing)
Strong: 1,570 words, specific deliverables, an honest "no guarantees" note, FAQs that answer real questions, and links to pricing. Issues:
- **Title** "SEO Services & Digital Growth" is acceptable. "SEO Services for UK Small Businesses" would match the buyer better; it is optional and not changed.
- **Related services** linked to a homepage anchor for software. **Fixed locally**, and the automation page added (enquiry follow-up is the natural hand-off).
- **No price signal on the page itself.** It links to /pricing, which is right, but one sentence such as "Plans start at £299 a month" would answer the most common question without a click. Owner decision, because prices live in the database.

### /services/ai-integration, /services/workflow-automation, /services/custom-software (new, local)
Each is about 1,400–1,700 words, built from the same blocks as the SEO page: problem, what we do, examples (labelled as patterns, not results), approach, process, how projects start, FAQs, related reading. Copy rules followed throughout:
- no prices, timelines, percentages, client counts or testimonials;
- platform names only where the site already uses them (Zapier and Make, from the automation article);
- the stack named on the software page is the one this repository uses, and the site itself is offered as the evidence;
- data protection is addressed as advice ("your obligations under UK GDPR stay with you"), not as a certification.

**Claims the owner should confirm before deploying** are listed in the [handoff](HANDOFF.md#decisions-requiring-human-approval).

## /pricing

**Intent:** "SEO packages UK", "SEO pricing UK" and bottom-funnel buyers. Publishing pounds-sterling prices is a real differentiator; several of the competitors reviewed hide theirs.

| Issue | Evidence | Recommendation (owner; plans live in the production database) |
|---|---|---|
| Starter contradicts itself | Spec row "Technical SEO audit: Basic", but the capability list says "Full technical SEO audit & continuous remediation" | Pick one. If Starter's audit is basic, say "Technical SEO audit and ongoing fixes". |
| Jargon headings | "Core Protocols", "Expanded Capability", "Full Scope", "content velocity", "dynamic schema engineering", "schema pipelines" | Plain labels: "Also included", "Adds", and concrete descriptions of what is done |
| "Assets" undefined | 8 / 15 / 35 "assets / mo" | Define an asset (an article? an optimised page? a social post?). 35 pieces a month at £799 invites doubts about quality unless it is explained. |
| Possible over-claims for a small firm | Scale: "Enterprise-grade positioning", "Dedicated senior SEO consultant" | Keep only what is literally true today |
| VAT not stated on the page | Prices shown without "+ VAT"; the terms say prices exclude applicable tax | Say "plus VAT where applicable" next to the prices |
| The page sells only SEO, but the custom card lists all four services | Correct structure | Add one line that AI, automation and software are quoted per project, linking to the three service pages |

## /insights and the articles

| Page | Assessment | Action |
|---|---|---|
| /insights | Title "Insights" is weak; H1 "Ideas & observations" is fine for brand | Optional title: "Insights: AI, Automation, Software & SEO for SMEs" |
| where-ai-can-save-your-business-time | Good. Specific, honest, answers first. Linked "process automation" and "AI integration" to `/#services` | **Fixed locally:** links to the service pages |
| what-should-you-automate-first | Good; the "frequency × frustration" heuristic is memorable and was reused on the automation page | **Fixed locally:** "workflow automation" links to its page |
| when-should-a-business-build-custom-software | Good; strongest commercial-investigation piece | **Fixed locally:** "software project" links to its page |
| why-your-website-isnt-bringing-you-customers | Good, but written for *local* businesses (Google Business Profile, "plumber in [town]"), while Chinvat's buyers are B2B SMEs. Says "starting with a full technical audit on every tier", which conflicts with Starter's "Basic" audit. | Owner: align the audit wording with the plans. Optional: add a short B2B section (lead forms, case studies, response time). |
| where-the-name-chinvat-bridge-comes-from | Distinctive, well sourced, owns a brand query | Keep |

All four client-facing articles are signed "Chinvat Bridge". A named author with a two-line bio would strengthen them, but only with a real person's agreement.

## Headings

- One H1 per page everywhere.
- The footer column titles ("Explore", "Disciplines", "Clients") are H2s on every page. They are harmless but add three generic H2s to each outline; turning them into styled `<p>` elements inside the existing `<nav aria-label>` would be cleaner. Not changed, since it touches every page's shell for a marginal gain.
- Homepage plate headings are H3 under an H2; correct.
