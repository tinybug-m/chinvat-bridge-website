/*
 * Content for /services/seo. Every claim here is traceable to the business as
 * the codebase records it:
 *   - what each plan includes: the plans table (supabase/migrations/20260915090000_create_plans_and_updates.sql)
 *   - billing, notice, no guarantees, client access: /terms
 *   - the client dashboard: dashboard/page.tsx and organisms/dashboard/Real*
 *   - the problems: the article "Why your website isn't bringing you customers"
 * Prices and per-plan quantities are deliberately absent: /pricing is the one
 * source for those. No results, clients or testimonials are claimed.
 */

export const SEO_SERVICE = {
  path: "/services/seo",
  /** The service's name, as on the homepage plate. */
  name: "SEO & Digital Growth",
  /** When this page's content last changed (sitemap lastmod). */
  updated: "2026-11-04",
  title: "SEO Services & Digital Growth",
  description:
    "Technical SEO, content strategy, link building and digital PR that improve how your business is found in search. Monthly SEO retainers or a custom scope.",
  h1: "SEO that makes your business easier to find",
  lede: "We fix what stops search engines understanding your site, plan and write content around what your customers search for, and build authority through link building and digital PR.",
} as const;

export interface TitledText {
  title: string;
  body: string;
}

export interface Offering extends TitledText {
  /** Which plans include it, in words; quantities stay on /pricing. */
  scope: string;
}

export const SEO_PROBLEMS: TitledText[] = [
  {
    title: "You don’t appear for the searches that matter",
    body: "Search engines rank pages for the words people type. If your pages don’t describe your services and the problems you solve in plain language, there is little for them to rank, however good the design.",
  },
  {
    title: "Technical issues hold your pages back",
    body: "Missing or duplicate titles, pages blocked from indexing, no clear structure between pages, missing structured data, a site that is slow on a phone. Each one limits how well search engines can crawl and understand what you offer.",
  },
  {
    title: "Content doesn’t match what people are looking for",
    body: "A page can be well written and still miss. If someone wants a comparison, a price or an answer to a question and lands on a general sales page, they leave, and the page has little reason to rank for that search.",
  },
  {
    title: "Nothing is building your authority",
    body: "Links from relevant, credible sites help search engines judge which pages to trust. Without a steady way to earn them, good content can stay behind pages that are simply better known.",
  },
];

export const SEO_OFFERINGS: Offering[] = [
  {
    title: "Technical SEO audits and fixes",
    body: "We audit how search engines crawl, index and read your site: titles and meta data, duplicate pages, indexing directives, structured data and Core Web Vitals. Then we fix what we find and keep monitoring performance as the site changes.",
    scope: "Every plan. The depth of the audit depends on the plan.",
  },
  {
    title: "Site architecture and on-page optimisation",
    body: "How your pages are organised and linked decides how easily people and search engines move through them. We tidy the structure and internal links, and optimise each important page’s title, headings and copy for the search it should answer.",
    scope: "On-page work in every plan. Deeper crawl and architecture work on Growth; multi-region architecture and hreflang on Scale.",
  },
  {
    title: "Keyword research and content strategy",
    body: "We research the terms your customers actually use, look at which competitors appear for them and why, and plan which pages should answer which searches, so content is written with a purpose.",
    scope: "Every plan, from a basic strategy on Starter to a full one on Scale.",
  },
  {
    title: "SEO content production",
    body: "We produce the content the strategy calls for, each piece planned around a specific search and written to be useful to the person making it.",
    scope: "Every plan. The plan sets how much content is produced each month.",
  },
  {
    title: "Link building and digital PR",
    body: "We earn links through targeted digital PR and editorial outreach: putting your expertise and content in front of relevant publications and sites that link to sources their readers will find useful.",
    scope: "Growth and Scale plans.",
  },
  {
    title: "Monitoring and reporting",
    body: "A monthly report sets out the work done and how your search performance is moving. Your client dashboard shows project progress, the current sprint and an archive of updates in between.",
    scope: "Every plan.",
  },
];

export const SEO_APPROACH = {
  intro:
    "The three depend on each other, so we start with the foundations and then keep all three moving together.",
  parts: [
    {
      title: "Foundations",
      body: "Content and links do little for pages search engines can’t crawl, index or understand. Technical work comes first, and continues as the site changes.",
    },
    {
      title: "Content",
      body: "With the foundations sound, content is planned around what people actually search for, so every page has a clear job and a clear search to answer.",
    },
    {
      title: "Authority",
      body: "Links from relevant sites tell search engines which pages deserve trust. They work best pointing at content that is worth linking to.",
    },
  ] satisfies TitledText[],
  note: "Search engines decide rankings, and nobody can promise them. We don’t guarantee positions, traffic or revenue. What we do commit to is the work in your plan, done properly, with every month’s changes and results set out in your report.",
};

export const SEO_DELIVERABLES = {
  start: {
    title: "When we begin",
    items: [
      "A technical SEO audit of your site",
      "Keyword research for your services and markets",
      "Competitor analysis",
      "A content strategy built on that research",
      "Access to your client dashboard",
    ],
  },
  monthly: {
    title: "Every month",
    items: [
      "Technical fixes and Core Web Vitals monitoring",
      "On-page optimisation",
      "New SEO content, in the volume your plan sets",
      "Link building and digital PR, on Growth and Scale",
      "A monthly report",
      "Support by email, or priority support on Growth and Scale",
    ],
  },
  note: "Plans differ in content volume, audit depth, link building and support. The pricing page sets out exactly what each one includes.",
};

/** What each shared PROCESS_STEPS step means for SEO, keyed by step title. */
export const SEO_PROCESS_NOTES: Record<string, string> = {
  Discover: "For SEO: your site, your market and where you stand in search today, starting with the audit and keyword research.",
  Define: "Which fixes, pages and searches matter most, set out in the content strategy.",
  Build: "Technical fixes, on-page work and content, plus link building on Growth and Scale.",
  Improve: "Each monthly report shows what changed, and the next month’s work follows from it.",
};

export const SEO_ENGAGEMENT = [
  "SEO is offered as a monthly retainer in three plans: Starter, Growth and Scale. They share the same foundations and differ in content volume, audit depth, link building and level of support. The pricing page is where you’ll find the prices, what each plan includes, and how to subscribe.",
  "Retainers are billed monthly with no long-term contract, and we ask for 30 days’ notice to cancel. If you need something a plan doesn’t cover, such as SEO alongside AI, automation or software work, we’ll scope a custom package.",
];

export const SEO_FAQS: { question: string; answer: string }[] = [
  {
    question: "How long does SEO take to show results?",
    answer:
      "It depends on where your site starts, how competitive your searches are and how quickly changes can be made. Technical fixes can take effect once search engines recrawl the pages involved; content and authority build up over months rather than weeks. We’d rather say that plainly than promise a date, and your monthly report shows what is moving in the meantime.",
  },
  {
    question: "Do you work with existing websites?",
    answer:
      "Yes. The SEO plans work on the site you already have. We’ll need access to systems such as your analytics and Google Search Console. If the site itself needs rebuilding, that is a software project, quoted and agreed separately.",
  },
  {
    question: "What is included in your SEO services?",
    answer:
      "Every plan includes technical SEO, on-page optimisation, keyword research, competitor analysis, a content strategy, new content each month and a monthly report. Growth and Scale add link building and digital PR, and Scale adds multi-region architecture for international sites. The pricing page lists each plan in full.",
  },
  {
    question: "Do you provide content and link building?",
    answer:
      "Content, yes, on every plan, planned from the keyword research and content strategy. Link building and digital PR are part of the Growth and Scale plans; Starter concentrates on technical and on-page foundations and content.",
  },
  {
    question: "Do you work with businesses outside the UK?",
    answer:
      "Yes. We’re based in the UK and work remotely with businesses elsewhere. For sites that target more than one country or language, the Scale plan includes multi-region site architecture and hreflang, which tells search engines which version of a page is meant for which audience. Plans are priced in pounds sterling.",
  },
  {
    question: "Do you guarantee rankings?",
    answer:
      "No. Rankings are decided by search engines, and a guarantee would be a promise about something nobody outside them controls. Our terms say the same. What we commit to is the work in your plan, done properly and reported every month.",
  },
  {
    question: "How do we get started?",
    answer:
      "Choose a plan on the pricing page and subscribe: you enter your business details, pay securely through Stripe, and we get in touch to begin onboarding, with access to your client portal. If you’re not sure which plan fits, or need a custom scope, start a conversation and tell us about your website.",
  },
];

/** Existing articles that genuinely help someone weighing SEO, with why. */
export const SEO_RELATED_INSIGHTS: { slug: string; reason: string }[] = [
  {
    slug: "why-your-website-isnt-bringing-you-customers",
    reason: "Three checks to run before assuming you need more traffic, and the signs that the real problem is technical SEO.",
  },
];

/** Services that hand off to or from SEO. Each links to what exists today. */
export const SEO_RELATED_SERVICES: { title: string; href: string; reason: string }[] = [
  {
    title: "Custom software development",
    href: "/#services-software",
    reason: "When the site itself is the problem, a rebuild or a new web application is software work, scoped separately from SEO.",
  },
];
