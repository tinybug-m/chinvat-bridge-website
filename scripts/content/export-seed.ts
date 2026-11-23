/*
 * One-off migration export: writes supabase/seed-content/<key-slugified>.json ({key, kind,
 * schemaVersion, data}) from the content that lived in code before the Supabase migration:
 * src/data/*, the hero/work/nav modules, src/lib/constants.ts and legal.ts, and the copy that was
 * hardcoded in TSX (transcribed below, each block naming the file it came from). Text is copied
 * exactly; the only intended change is that the services and process steps lose their decorative
 * "I."–"IV." index fields.
 *
 * Plans are not exported: they stay in public.plans. The modules are read from git at SNAPSHOT_REF,
 * so the script still runs after they are refactored or deleted; the seed JSON is the source of truth.
 *
 *   node --import ./scripts/content/register.mjs scripts/content/export-seed.ts [--check]
 *
 * --check validates and compares with the files on disk without writing (exit 1 on any difference).
 * Once the src/data modules are deleted (after the parity proof) the seed JSON is the source of
 * truth and this script is kept only as the record of how it was made.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CONTENT_SCHEMA_VERSION, ContentDocument, kindOf, parseDocumentData, type RichInline, type RichBlock } from "../../src/lib/content/schema";

/*
 * The code-owned content as it stood at the migration commit. The modules are read from git, so this
 * export (and the unit test's --check) keeps proving the seed equals the original copy after the
 * modules are refactored or deleted. "@/" imports inside them are rewritten to the snapshot.
 */
const SNAPSHOT_REF = "44cdab1";
const LEGACY_FILES = [
  "src/data/services.ts",
  "src/data/process.ts",
  "src/data/capabilities.ts",
  "src/data/transition.ts",
  "src/data/service-pages.ts",
  "src/data/seo-service.ts",
  "src/components/home/hero/content.ts",
  "src/components/home/hero/crossing-content.ts",
  "src/components/home/work/projects.ts",
  "src/components/site/nav.ts",
  "src/lib/constants.ts",
  "src/lib/legal.ts",
  "src/lib/metadata.ts",
];
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const snapshot = mkdtempSync(path.join(tmpdir(), "content-seed-"));
for (const file of LEGACY_FILES) {
  const source = execFileSync("git", ["-C", REPO, "show", `${SNAPSHOT_REF}:${file}`], { encoding: "utf8" });
  const target = path.join(snapshot, file);
  mkdirSync(path.dirname(target), { recursive: true });
  // Value imports become snapshot paths; type-only imports are erased by Node's type stripping.
  writeFileSync(target, source.replace(/from "@\/([^"]+)"/g, (_m, p) => `from "${path.join(snapshot, "src", p)}"`));
}
// The shapes of the pre-migration modules (as at SNAPSHOT_REF).
type TitledText = { title: string; body: string };
type Link = { label: string; href: string };
type SiteLink = Link & { section?: string };
type ServicePageContent = {
  path: string; name: string; updated: string; title: string; description: string; h1: string; lede: string;
  serviceType: string; diagram: string; primaryCta: string;
  problems: { title: string; intro?: string; items: TitledText[] };
  offerings: { title: string; intro?: string; items: TitledText[] };
  examples: { title: string; intro?: string; items: TitledText[]; note?: string };
  detail?: { id: string; title: string; paragraphs: string[] };
  approach: { title: string; intro: string; parts: TitledText[]; note: string };
  process: Record<string, string>; engagement: string[];
  faqs: { question: string; answer: string }[];
  relatedInsights: { slug: string; reason: string }[];
  relatedServices: { title: string; href: string; reason: string }[];
  close: { title: string; lede: string; cta: string };
};
type Legacy = {
  SERVICES: { icon: string; title: string; strapline: string; description: string; tags: string[]; outcome: string; href?: string }[];
  PROCESS_STEPS: { title: string; description: string }[];
  CAPABILITIES: { category: string; title: string; description: string }[];
  CURRENT_STATE_ITEMS: { label: string; status: string }[];
  FUTURE_STATE_ITEMS: { label: string; status: string }[];
  SERVICE_PAGES: ServicePageContent[];
  SEO_SERVICE: { path: string; name: string; updated: string; title: string; description: string; h1: string; lede: string };
  SEO_PROBLEMS: TitledText[];
  SEO_OFFERINGS: (TitledText & { scope: string })[];
  SEO_APPROACH: { intro: string; parts: TitledText[]; note: string };
  SEO_DELIVERABLES: { start: { title: string; items: string[] }; monthly: { title: string; items: string[] }; note: string };
  SEO_PROCESS_NOTES: Record<string, string>;
  SEO_ENGAGEMENT: string[];
  SEO_FAQS: { question: string; answer: string }[];
  SEO_RELATED_INSIGHTS: { slug: string; reason: string }[];
  SEO_RELATED_SERVICES: { title: string; href: string; reason: string }[];
  HERO_COPY: { eyebrow: string; primary: Link; secondary: Link };
  CROSSING_COPY: { title: readonly [string, string]; lede: string; above: string; below: string };
  TIERS: { label: string; href: string; short: string }[];
  PROJECTS: { key: string; name: string; context: string; label: string; href: string; src: string; alt: string }[];
  SECTION_LINKS: SiteLink[]; PRICING_LINK: SiteLink; LOGIN_LINK: SiteLink; CONTACT_LINK: SiteLink; DISCIPLINE_LINKS: SiteLink[];
  sectionOf: (link: SiteLink) => string;
  CONTACT_EMAIL: string; SITE_DESCRIPTION: string; SITE_NAME: string; SITE_ORIGIN: string; SITE_TITLE: string;
  PRIVACY_UPDATED: string; TERMS_UPDATED: string;
  SHARED_OPEN_GRAPH: { images: { alt: string }[] };
};
const legacyModules: Partial<Legacy> = {};
for (const file of LEGACY_FILES) Object.assign(legacyModules, await import(path.join(snapshot, file)));
const L = legacyModules as Legacy;
const {
  SERVICES, PROCESS_STEPS, CAPABILITIES, CURRENT_STATE_ITEMS, FUTURE_STATE_ITEMS, SERVICE_PAGES,
  SEO_APPROACH, SEO_DELIVERABLES, SEO_ENGAGEMENT, SEO_FAQS, SEO_OFFERINGS, SEO_PROBLEMS, SEO_PROCESS_NOTES,
  SEO_RELATED_INSIGHTS, SEO_RELATED_SERVICES, SEO_SERVICE, HERO_COPY, CROSSING_COPY, TIERS, PROJECTS,
  CONTACT_LINK, DISCIPLINE_LINKS, LOGIN_LINK, PRICING_LINK, SECTION_LINKS, sectionOf,
  CONTACT_EMAIL, SITE_DESCRIPTION, SITE_NAME, SITE_ORIGIN, SITE_TITLE, PRIVACY_UPDATED, TERMS_UPDATED, SHARED_OPEN_GRAPH,
} = L;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "supabase/seed-content");

const SERVICE_KEYS = ["ai", "automation", "software", "seo"] as const;
const STEP_KEYS = ["discover", "define", "build", "improve"] as const;
/** Step titles were the keys of the per-service process notes; the content model keys them by step key. */
const stepKeyOf = (title: string) => STEP_KEYS[PROCESS_STEPS.findIndex((s) => s.title === title)];
const notesByKey = (notes: Record<string, string>) =>
  Object.fromEntries(Object.entries(notes).map(([title, note]) => {
    const key = stepKeyOf(title);
    if (!key) throw new Error(`process note for unknown step "${title}"`);
    return [key, note];
  }));

// ---------------------------------------------------------------------------------------------
// Shared copy hardcoded in TSX

/** components/home/contact/Contact.tsx and the default of components/insights/ArticleEnd.tsx. */
const CLOSE_TITLE = "Build a better way forward.";
const CLOSE_LEDE = "Tell us what’s slowing your business down, where you’re trying to grow, or what you’d like to build.";
const START_A_CONVERSATION = "Start a conversation";

const sitemap = (changeFrequency: "monthly" | "weekly" | "yearly", priority: number) => ({ changeFrequency, priority });

// ---------------------------------------------------------------------------------------------
// settings:site

const settings = {
  siteName: SITE_NAME,
  siteTitle: SITE_TITLE,
  siteDescription: SITE_DESCRIPTION,
  siteOrigin: SITE_ORIGIN,
  contactEmail: CONTACT_EMAIL,
  eyebrow: HERO_COPY.eyebrow,
  ogImageAlt: SHARED_OPEN_GRAPH.images[0].alt,
  // app/layout.tsx (Organization JSON-LD)
  organization: {
    areaServed: "Worldwide",
    addressCountry: "GB",
    knowsAbout: ["Artificial intelligence", "Business automation", "Custom software", "Technical SEO"],
  },
  // components/site/SiteHeader.tsx
  header: { contactShortLabel: "Contact" },
  // components/site/SiteFooter.tsx
  footer: {
    blurb: "Chinvat Bridge is a UK-based technology consultancy helping businesses use AI, automation, software and SEO to work better and grow.",
    columnTitles: { explore: "Explore", disciplines: "Disciplines", clients: "Clients" },
    contactLinkLabel: "Contact",
    copyrightHolder: "Chinvat Bridge",
    rightsNotice: "All rights reserved.",
    legalLinks: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
  // app/not-found.tsx
  notFound: {
    metaTitle: "Page Not Found",
    eyebrow: "Error 404",
    title: "The bridge breaks here.",
    lede: "The page you’re looking for may have moved, or the link may be out of date.",
    primaryCta: { label: "Back to home", href: "/" },
    secondaryCta: { label: "Read insights", href: "/insights" },
    routes: [
      { label: "Services", href: "/#services" },
      { label: "Work", href: "/#work" },
      { label: "Approach", href: "/#approach" },
      { label: "Pricing", href: "/pricing" },
    ],
    contactPrompt: "Still stuck?",
    figureDescription: "A stone bridge whose middle span has fallen away, the missing slabs left as a dashed drawing.",
  },
  // app/(pages)/insights/[slug]/page.tsx and components/insights/ArticleEnd.tsx
  articles: {
    publishedLabel: "Published",
    updatedLabel: "Updated",
    readingTimeLabel: "Reading time",
    readingTimeUnit: "min read",
    allInsightsLabel: "All insights",
    relatedTitle: "Related reading",
    close: { title: CLOSE_TITLE, lede: CLOSE_LEDE, ctaLabel: START_A_CONVERSATION },
  },
};

// ---------------------------------------------------------------------------------------------
// navigation:main (components/site/nav.ts)

const link = (l: { label: string; href: string }) => ({ label: l.label, href: l.href });
const navigation = {
  sections: SECTION_LINKS.map((l) => ({ key: sectionOf(l), label: l.label, href: l.href })),
  pricing: link(PRICING_LINK),
  login: link(LOGIN_LINK),
  contact: link(CONTACT_LINK),
  disciplines: DISCIPLINE_LINKS.map((l, i) => ({ key: SERVICE_KEYS[i], ...link(l) })),
};

// ---------------------------------------------------------------------------------------------
// Collections

const services = {
  items: SERVICES.map((s, i) => {
    if (!s.href) throw new Error(`service ${s.title} has no href`);
    return { key: SERVICE_KEYS[i], icon: s.icon, title: s.title, strapline: s.strapline, description: s.description, tags: s.tags, outcome: s.outcome, href: s.href };
  }),
};
const processSteps = { items: PROCESS_STEPS.map((s, i) => ({ key: STEP_KEYS[i], title: s.title, description: s.description })) };
const capabilities = {
  items: CAPABILITIES.map((c) => ({ key: c.category.toLowerCase().replace(/[^a-z0-9]+/g, "_"), category: c.category, title: c.title, description: c.description })),
};
const workProjects = {
  items: PROJECTS.map((p) => ({
    key: p.key,
    name: p.name,
    context: p.context,
    kind: p.label === "Client project" ? "client" : "concept",
    href: p.href,
    // components/home/work/WorkIndex.tsx renders every capture at 2000×1250.
    image: { src: p.src, width: 2000, height: 1250, alt: p.alt },
  })),
};

// ---------------------------------------------------------------------------------------------
// page:/ (app/(site)/page.tsx and components/home/*)

const home = {
  template: "home",
  seo: { robots: "index", sitemap: sitemap("monthly", 1) },
  blocks: [
    {
      type: "hero",
      titleLines: [...CROSSING_COPY.title],
      lede: CROSSING_COPY.lede,
      primaryCta: link(HERO_COPY.primary),
      secondaryCta: link(HERO_COPY.secondary),
      chart: { above: CROSSING_COPY.above, below: CROSSING_COPY.below },
      disciplines: TIERS.map((t, i) => ({ key: SERVICE_KEYS[i], label: t.label, short: t.short, href: t.href })),
    },
    // home/services/Services.tsx
    { type: "service_plates", heading: "Four disciplines, one way of working." },
    // home/work/Work.tsx; labels from home/work/projects.ts
    { type: "work_index", heading: "Recent work.", labels: { client: "Client project", concept: "Concept" } },
    // home/bridge/Bridge.tsx and BridgeSeam.tsx
    {
      type: "bridge_seam",
      heading: "From today to what’s next.",
      lede: "Technology creates the most value when it solves a real constraint.",
      leftLabel: "Current state",
      rightLabel: "Future direction",
      controlLabel: "Move the seam",
      pairs: CURRENT_STATE_ITEMS.map((current, i) => {
        const future = FUTURE_STATE_ITEMS[i];
        if (!future) throw new Error("transition lists differ in length");
        return { current: { ...current }, future: { ...future } };
      }),
    },
    // home/method/Method.tsx
    { type: "method", heading: "How we work.", cta: { label: START_A_CONVERSATION, href: "/#contact" } },
    // home/capabilities/Capabilities.tsx
    {
      type: "capabilities",
      heading: "What we build with.",
      lede: "Modern businesses have more tools than ever. The challenge is knowing which ones actually create value.",
    },
    // home/about/About.tsx
    {
      type: "about",
      heading: "The right technology connects the pieces.",
      quote: "“Most businesses don’t need more software. They need their people, processes and systems to work better together.”",
      originTitle: "The Name & Origin",
      originBody:
        "Chinvat Bridge is inspired by the ancient Persian concept of a bridge — a passage between one state and another. For us, it represents the transition from how a business works today to how it could work tomorrow.",
      link: { label: "Where the name comes from", href: "/insights/where-the-name-chinvat-bridge-comes-from" },
    },
    // home/insights/Insights.tsx
    { type: "insights_teaser", heading: "Ideas and observations.", link: { label: "All insights", href: "/insights" }, count: 3 },
    // home/contact/Contact.tsx and ContactChat.tsx
    {
      type: "contact",
      heading: CLOSE_TITLE,
      lede: CLOSE_LEDE,
      noscriptLead: "The conversation needs JavaScript. Please write to",
      chat: {
        greeting: "Hi, thanks for stopping by. What can we help you with?",
        followUps: {
          "AI & Automation": "Good. What would you like to automate, or hand over to AI?",
          Workflows: "Good. Which process feels slow or messy right now?",
          "Software & Web": "Good. What would you like built?",
          "SEO & Growth": "Good. What would you like to grow, and where are you now?",
          "Not sure yet": "That’s fine. What’s slowing your business down at the moment?",
        },
        askContact: "Thanks, that’s clear. Where should we send our reply?",
        placeholders: { start: "Or tell us in your own words", details: "A sentence or two is plenty" },
      },
    },
  ],
};

// ---------------------------------------------------------------------------------------------
// Service pages (components/services/ServicePage.tsx and app/(pages)/services/seo/page.tsx)

const cta = (label: string, href: string, variant: "primary" | "secondary" = "primary", arrow: "right" | "down" = "right") => ({ label, href, variant, arrow });
const opt = <T,>(key: string, value: T | undefined) => (value === undefined ? {} : { [key]: value });
const section = (
  anchor: string,
  title: string,
  content: unknown[],
  o: { intro?: string; ruled?: boolean; background?: "paper" | "raised" | "haze"; stacked?: boolean } = {},
) => ({
  type: "section",
  anchor,
  title,
  ...opt("intro", o.intro),
  ruled: o.ruled ?? true,
  background: o.background ?? "paper",
  stacked: o.stacked ?? false,
  content,
});
const HOW_WE_WORK = "How we work.";
const FAQ_TITLE = "Questions we’re asked.";
const RELATED_INSIGHTS = { type: "related_insights", anchor: "related-insights", title: "Related insights." } as const;
const RELATED_SERVICES_TITLE = "Related services.";

function servicePage(c: ServicePageContent) {
  return {
    template: "service",
    seo: { title: c.title, description: c.description, robots: "index", sitemap: sitemap("monthly", 0.8) },
    updatedOn: c.updated,
    service: { name: c.name, serviceType: c.serviceType },
    blocks: [
      {
        type: "page_header",
        kicker: c.name,
        title: c.h1,
        lede: c.lede,
        diagram: c.diagram,
        ctas: [cta(c.primaryCta, "/#contact"), cta("See what we do", "#what-we-do", "secondary", "down")],
      },
      section("problem", c.problems.title, [{ type: "text_grid", columns: 2, items: c.problems.items }], { intro: c.problems.intro, ruled: false }),
      section("what-we-do", c.offerings.title, [{ type: "offering_list", items: c.offerings.items }], { intro: c.offerings.intro }),
      section(
        "examples",
        c.examples.title,
        [{ type: "text_grid", columns: 2, items: c.examples.items }, ...(c.examples.note ? [{ type: "note", size: "body", text: c.examples.note }] : [])],
        { intro: c.examples.intro, background: "raised" },
      ),
      ...(c.detail ? [section(c.detail.id, c.detail.title, [{ type: "paragraphs", paragraphs: c.detail.paragraphs, ctas: [] }], { ruled: false })] : []),
      section(
        "approach-principles",
        c.approach.title,
        [{ type: "text_grid", columns: 3, items: c.approach.parts }, { type: "note", size: "lede", text: c.approach.note }],
        { intro: c.approach.intro, stacked: true },
      ),
      section(
        "how-we-work",
        HOW_WE_WORK,
        [{ type: "process_steps", notes: notesByKey(c.process) }],
        { intro: "The same four steps as all our work, applied to this service." },
      ),
      section("engagement", "How projects start.", [{ type: "paragraphs", paragraphs: c.engagement, ctas: [cta(c.primaryCta, "/#contact")] }], { background: "haze" }),
      section("faq", FAQ_TITLE, [{ type: "faq_list", items: c.faqs }], { ruled: false }),
      { ...RELATED_INSIGHTS, curated: c.relatedInsights },
      section("related-services", RELATED_SERVICES_TITLE, [{ type: "link_list", items: c.relatedServices }]),
      { type: "closing", title: c.close.title, lede: c.close.lede, ctaLabel: c.close.cta },
    ],
  };
}

const seoPage = {
  template: "service",
  seo: { title: SEO_SERVICE.title, description: SEO_SERVICE.description, robots: "index", sitemap: sitemap("monthly", 0.8) },
  updatedOn: SEO_SERVICE.updated,
  service: { name: SEO_SERVICE.name, serviceType: "Search engine optimisation" },
  blocks: [
    {
      type: "page_header",
      kicker: SEO_SERVICE.name,
      title: SEO_SERVICE.h1,
      lede: SEO_SERVICE.lede,
      diagram: "seo",
      ctas: [cta("Discuss your SEO goals", "/#contact"), cta("Explore SEO plans", "/pricing", "secondary")],
    },
    section("problem", "Why good businesses stay hard to find.", [{ type: "text_grid", columns: 2, items: SEO_PROBLEMS }], {
      intro: "Most visibility problems come down to a few causes, and they compound: each one makes the others harder to fix.",
      ruled: false,
    }),
    section("what-we-do", "What we do.", [{ type: "offering_list", items: SEO_OFFERINGS }], {
      intro: "Six kinds of work, from the technical foundations of your site to the links that point to it.",
    }),
    section(
      "seo-approach",
      "Foundations, content, authority.",
      [{ type: "text_grid", columns: 3, items: SEO_APPROACH.parts }, { type: "note", size: "lede", text: SEO_APPROACH.note }],
      { intro: SEO_APPROACH.intro, background: "raised", stacked: true },
    ),
    section("deliverables", "What you receive.", [{ type: "list_pair", lists: [SEO_DELIVERABLES.start, SEO_DELIVERABLES.monthly], note: SEO_DELIVERABLES.note }], { ruled: false }),
    section("how-we-work", HOW_WE_WORK, [{ type: "process_steps", notes: notesByKey(SEO_PROCESS_NOTES) }], {
      intro: "The same four steps as all our work, applied to search.",
    }),
    section(
      "plans",
      "Plans and engagement.",
      [{ type: "paragraphs", paragraphs: SEO_ENGAGEMENT, ctas: [cta("Compare SEO plans", "/pricing"), cta("Request a custom package", "/#contact", "secondary")] }],
      { background: "haze" },
    ),
    section("faq", FAQ_TITLE, [{ type: "faq_list", items: SEO_FAQS }], { ruled: false }),
    { ...RELATED_INSIGHTS, curated: SEO_RELATED_INSIGHTS },
    section("related-services", RELATED_SERVICES_TITLE, [{ type: "link_list", items: SEO_RELATED_SERVICES }]),
    {
      type: "closing",
      title: "Tell us where search is holding you back.",
      lede: "Send us your website and what you’d like it to achieve, and we’ll tell you what we’d look at first.",
      ctaLabel: "Discuss your SEO goals",
    },
  ],
};

// ---------------------------------------------------------------------------------------------
// page:/pricing (app/(pages)/pricing/page.tsx, organisms/sections/Pricing.tsx and CustomPlanCard.tsx)

const pricing = {
  template: "pricing",
  seo: {
    title: "SEO Packages & Pricing",
    description:
      "SEO packages for small businesses with published monthly prices in pounds: technical SEO, keyword research, content and link building. No long-term contract.",
    robots: "index",
    sitemap: sitemap("monthly", 0.8),
  },
  breadcrumb: "Pricing",
  header: {
    kicker: "SEO & content retainers",
    title: "SEO & content plans",
    lede: "Ongoing content, technical SEO and link building — delivered on a predictable monthly retainer. For AI, automation or custom software work, get in touch for a scoped quote.",
    link: { label: "How our SEO service works", href: "/services/seo" },
  },
  plans: {
    emptyState: {
      beforeEmail: "Our plan details can’t be shown right now. Please try again shortly, or email",
      afterEmail: "and we’ll send you current pricing.",
    },
    custom: {
      title: "Custom Solutions",
      subtitle: "Scoped to your brief",
      body: "Need more than a retainer covers? Tell us what you’re working towards and we’ll put together a personalised package, with scope tailored across SEO, AI, automation and software.",
      listTitle: "Ask us about",
      cta: { label: "Request a custom package", href: "/#contact" },
    },
  },
  billing: {
    anchor: "billing",
    title: "Billing and terms.",
    intro: "The short version of our terms for SEO plans.",
    // TERMS_SUMMARY: each line is the terms page's own position.
    items: [
      { title: "Billed monthly", body: "Plans are billed monthly in advance through Stripe, our payment processor, and renew each month until cancelled." },
      { title: "Prices exclude tax", body: "Prices are shown exclusive of any applicable tax, which is added at checkout where relevant." },
      { title: "No long-term contract", body: "You can cancel at any time. We ask for 30 days’ notice, so active work can be wound down in an orderly way." },
      {
        title: "No ranking guarantees",
        body: "Rankings, traffic and revenue depend on factors outside anyone’s control, so we commit to the work in your plan, not to a position in search results.",
      },
    ],
    links: [
      { label: "Read the full terms", href: "/terms" },
      { label: "See what your client portal will look like", href: "/client-portal" },
    ],
  },
  otherServices: {
    anchor: "other-services",
    title: "Other services.",
    intro:
      "AI integration, workflow automation and custom software are quoted per project rather than sold as plans. Each starts with a conversation about the work, and scope and cost are agreed before it begins.",
    pages: SERVICE_PAGES.map((s) => s.path),
  },
};

// ---------------------------------------------------------------------------------------------
// page:/insights (app/(pages)/insights/page.tsx)

const insights = {
  template: "insights_index",
  seo: {
    title: "Insights: AI, Automation, Software & SEO for SMEs",
    description: "Practical thinking on AI, automation, software and SEO for small businesses — written to help you make better, faster operational decisions.",
    robots: "index",
    sitemap: sitemap("weekly", 0.7),
  },
  header: { kicker: "Insights", title: "Ideas & observations", lede: "Practical thinking about AI, software, automation and digital growth." },
  collectionName: "Insights",
};

// ---------------------------------------------------------------------------------------------
// Legal pages (app/(pages)/privacy/page.tsx and terms/page.tsx), as rich text. JSX whitespace is
// collapsed exactly as React rendered it; <EmailLink /> becomes the contact_email inline.

const t = (text: string): RichInline => ({ type: "text", text });
const EMAIL: RichInline = { type: "contact_email" };
const p = (...children: (string | RichInline)[]): RichBlock => ({ type: "paragraph", children: children.map((c) => (typeof c === "string" ? t(c) : c)) });
const h2 = (text: string): RichBlock => ({ type: "heading", level: 2, children: [t(text)] });
const ul = (...items: string[]): RichBlock => ({ type: "list", ordered: false, items: items.map((i) => ({ children: [t(i)] })) });
const a = (href: string, text: string): RichInline => ({ type: "link", href, children: [t(text)] });
const legalSeo = (title: string, description: string) => ({ title, description, robots: "index", sitemap: sitemap("yearly", 0.3) });

const privacy = {
  template: "legal",
  seo: legalSeo(
    "Privacy Policy",
    "How Chinvat Bridge collects, uses and protects your information when you visit our site or subscribe to a plan, and your rights under UK data protection law.",
  ),
  updatedOn: PRIVACY_UPDATED,
  header: { kicker: "Legal", title: "Privacy policy" },
  lastUpdatedLabel: "Last updated:",
  lede: [t("Chinvat Bridge (“we”, “us”) is a UK-based technology consultancy. This policy explains what information we collect when you enquire about or subscribe to our services, and how we use it.")],
  body: {
    schemaVersion: 1,
    blocks: [
      h2("Information we collect"),
      p("When you contact us, request a plan, or subscribe to a service, we may collect:"),
      ul(
        "Your name, company name, business email address and phone number",
        "Your website URL and, optionally, your target market and project notes",
        "With a message you send us, the page you were reading, the first page of your visit (including the source, medium and campaign name from the link you followed, if it had them), and the name of the website that referred you, if any, so we know what prompted it. The page keeps this in memory while you browse; nothing is saved to your device.",
        "Billing information processed directly by our payment provider, Stripe (we do not store your card details ourselves)",
      ),
      h2("How we use it"),
      p("We use this information only to:"),
      ul(
        "Set up and deliver the service you’ve subscribed to or enquired about",
        "Correspond with you about your account, project or enquiry",
        "Process payments and manage your subscription, via Stripe",
        "Meet our legal and accounting obligations",
      ),
      p("We do not sell your data, and we do not use it for advertising or share it with third parties except the service providers strictly necessary to run our business (such as Stripe for payment processing)."),
      h2("Payment processing"),
      p("Subscription payments are handled entirely by ", a("https://stripe.com/gb/privacy", "Stripe"), ". We never see or store your full card details. Stripe’s own privacy policy governs how it handles your payment data."),
      h2("Data retention"),
      p("We retain your information for as long as needed to provide our services and meet our legal and accounting obligations, after which it is deleted or anonymised."),
      h2("Your rights"),
      p("Under UK GDPR, you have the right to access, correct, or request deletion of your personal data. To exercise any of these rights, contact us at ", EMAIL, "."),
      h2("Contact"),
      p("Questions about this policy or your data can be sent to ", EMAIL, "."),
    ],
  },
};

const terms = {
  template: "legal",
  seo: legalSeo(
    "Terms of Service",
    "The terms that govern your subscription to Chinvat Bridge's SEO and content services — billing, cancellation, scope of work and responsibilities.",
  ),
  updatedOn: TERMS_UPDATED,
  header: { kicker: "Legal", title: "Terms of service" },
  lastUpdatedLabel: "Last updated:",
  lede: [t("These terms govern your use of subscription services provided by Chinvat Bridge (“we”, “us”), a UK-based technology consultancy. By subscribing to a plan, you agree to these terms.")],
  body: {
    schemaVersion: 1,
    blocks: [
      h2("Subscriptions & billing"),
      p("Subscriptions are billed monthly in advance via our payment processor, Stripe. Your subscription renews automatically each month until cancelled. Prices are shown exclusive of any applicable tax, which will be added at checkout where relevant."),
      h2("Cancellation"),
      p("There is no long-term lock-in contract. You may cancel your subscription at any time; we ask for 30 days’ notice so we can wind down active work in an orderly way. Cancellation requests should be sent to ", EMAIL, "."),
      h2("Scope of service"),
      p("The specific deliverables included in your plan are described on our ", a("/pricing", "pricing page"), " at the time you subscribe. Work outside that scope — including AI, automation or custom software projects — is quoted and agreed separately."),
      h2("Client responsibilities"),
      p("You’re responsible for providing accurate business information and timely access to any systems (such as analytics or search console) needed for us to deliver the service."),
      h2("Limitation of liability"),
      p("We work to a high professional standard, but we do not guarantee specific search rankings, traffic, or revenue outcomes, as these depend on factors outside our control. Our liability in connection with the services is limited to the fees paid in the preceding three months."),
      h2("Governing law"),
      p("These terms are governed by the laws of England and Wales."),
      h2("Contact"),
      p("Questions about these terms can be sent to ", EMAIL, "."),
    ],
  },
};

// ---------------------------------------------------------------------------------------------

const documents: [string, unknown][] = [
  ["settings:site", settings],
  ["navigation:main", navigation],
  ["collection:services", services],
  ["collection:process_steps", processSteps],
  ["collection:capabilities", capabilities],
  ["collection:work_projects", workProjects],
  ["page:/", home],
  ...SERVICE_PAGES.map((c): [string, unknown] => [`page:${c.path}`, servicePage(c)]),
  [`page:${SEO_SERVICE.path}`, seoPage],
  ["page:/pricing", pricing],
  ["page:/insights", insights],
  ["page:/privacy", privacy],
  ["page:/terms", terms],
];

/** `page:/` → page-index; otherwise every run of non-alphanumerics becomes one hyphen. */
export const seedFileName = (key: string) => `${key === "page:/" ? "page-index" : key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.json`;

const check = process.argv.includes("--check");
mkdirSync(OUT, { recursive: true });
let failed = false;
for (const [key, data] of documents) {
  const doc = { key, kind: kindOf(key), schemaVersion: CONTENT_SCHEMA_VERSION, data };
  try {
    parseDocumentData(key, data);
    ContentDocument.parse(doc);
  } catch (error) {
    failed = true;
    console.error(`INVALID ${key}: ${(error as Error).message}`);
    continue;
  }
  const file = path.join(OUT, seedFileName(key));
  const json = `${JSON.stringify(doc, null, 2)}\n`;
  if (check) {
    if (!existsSync(file) || readFileSync(file, "utf8") !== json) {
      failed = true;
      console.error(`STALE ${path.relative(ROOT, file)}`);
    }
  } else {
    writeFileSync(file, json);
    console.log(`wrote ${path.relative(ROOT, file)}`);
  }
}
rmSync(snapshot, { recursive: true, force: true });
if (failed) process.exit(1);
