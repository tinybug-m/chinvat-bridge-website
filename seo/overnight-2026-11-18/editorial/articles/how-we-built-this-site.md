---
status: draft — for owner review, not published
slug: how-we-built-this-site
url: /insights/how-we-built-this-site   # or /work/chinvat-bridge-website if a Work section is added
seo_title: "How We Built Our Site, Portal and Checkout"
meta_description: "A look inside our own website: a custom Next.js build with a client portal, Stripe subscriptions, sign-in, and the technical SEO we sell, all on one stack."
h1: "How we built our own site, client portal and checkout"
primary_keyword: custom web application with client portal and subscriptions
secondary_keywords:
  - next.js supabase stripe
# 'client portal development' belongs to /services/custom-software.
  - subscription website development uk
  - technical seo next.js
search_intent: commercial investigation (proof)
audience: Owners and operations leads checking whether Chinvat Bridge can actually build what its software and SEO pages describe
funnel_stage: decision
strategic_purpose: >
  Proof without inventing anything. The business has one client project and no case studies, but
  its own site is a real, inspectable piece of custom software: sign-in, a client portal, Stripe
  subscriptions, an admin area and careful technical SEO. Every fact here comes from the
  repository. It links from /services/custom-software ("How we build") and /services/seo.
service_page: /services/custom-software
category: Software Strategy
tags: [software, web, seo, case-study]
reading_minutes: 7
internal_links:
  - anchor: "custom software"
    href: /services/custom-software
  - anchor: "SEO service"
    href: /services/seo
  - anchor: "client portal preview"
    href: /client-portal
  - anchor: "When should a business build custom software?"
    href: /insights/when-should-a-business-build-custom-software
external_references: []
cta: "Describe what you need → /#contact"
schema: Article, BreadcrumbList
review_notes:
  - "All facts are from the repository on 18 Nov 2026: package.json (Next.js 16, React 19, Supabase, Stripe, three.js), src/actions/auth.ts (magic link and Google sign-in), src/app/api/webhooks/stripe/route.ts (checkout completed, payment failed, subscription deleted), supabase/migrations (customers, plans, updates, progress and sprint items), tests/e2e (13 specs; 375 test runs across three viewports on 18 Nov 2026)."
  - "Lab performance figures are from this session's runs (Chromium, 4x CPU slowdown, 1.6 Mbps, 150 ms latency, 18 Nov 2026), labelled as lab results. Re-run before publishing, and prefer field data from Search Console once it exists."
  - "The paragraph on what we would do differently is honest by design (the homepage's main-thread cost, the domain split). Keep it; it is what makes the piece credible. Remove the domain sentence if the owner prefers, but only once the fix is live."
  - "Check with the owner that describing the admin area and webhook flow at this level is fine from a security point of view. Nothing here reveals configuration or secrets."
---

# How we built our own site, client portal and checkout

We sell custom software and SEO, so our own website has to do both properly. It isn't a template. It is a custom application in which clients can subscribe to an SEO plan, sign in, and follow their project in a portal, and its technical SEO is built in rather than bolted on. This is how it is put together, what we chose and why, and what we'd do differently.

## What the site has to do

Beyond explaining what we offer, the site runs part of the business:

- **Take subscriptions.** A visitor can choose an SEO plan, enter their business details and pay, without a call or an invoice.
- **Create the client's account automatically** once payment succeeds.
- **Give each client a portal** showing the progress of their engagement, the current sprint, and an archive of updates and reports, visible only to them.
- **Give us an admin area** to manage clients and post updates.
- **Be found.** Fast pages, clean structure and accurate structured data, because that is the work we do for clients.

## The stack, and why

We chose mainstream, well-documented tools, so the site is easy to host, secure and hand over:

- **Next.js and React, in TypeScript.** Pages are rendered on the server or generated in advance, so search engines and visitors get complete HTML straight away, while interactive parts such as the contact conversation run in the browser.
- **Supabase (PostgreSQL)** for data and sign-in. Clients sign in with a one-time link sent by email, or with Google. Row-level security in the database means each client can only ever read their own records, enforced by the database itself rather than by page code alone.
- **Stripe** for payments. Card details never touch our servers.
- **Vercel** for hosting.

It is the stack we propose for [custom software](/services/custom-software) for clients, too.

## How a subscription becomes a portal

1. The visitor picks a plan on the pricing page; plan details live in the database, so prices and inclusions can change without a code release.
2. They enter their business details, and the site creates a Stripe Checkout session.
3. When Stripe confirms the payment, it notifies the site through a signed webhook. The site verifies the signature, creates the client's account and records the subscription.
4. The client signs in and lands in their portal. If a payment later fails or the subscription is cancelled, Stripe tells the site the same way and the account is updated.

The webhook is the part that most often goes wrong in subscription sites. Ours rejects anything that isn't signed by Stripe, and creating the account is an "insert or update", so a notification that arrives twice does no harm. You can see the shape of the portal in our [client portal preview](/client-portal), which uses illustrative data.

## Technical SEO, built in

The things we check on client sites are part of this one's code:

- **Every page describes itself:** its own title, description, canonical URL and social card, generated from one helper so no page silently inherits the homepage's.
- **Structured data** connects the organisation, its services and its articles, so search engines can tell what the business offers and who wrote what.
- **The sitemap only claims real dates:** each article's own publication date, and each service page's last real change, never the build time.
- **Private pages stay private:** sign-in, checkout and portal pages are marked `noindex`, and the portal redirects anyone not signed in.
- **Accessibility and performance** are treated as part of the job: one heading structure per page, descriptive link text, form fields with the right autocomplete purposes, generous tap targets, and motion that respects the reduced-motion setting.

In our own lab tests on a throttled mobile profile, the inner pages reach their largest content in under two and a half seconds with no measurable layout shift. Lab tests aren't real-visitor data, and we'll publish field figures once we have them.

## How we keep it working

The site has an end-to-end test suite of more than a hundred tests, each run at desktop, tablet and phone sizes. It covers navigation, the contact conversation (including what happens when sending fails), every route's metadata, the sitemap's dates, and the service pages' structured data. Alongside the production build, the type checks and the linter, it is how we check a change before it goes live.

## What we'd do differently

- **The homepage does a lot of drawing.** The animated diagrams are part of who we are, but on a mid-range phone they keep the browser busy during load. They don't delay the main content, and we are measuring real-visitor responsiveness before deciding whether to defer some of the work.
- **Domains.** For a while the site answered on two domains, with search engines told to prefer the one we were leaving. It is exactly the kind of quiet problem a technical audit exists to catch, and we caught it in ours.

## What this means if you're a client

The same approach applies to your project: mainstream tools, a database that enforces who can see what, payments handled by a specialist provider, tests we run before we release, and technical SEO designed in from the start. It's also why we'll often suggest something smaller than you expect. [When should a business build custom software?](/insights/when-should-a-business-build-custom-software) explains when we think building is worth it.

If you have a portal, a booking flow or an internal tool in mind, [describe what you need](/#contact). Or read about our [custom software](/services/custom-software) and [SEO service](/services/seo).
