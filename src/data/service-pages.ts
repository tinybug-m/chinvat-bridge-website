import type { TitledText } from "@/data/seo-service";

/*
 * Content for the AI, automation and software service pages (the SEO page keeps its own
 * module, data/seo-service.ts). Each page answers one commercial search intent, set out in
 * seo/overnight-2026-11-18/11-service-page-strategy.md, and every claim traces to what the
 * site already offers:
 *   - the services and their tags: data/services.ts and data/capabilities.ts
 *   - the four-step process: data/process.ts
 *   - the advice and examples: the Insights articles each page links to
 *   - the stack: this repository (Next.js, React, TypeScript, Supabase, Stripe)
 * There are no prices, timelines, results, clients or testimonials beyond the one project the
 * homepage already shows. AI, automation and software work is quoted per project, so each page
 * sends people to the conversation, not to /pricing.
 *
 * `relatedInsights` may list draft articles: relatedInsightLinks() skips any slug that isn't
 * published, so each one appears here on the day it goes live, with no edit to this file.
 */

export type ServiceDiagram = "ai" | "automation" | "software";

export interface ServiceSectionContent<T> {
  title: string;
  intro?: string;
  items: T;
}

export interface ServicePageContent {
  path: string;
  /**
   * The service's own name: the kicker, the breadcrumb and the schema.org Service name. Shorter than
   * the homepage plate title, and distinct per page, so the AI page doesn't also claim "automation".
   */
  name: string;
  /** When this page's content last changed (sitemap lastmod). */
  updated: string;
  /** <title> before the site name, and the Open Graph title. */
  title: string;
  description: string;
  h1: string;
  lede: string;
  /** schema.org Service serviceType. */
  serviceType: string;
  diagram: ServiceDiagram;
  primaryCta: string;
  problems: ServiceSectionContent<TitledText[]>;
  offerings: ServiceSectionContent<TitledText[]>;
  examples: ServiceSectionContent<TitledText[]> & { note?: string };
  /** An optional plain section (heading and paragraphs), e.g. how the software is built. */
  detail?: { id: string; title: string; paragraphs: string[] };
  approach: { title: string; intro: string; parts: TitledText[]; note: string };
  /** What each shared PROCESS_STEPS step means for this service, keyed by step title. */
  process: Record<string, string>;
  engagement: string[];
  faqs: { question: string; answer: string }[];
  relatedInsights: { slug: string; reason: string }[];
  relatedServices: { title: string; href: string; reason: string }[];
  close: { title: string; lede: string; cta: string };
}

export const AI_SERVICE: ServicePageContent = {
  path: "/services/ai-integration",
  name: "AI Integration",
  updated: "2026-11-19",
  title: "AI Consultancy & Integration for SMEs",
  description:
    "AI consultancy and integration for small businesses, from a UK-based team: we find where AI reliably saves time, choose tools and connect them to your systems.",
  h1: "AI integration that earns its place in your business",
  lede: "We help small and growing businesses find the work AI can genuinely take on, choose tools that fit, and connect them to the systems and data you already use, with a person checking the output wherever it matters.",
  serviceType: "Artificial intelligence integration and consultancy",
  diagram: "ai",
  primaryCta: "Discuss an AI project",
  problems: {
    title: "Why AI often changes so little.",
    intro: "You may well have tried an AI tool already. When it changes little, the gap is rarely the technology; it is everything around it.",
    items: [
      {
        title: "Subscriptions, but no change in the work",
        body: "Licences get bought, a few people use them for drafting, and the way the business runs stays the same. A tool that isn’t connected to where the work happens can only ever help at the edges.",
      },
      {
        title: "It doesn’t know your business",
        body: "Out of the box, a general assistant doesn’t know your services, prices, policies or customers. Every answer needs checking and rewriting, and the time it was meant to save goes into editing.",
      },
      {
        title: "Nobody trusts the output",
        body: "Language models can state wrong things confidently. Without review steps and clear limits, one bad answer is enough for a team to stop using the tool, and the money is quietly written off.",
      },
      {
        title: "Data goes where it shouldn’t",
        body: "Pasting customer or financial information into a consumer tool raises data-protection questions under UK GDPR, or the law that applies where you are, that many small businesses haven’t had time to answer.",
      },
    ],
  },
  offerings: {
    title: "What we do.",
    intro: "From deciding whether AI is the right answer at all to the integration work that makes it useful day to day.",
    items: [
      {
        title: "Finding the opportunities worth doing",
        body: "We start from your week, not from the technology: the tasks that are repeated often, involve reading, writing or sorting information, and where getting most of the way there and having a person finish the job is still a clear win. You get our honest view of each, including the ones where AI isn’t the answer.",
      },
      {
        title: "Choosing tools and models",
        body: "Often the AI features already built into software you pay for are enough. Where they aren’t, we compare general-purpose assistants and language models on your real examples, weighing reliability, running costs and where your data is processed.",
      },
      {
        title: "Connecting AI to your systems",
        body: "Most of the value comes from the wiring. An enquiry arrives, its details are extracted, a reply is drafted, your CRM is updated and a person approves before anything is sent. We build those integrations into the email, CRM, helpdesk and document tools you already use.",
      },
      {
        title: "Assistants that work from your own information",
        body: "Internal assistants that answer from your documents, policies and records rather than from general knowledge, and can point to the source each answer drew on, so it can be checked.",
      },
      {
        title: "Guardrails and human review",
        body: "Where output reaches a customer or informs a decision, we build in review steps, limits on what the system may do on its own, and a record of what it did, so problems are caught early and can be traced.",
      },
      {
        title: "Measuring whether it works",
        body: "Before anything is built we agree what “working” means in numbers, such as minutes per task, first-response time or errors caught, so the result can be checked against it after launch and the approach changed if it isn’t delivering.",
      },
    ],
  },
  examples: {
    title: "Where small businesses usually start.",
    intro: "Typical first projects, described as patterns rather than client results. Each one is narrow, frequent and easy to check.",
    items: [
      {
        title: "Sorting and answering enquiries",
        body: "Incoming emails and form submissions are categorised, the key details pulled out, and a first reply drafted for someone to review and send.",
      },
      {
        title: "Summarising and extracting from documents",
        body: "Contracts, supplier terms and long email threads turned into short summaries, or into the specific fields your team would otherwise retype.",
      },
      {
        title: "First drafts from your own material",
        body: "Proposals, job adverts, product descriptions and reports drafted from your templates and data, so the hardest part of the job becomes editing rather than starting.",
      },
      {
        title: "Answering the questions you get every day",
        body: "An assistant that handles repeat questions from your own policies and hands anything unusual to a person, for staff or for customers.",
      },
    ],
  },
  approach: {
    title: "Practical before clever.",
    intro: "Three rules shape every AI project we take on.",
    parts: [
      {
        title: "Start from the task",
        body: "The useful question isn’t “what can AI do?” but “which task is costing us hours each week, and could a tool do most of it reliably?”",
      },
      {
        title: "Try the simplest option first",
        body: "If an off-the-shelf tool or a feature you already pay for will do, we’ll tell you, even when it means there is little for us to build.",
      },
      {
        title: "Keep a person where it matters",
        body: "Anything involving prices, legal terms, money or a customer’s trust gets a human check. Automation handles the volume; people keep the judgement.",
      },
    ],
    note: "AI tools make mistakes, and their behaviour changes as vendors update them. We don’t promise accuracy or savings we haven’t measured. We agree what success looks like before building, so the result can be checked against it.",
  },
  process: {
    Discover: "For AI: the tasks that eat your team’s time, the systems they touch, and the data involved.",
    Define: "Which task to start with, what “working” means in numbers, and which tool or model fits.",
    Build: "The integration, the review steps and the guardrails, tested on real examples from your business.",
    Improve: "Measured against the agreed numbers, then extended to the next task if it earns it.",
  },
  engagement: [
    "AI work is scoped per project rather than sold as a plan. It starts with a conversation about the task you want to improve and the systems involved. If AI is the right answer, we propose a defined first version, and its scope and cost are agreed before any work starts. If it isn’t, we’ll say so.",
    "If the work spans several areas, such as AI alongside automation, software or SEO, we can combine it into a custom package.",
  ],
  faqs: [
    {
      question: "Do we need custom AI, or will an off-the-shelf assistant do?",
      answer:
        "Often an off-the-shelf assistant, or the AI built into tools you already use, covers a large share of the job, and it is the right place to start. Custom integration makes sense when the tool needs to work with your own data, terminology or systems to be trustworthy, or when the same task has to run many times a day without someone copying text in and out.",
    },
    {
      question: "Is it safe to use AI with our customers’ data?",
      answer:
        "It can be, but it depends on the tool, its settings and the agreement behind it. The questions to settle are where data is processed and stored, how long it is kept, and whether it is used to train models; personal data should be kept out of AI steps that don’t need it. Your obligations under UK GDPR, or the data-protection law that applies to you, stay with you, so we raise these questions before anything is built.",
    },
    {
      question: "How much does AI integration cost?",
      answer:
        "It depends on the task, the systems involved and how much review the output needs. Connecting a feature you already pay for is a small job; an assistant built on your own documents is a larger one. Running costs matter as much as the build, since many AI services charge by use, so we estimate both before you commit.",
    },
    {
      question: "What happens when the AI gets something wrong?",
      answer:
        "We assume it sometimes will and design for it: review steps before anything reaches a customer, limits on what the system can do on its own, and a record of its outputs so mistakes can be spotted and traced. Where a task can’t tolerate errors, we’ll recommend keeping it manual.",
    },
    {
      question: "Do you work with businesses outside the UK?",
      answer:
        "Yes. We’re based in the UK and work remotely with businesses elsewhere. The approach is the same; the data-protection questions may differ, and we’ll raise them early.",
    },
  ],
  relatedInsights: [
    {
      slug: "where-ai-can-save-your-business-time",
      reason: "Which tasks AI handles reliably today, where it still isn’t worth the effort, and a three-question test for your first project.",
    },
    {
      slug: "what-should-you-automate-first",
      reason: "Many tasks people bring to AI are better solved by plain automation. This is how to tell, and where to start.",
    },
    {
      slug: "ai-subscriptions-vs-ai-integration",
      reason: "Why buying AI licences often changes little, and how to tell when one task is worth integrating.",
    },
    {
      slug: "how-to-choose-an-ai-consultant",
      reason: "The questions that separate practical help from hype, to ask of anyone you speak to, including us.",
    },
    {
      slug: "uk-small-business-ai-adoption-2026",
      reason: "What the official UK figures on AI adoption do and don’t say about businesses of your size.",
    },
  ],
  relatedServices: [
    {
      title: "Workflow automation and integration",
      href: "/services/workflow-automation",
      reason: "AI is usually one step in a larger workflow; this is the work of connecting the rest.",
    },
    {
      title: "Custom software",
      href: "/services/custom-software",
      reason: "When the task needs a tool of its own, such as an internal dashboard or portal with AI inside it.",
    },
  ],
  close: {
    title: "Tell us which task you’d like to take off your team.",
    lede: "Describe the work and the tools involved, and we’ll tell you whether AI is the right answer, and what we’d try first.",
    cta: "Discuss an AI project",
  },
};

export const AUTOMATION_SERVICE: ServicePageContent = {
  path: "/services/workflow-automation",
  name: "Workflow Automation",
  updated: "2026-11-19",
  title: "Business Process Automation & Integration",
  description:
    "Workflow automation and API integration for small businesses. We connect your CRM, accounts, inbox and spreadsheets so information moves without being retyped.",
  h1: "Workflow automation for the work between your systems",
  lede: "We design and build automated workflows that connect the tools you already use, so enquiries, orders, invoices and reports move between them without someone copying them across.",
  serviceType: "Business process automation and systems integration",
  diagram: "automation",
  primaryCta: "Describe a process",
  problems: {
    title: "Where the hours go.",
    intro: "In most small businesses the slow part isn’t any one tool. It’s the manual work of moving information between them.",
    items: [
      {
        title: "The same details, typed twice",
        body: "A customer’s details arrive by form, get entered into the CRM, then again into the accounts package. Every copy takes time and is another chance for a typo or a missed row.",
      },
      {
        title: "Handoffs that rely on memory",
        body: "A sale is won and someone has to remember to tell the person who handles onboarding. When they’re busy or away, things stall without anyone noticing.",
      },
      {
        title: "Reports built by hand",
        body: "Someone spends part of every week exporting figures from three systems and pasting them into a spreadsheet, and the numbers are out of date as soon as it is finished.",
      },
      {
        title: "Integrations that almost work",
        body: "The connector exists but doesn’t do quite what you need, or an automation someone set up years ago breaks quietly when a field changes and nobody finds out for weeks.",
      },
    ],
  },
  offerings: {
    title: "What we do.",
    intro: "Joining up the systems you already rely on, using the simplest approach that will run reliably.",
    items: [
      {
        title: "Mapping the process as it really runs",
        body: "We write down how the work actually happens today, not how it is supposed to, and find the steps worth automating. Steps that exist only “just in case” are fixed or removed first, because automating a broken process just makes it break faster.",
      },
      {
        title: "Connecting the tools you already use",
        body: "Built-in automation and connector platforms such as Zapier or Make are often the fastest and cheapest route, and we use them where they are reliable enough for the job.",
      },
      {
        title: "Custom API integrations",
        body: "When systems have no connector between them, or the rules are too specific for one, we build the integration against each system’s API directly: webhooks, scheduled syncs, data clean-up and proper handling of errors.",
      },
      {
        title: "Automated reporting",
        body: "Figures pulled on a schedule from the systems that hold them into one report or dashboard, so nobody has to compile it and everyone sees the same numbers.",
      },
      {
        title: "AI steps inside a workflow",
        body: "Where a step needs something read or written, such as classifying an email or pulling fields from an invoice, we add AI to the workflow with a review step where the result matters.",
      },
      {
        title: "Alerts, logs and documentation",
        body: "Automations fail quietly when a password, field or API changes. We build in alerts and logs, and write down how each workflow works, so it doesn’t become a black box nobody dares touch.",
      },
    ],
  },
  examples: {
    title: "Where automation usually pays back first.",
    intro: "The processes small businesses most often automate first. Each is frequent, rule-based and involves moving information between systems.",
    items: [
      {
        title: "New enquiries and leads",
        body: "A form or email creates the CRM record, sends the acknowledgement and assigns a follow-up task, instead of someone doing all three by hand.",
      },
      {
        title: "Invoices and expenses",
        body: "Supplier invoices and receipts read into your accounting software rather than retyped, using the accounting package’s own tools or an integration.",
      },
      {
        title: "Reminders and follow-ups",
        body: "Appointment confirmations, review requests a set number of days after a job, and renewal reminders before a contract lapses.",
      },
      {
        title: "Reports compiled by hand",
        body: "The weekly or monthly report someone builds by opening several tools. If the data lives in software with an API or an export, it can usually be automated.",
      },
      {
        title: "Handoffs between teams",
        body: "A job marked won, complete or paid automatically tells the next person what to do, with the details they need.",
      },
      {
        title: "Records that should match",
        body: "Customer, product or stock details changed in one system and updated everywhere else, so nobody is working from an old copy.",
      },
    ],
    note: "To choose between candidates, weigh how often a task happens against how much the person doing it dreads it. Frequency multiplied by frustration is usually a better guide than frequency alone.",
  },
  approach: {
    title: "Simple, reliable, written down.",
    intro: "How we decide what to automate and how to build it.",
    parts: [
      {
        title: "Fix the process first",
        body: "Before automating anything, we check the process is worth repeating exactly as it is. Often the biggest saving comes from removing a step, not automating it.",
      },
      {
        title: "Use what you already pay for",
        body: "Your CRM, accounts package or helpdesk may already automate part of the job. We check that before suggesting anything new, and tell you when it’s free.",
      },
      {
        title: "Build for the day it breaks",
        body: "Every workflow eventually meets an input it didn’t expect. We plan for that with alerts, retries and a record of what happened, so problems surface rather than hide.",
      },
    ],
    note: "Automation pays for itself only if it keeps running. If a process happens too rarely to repay the work, or needs a judgement call every time, we’ll recommend leaving it manual.",
  },
  process: {
    Discover: "For automation: the process as it runs today, the systems it touches and where the time goes.",
    Define: "Which steps to automate first, which to remove, and whether a connector or a custom integration fits.",
    Build: "The workflow, its error handling and alerts, and documentation of how it works.",
    Improve: "Watching it run on real work, then automating the next process when the first has earned it.",
  },
  engagement: [
    "Automation work is scoped per project. It starts with you describing the process: what happens, which tools are involved and where it hurts. We then tell you whether it is a quick win, a bigger project or something your existing software can already do, and agree scope and cost before any work starts.",
    "If the work spans several areas, such as automation alongside AI, software or SEO, we can combine it into a custom package.",
  ],
  faqs: [
    {
      question: "Should we use Zapier or Make, or a custom integration?",
      answer:
        "Connector platforms are usually the right start: quick to set up, easy to change, and good for moderate volumes between popular tools. Custom integration makes more sense when a system has no connector, the logic is complex, the volume makes per-task pricing expensive, or the workflow is critical enough to need fuller control over errors and monitoring.",
    },
    {
      question: "Which systems can you connect?",
      answer:
        "Most modern business software, including CRMs, accounting packages, e-commerce platforms, helpdesks, forms, email and spreadsheets, offers an API or a connector. Older or industry-specific systems sometimes only export files, which can still often be automated. We check what each of your systems allows before quoting.",
    },
    {
      question: "What happens when an automation breaks?",
      answer:
        "We build workflows to fail loudly rather than silently: errors raise an alert, failed steps can be retried, and there is a record of what happened. We also document how each workflow works, so you are not dependent on one person remembering.",
    },
    {
      question: "How much does workflow automation cost?",
      answer:
        "It depends on the number of steps and systems and how specific the rules are. A workflow on a connector platform usually costs less to build but carries a monthly subscription; a custom integration costs more to build but may cost little to run. We set out both before you decide.",
    },
    {
      question: "Is our data handled safely?",
      answer:
        "Automation moves data between systems, so we keep the data passing through each step to what that step needs, check where each platform processes and stores it, and use accounts and permissions that can be reviewed. Your obligations under UK GDPR, or the data-protection law that applies to you, stay with you, and we’ll flag anything that needs a decision.",
    },
  ],
  relatedInsights: [
    {
      slug: "what-should-you-automate-first",
      reason: "A simple test for picking your first automation, the five most common quick wins, and why not to automate a broken process.",
    },
    {
      slug: "when-should-a-business-build-custom-software",
      reason: "Many “we need new software” problems turn out to be connection problems. How to tell which one you have.",
    },
    {
      slug: "how-to-connect-business-systems",
      reason: "Deciding where each record lives, then choosing between built-in integrations, connectors and APIs.",
    },
  ],
  relatedServices: [
    {
      title: "AI integration",
      href: "/services/ai-integration",
      reason: "When a step in the workflow needs reading or writing, such as triaging email or extracting invoice details.",
    },
    {
      title: "Custom software",
      href: "/services/custom-software",
      reason: "When the process needs a tool of its own rather than another connection, such as a spreadsheet that has become a database.",
    },
  ],
  close: {
    title: "Describe the process that slows you down.",
    lede: "Tell us what happens, which tools are involved and where it hurts. We’ll tell you whether it’s a quick win, a bigger project, or something your software can already do.",
    cta: "Describe a process",
  },
};

export const SOFTWARE_SERVICE: ServicePageContent = {
  path: "/services/custom-software",
  name: "Custom Software",
  updated: "2026-11-19",
  title: "Custom Software Development for SMEs",
  description:
    "Custom software and web applications for small businesses: internal tools, client portals, dashboards and websites, built around how your business works.",
  h1: "Custom software built around the way your business works",
  lede: "We build internal tools, client portals, dashboards, web applications and websites for businesses whose work has outgrown spreadsheets and off-the-shelf software.",
  serviceType: "Custom software and web application development",
  diagram: "software",
  primaryCta: "Describe what you need",
  problems: {
    title: "Signs you’ve outgrown your tools.",
    intro: "Off-the-shelf software is the right default. These are the signs that it has stopped fitting.",
    items: [
      {
        title: "A spreadsheet is running the business",
        body: "One shared spreadsheet has become the database: several versions, formulas that break when someone sorts a column, and no way to control who changes what.",
      },
      {
        title: "Several tools doing one job",
        body: "You pay for three subscriptions because none of them quite fits, and your team fills the gaps between them by hand, every day.",
      },
      {
        title: "Customers chasing you for updates",
        body: "Clients email and call to ask where things stand or to find a document, because there is nowhere they can look for themselves.",
      },
      {
        title: "A website that can’t do what you need",
        body: "The site looks fine but can’t take a booking with your rules, produce a quote, give customers an account, or connect to the systems behind it.",
      },
    ],
  },
  offerings: {
    title: "What we build.",
    intro: "Software with a clear job, connected to the systems you already use rather than replacing them for the sake of it.",
    items: [
      {
        title: "Internal tools",
        body: "A purpose-built tool for one job your team does every day, such as tracking jobs, preparing quotes, managing stock or approving requests, in place of the spreadsheet and email chain it runs on now.",
      },
      {
        title: "Client portals",
        body: "A secure place for your customers to sign in and see progress, documents, updates and invoices, with each client seeing only their own information.",
      },
      {
        title: "Dashboards and reporting",
        body: "Live figures drawn from the systems that hold them, laid out for the decisions you actually make, instead of a report someone assembles by hand.",
      },
      {
        title: "Web applications",
        body: "Booking, ordering, quoting and subscription services, including sign-in, payments and the admin screens behind them.",
      },
      {
        title: "Business websites",
        body: "Fast, accessible websites structured so customers and search engines understand what you do, built with the same care as the software behind them.",
      },
      {
        title: "Integration with what you have",
        body: "New software connected to your CRM, accounting, payments and email, so it adds to the systems your business already relies on instead of becoming another island.",
      },
    ],
  },
  examples: {
    title: "Where custom software usually earns its cost.",
    intro: "The situations in which building tends to beat buying. If none of them sounds like you, keep the software you have.",
    items: [
      {
        title: "Your process is genuinely different",
        body: "The way you price, schedule or match customers to services is part of what makes you better, and generic software would force you to give it up.",
      },
      {
        title: "The workaround is permanent",
        body: "A core part of your operation runs through spreadsheets, copying and reconciling between tools that were never meant to work together, and it isn’t going away.",
      },
      {
        title: "Customers or staff use it daily",
        body: "Once a workaround is something people touch every day, the cost of the friction adds up quickly and a tool built for the job pays back.",
      },
      {
        title: "You’ve costed the alternative",
        body: "The subscriptions plus the staff time spent on manual steps between them come to a real number over a year or two, not a guess.",
      },
    ],
  },
  detail: {
    id: "how-we-build",
    title: "How we build.",
    paragraphs: [
      "We build on a modern, widely used stack: TypeScript, React and Next.js for the application, PostgreSQL through Supabase for data and sign-in, and Stripe for payments. Choosing mainstream tools matters to you as well as to us, because it keeps the software easy to host, secure and hand to another developer if you ever need to.",
      "It is the stack this website runs on, including our client portal and subscription checkout. We also designed and built the website of Scornik Gerstein LLP, the London law firm shown in our recent work.",
    ],
  },
  approach: {
    title: "Small, specific, useful.",
    intro: "Three principles keep custom projects on budget and in use.",
    parts: [
      {
        title: "Off-the-shelf first",
        body: "If a mature product will do the job, or a connection between tools you already have, we’ll say so before suggesting a build.",
      },
      {
        title: "A small first version",
        body: "The first release solves one real problem for a defined group of people. Scope creep, not technical difficulty, is what usually sinks custom software.",
      },
      {
        title: "Built with the people who use it",
        body: "We design around the staff and customers who will use the software every day, and test it with them before it replaces anything.",
      },
    ],
    note: "Most business problems don’t need custom software, and we’ll tell you when yours doesn’t. When it is the right call, a small tool that solves one problem well is usually worth more than a large platform that tries to solve everything at once.",
  },
  process: {
    Discover: "For software: the process today, the people who’ll use the tool, and the systems it must work with.",
    Define: "A written brief: the problem, who it is for, and what the first version must do, and what it won’t.",
    Build: "Design, development and integration in short cycles, shown to you as it takes shape.",
    Improve: "Launch, watch how it’s used, and add what the real work shows is missing.",
  },
  engagement: [
    "Software is scoped and quoted per project. A good starting brief is shorter than people expect: what the process is today, what is wrong with it, and what “solved” looks like for the people doing the work. From there we agree a defined first version, with its scope and cost settled before development starts.",
    "Software needs looking after once it is live: hosting, security updates and changes as the business changes. How that will work should be settled before the build begins, whether we support it or your own team takes it on.",
  ],
  faqs: [
    {
      question: "When is custom software worth it over an off-the-shelf product?",
      answer:
        "When your process is genuinely different from what the product category assumes, when you’re paying in subscriptions and staff time for a permanent workaround between tools, or when the thing your customers or staff need every day doesn’t exist as a product. Otherwise, off-the-shelf is cheaper, faster and maintained by someone else.",
    },
    {
      question: "How much does custom software cost?",
      answer:
        "It depends on how many people use it, how many systems it connects to and how much it has to do on day one, which is why we start with a defined first version rather than a full wish list. Running costs such as hosting and maintenance are part of the estimate, not a surprise afterwards.",
    },
    {
      question: "Can you work with our existing systems?",
      answer:
        "Yes, and we usually prefer to. Most of what we build connects to software you already use, such as a CRM, accounting package or payment provider, rather than replacing it.",
    },
    {
      question: "Do you build websites as well as applications?",
      answer:
        "Yes. We design and build business websites, and because we also offer SEO, we build them to be found: clear structure, fast pages and the technical foundations search engines rely on.",
    },
    {
      question: "Can we start small?",
      answer:
        "We’d recommend it. A first version that solves one problem for one group of people is quicker to deliver, cheaper to change and tells you far more about what to build next than a long specification written up front.",
    },
  ],
  relatedInsights: [
    {
      slug: "replace-spreadsheets-with-custom-software",
      reason: "When a spreadsheet has become a system, and the four ways out, from a tidy-up to a tool of your own.",
    },
    {
      slug: "when-should-a-business-build-custom-software",
      reason: "The signals that off-the-shelf is still the right answer, the ones that say build, and the middle ground most businesses skip.",
    },
    {
      slug: "what-should-you-automate-first",
      reason: "Before building anything, check whether connecting the tools you have would solve the problem.",
    },
    {
      slug: "why-your-website-isnt-bringing-you-customers",
      reason: "If the website is the problem, three checks to run before assuming you need more traffic or a rebuild.",
    },
    {
      slug: "does-your-business-need-a-client-portal",
      reason: "When a client portal earns its keep, the build-or-buy decision, and the security questions to settle first.",
    },
    {
      slug: "how-we-built-this-site",
      reason: "How this site, its client portal and its checkout were built, on the stack described above.",
    },
  ],
  relatedServices: [
    {
      title: "Workflow automation and integration",
      href: "/services/workflow-automation",
      reason: "When the problem is getting your existing tools to share information, not a missing tool.",
    },
    {
      title: "SEO & Digital Growth",
      href: "/services/seo",
      reason: "Once the site is right, the work of making sure the right people find it.",
    },
  ],
  close: {
    title: "Tell us what your team is working around.",
    lede: "Describe the process and the tools involved, and we’ll tell you honestly whether it’s a build, a connection between tools you already have, or an off-the-shelf fit.",
    cta: "Describe what you need",
  },
};

/** The service pages this module defines, in homepage order. */
export const SERVICE_PAGES: ServicePageContent[] = [AI_SERVICE, AUTOMATION_SERVICE, SOFTWARE_SERVICE];
