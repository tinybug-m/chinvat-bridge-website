# Conversion optimisation

Organic search only pays if a qualified visitor becomes an enquiry. Today there is one route (the homepage conversation), it doesn't record where the visitor came from, and the pages leading to it carry little proof.

## Current journey

```
Search → service page or article → "Start a conversation" / service CTA → /#contact (homepage) → chat form → email to the business
Search → /services/seo → /pricing → /subscribe/details → Stripe → client portal
```

What works: the conversation form is friendly, quick and accessible (it has a noscript fallback with the email address); every page ends with a CTA; SEO pricing is self-serve.

What leaks:

| Leak | Evidence | Fix | Who | Effort |
|---|---|---|---|---|
| No record of the page or query behind an enquiry | `enquiry.ts` emails name, email, company, interest and message only | Capture the first landing page, referrer and UTM in `sessionStorage` on arrival and send them with the enquiry; add them to the email | Dev | S–M |
| Every CTA sends the visitor to the homepage, away from the page they were reading | All CTAs go to `/#contact` | Pre-select the "Interested in" option from the page they came from (pass `?need=automation`), so the form starts where the visitor's thinking is | Dev | S |
| No proof near the CTA | No case studies; one client link (was dead) | Case studies (Scornik Gerstein; "how we built this site"); a "Recent work" block on the service pages | Owner/Editor | M |
| No named person | Competitors that convert show the founder | "Who you'll work with" with name, photo and two lines | Owner | S |
| No defined first step for AI, automation and software | "Scoped per project" | A productised first engagement with a fixed price, e.g. an operations review that ends in a written plan the client keeps | Owner | M |
| No company details | Footer has no number or address | Company number and registered office (once confirmed) | Owner | S |
| Pricing jargon | "Core Protocols", undefined "assets" | Plain inclusions; define an asset; state VAT | Owner | S |
| No phone or calendar | Email and form only | Optional: a booking link for a 20-minute call. A preference, not a necessity; many buyers prefer writing first. | Owner | S |

## What "qualified" means

Agree a definition before measuring, so the number means something:

> **Qualified enquiry:** a business (not a job seeker, student, vendor or agency pitch) with a described problem in one of the four services, a plausible budget for at least the smallest engagement, and a decision-maker or their delegate writing.

Tag each enquiry in a simple tracker (spreadsheet or the admin area): source page, service, qualified yes/no, outcome. That is the number the [measurement framework](15-measurement-framework.md) optimises.

## Copy on the CTAs (done locally on the new pages)

| Page | Primary CTA | Why |
|---|---|---|
| AI integration | Discuss an AI project | Specific; implies a conversation, not a sale |
| Workflow automation | Describe a process | Matches the first thing we need to know |
| Custom software | Describe what you need | Same |
| Closing blocks | "Tell us which task you’d like to take off your team" etc. | Restates the promise in the buyer's terms |

## Tests worth running once traffic exists

Only with enough enquiries to read a result (roughly 30+ per variant); until then, change one thing at a time and watch the trend.

1. Service-page CTA with a pre-selected need, versus without.
2. A "from £X" first-engagement line on one service page.
3. Homepage H1 option B, versus the brand line.
