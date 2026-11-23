import { z } from "zod";

/*
 * The website's content schema, version 1 (ARCHITECTURE_DECISIONS D11; CONTRACT "Content schema").
 *
 * Every editable piece of public copy is an editorial *document*: `settings:site`, `navigation:main`,
 * `collection:<name>` or `page:<path>`. A document's `data` must satisfy the schema for its key. The
 * website validates every document it reads; the editorial backend validates drafts against the JSON
 * Schema export of this file (`pnpm content:schema` → supabase/seed-content/content-schema.json).
 *
 * Rules the schema enforces:
 *  - Copy is plain text. No HTML, no markup, no executable content; rich text reuses the editorial
 *    ArticleContent model (src/lib/editorial/content.ts) with one extra inline, `contact_email`.
 *  - Links are site paths, in-page anchors or https URLs (the editorial link rules; no mailto:, the
 *    contact address comes from settings).
 *  - Lists the layout is built around have a fixed length and stable keys (the four services, the four
 *    process steps, the four hero disciplines, the two deliverable lists). Diagrams, energy ports and
 *    plate geometry stay in code, keyed by those keys.
 *  - No decorative index fields (no "I.", "01", "Tier I"), and never "Ltd" (AGENTS.md).
 *
 * Every object is strict (additionalProperties: false). Nothing here uses transforms or defaults, so
 * the JSON Schema export describes exactly what this file accepts, apart from the cross-field checks
 * marked "runtime only" (unique keys, template per path), which the website applies on read.
 *
 * No imports beyond zod, so scripts and unit tests can load this file directly.
 */

export const CONTENT_SCHEMA_VERSION = 1 as const;

// ---------------------------------------------------------------------------------------------
// Primitives

/** No markup ("<" followed by a tag-like character), never "Ltd", no "Tier I"-style numbering. */
const SAFE_COPY = String.raw`^(?![\s\S]*<[A-Za-z/!?])(?![\s\S]*\bLtd\b)(?![\s\S]*\bTier [IVX]+\b)`;
/** A visible string: trimmed, non-empty, safe. */
export const Text = (max = 400) =>
  z
    .string()
    .min(1)
    .max(max)
    .regex(new RegExp(`${SAFE_COPY}\\S(?:[\\s\\S]*\\S)?$`), "plain text only: no markup, no leading/trailing space, no \"Ltd\" or tier numbering");
/** A text node inside rich text: may be whitespace or start/end with a space. */
const RichString = z.string().max(5000).regex(new RegExp(`${SAFE_COPY}[\\s\\S]*$`), "plain text only");

const INTERNAL_HREF = String.raw`\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?(?:#[a-z][a-z0-9-]*)?`;
const ANCHOR_HREF = String.raw`#[a-z][a-z0-9]*(?:-[a-z0-9]+)*`;
const EXTERNAL_HREF = String.raw`https:\/\/[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+(?::\d{1,5})?(?:[\/?#][^\s\\@]*)?`;
/** Same rules as the editorial backend's classifyHref: site path, in-page anchor, or https URL. */
export const Href = z.string().max(2048).regex(new RegExp(`^(?:${INTERNAL_HREF}|${ANCHOR_HREF}|${EXTERNAL_HREF})$`), "a site path, #anchor or https URL");
export const ExternalHref = z.string().max(2048).regex(new RegExp(`^${EXTERNAL_HREF}$`), "an https URL");
export const SitePath = z.string().max(200).regex(/^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/, "a site path");
export const Slug = z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const Key = z.string().min(1).max(40).regex(/^[a-z][a-z0-9_]*$/);
export const AnchorId = z.string().min(1).max(60).regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/);
export const IsoDate = z.string().regex(/^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/);

export const Link = z.strictObject({ label: Text(80), href: Href });
export const Cta = z.strictObject({
  label: Text(80),
  href: Href,
  variant: z.enum(["primary", "secondary"]),
  arrow: z.enum(["right", "down"]),
});
export const TitledText = z.strictObject({ title: Text(160), body: Text(1200) });

// ---------------------------------------------------------------------------------------------
// Rich text: the editorial ArticleContent model (v1) plus an inline `contact_email`, which renders
// the site's contact address from settings (the article model rejects mailto: links).

export type RichInline =
  | { type: "text"; text: string }
  | { type: "strong"; children: RichInline[] }
  | { type: "em"; children: RichInline[] }
  | { type: "code"; text: string }
  | { type: "link"; href: string; children: RichInline[] }
  | { type: "conditional"; slug: string; children: RichInline[] }
  | { type: "contact_email" };

export type RichBlock =
  | { type: "paragraph"; children: RichInline[] }
  | { type: "heading"; level: 2 | 3; id?: string; children: RichInline[] }
  | { type: "list"; ordered: boolean; items: { children: RichInline[] }[] }
  | { type: "table"; head: RichInline[][]; rows: RichInline[][][] }
  | { type: "blockquote"; children: RichBlock[] }
  | { type: "conditional"; slug: string; children: RichBlock[] };

export const RichInline: z.ZodType<RichInline> = z.lazy(() =>
  z.union([
    z.strictObject({ type: z.literal("text"), text: RichString }),
    z.strictObject({ type: z.literal("strong"), children: z.array(RichInline).max(200) }),
    z.strictObject({ type: z.literal("em"), children: z.array(RichInline).max(200) }),
    z.strictObject({ type: z.literal("code"), text: RichString }),
    z.strictObject({ type: z.literal("link"), href: Href, children: z.array(RichInline).max(200) }),
    z.strictObject({ type: z.literal("conditional"), slug: Slug, children: z.array(RichInline).max(200) }),
    z.strictObject({ type: z.literal("contact_email") }),
  ]),
);
const Inlines = z.array(RichInline).min(1).max(200);

export const RichBlock: z.ZodType<RichBlock> = z.lazy(() =>
  z.union([
    z.strictObject({ type: z.literal("paragraph"), children: Inlines }),
    z.strictObject({ type: z.literal("heading"), level: z.union([z.literal(2), z.literal(3)]), id: AnchorId.optional(), children: Inlines }),
    z.strictObject({ type: z.literal("list"), ordered: z.boolean(), items: z.array(z.strictObject({ children: Inlines })).min(1).max(50) }),
    z.strictObject({ type: z.literal("table"), head: z.array(z.array(RichInline)).max(12), rows: z.array(z.array(z.array(RichInline)).max(12)).max(100) }),
    z.strictObject({ type: z.literal("blockquote"), children: z.array(RichBlock).min(1).max(20) }),
    z.strictObject({ type: z.literal("conditional"), slug: Slug, children: z.array(RichBlock).min(1).max(50) }),
  ]),
);

export const RichText = z.strictObject({ schemaVersion: z.literal(1), blocks: z.array(RichBlock).min(1).max(300) });
export type RichText = z.infer<typeof RichText>;

// ---------------------------------------------------------------------------------------------
// Fixed keys the layout is built around

export const SERVICE_KEYS = ["ai", "automation", "software", "seo"] as const;
export const STEP_KEYS = ["discover", "define", "build", "improve"] as const;
export const SECTION_KEYS = ["services", "work", "approach", "about", "insights"] as const;
/** The contact chat's topics. Code-owned: the enquiry action validates against the same list (components/home/contact/brief.ts). */
export const CHAT_NEEDS = ["AI & Automation", "Workflows", "Software & Web", "SEO & Growth", "Not sure yet"] as const;
export const ICONS = ["neurology", "infinity", "codeBlocks", "trendingUp"] as const;
export const DIAGRAMS = ["ai", "automation", "software", "seo"] as const;

type ServiceKey = (typeof SERVICE_KEYS)[number];
type StepKey = (typeof STEP_KEYS)[number];

// ---------------------------------------------------------------------------------------------
// settings:site

export const SiteSettings = z.strictObject({
  /** The business name. Never with "Ltd": Chinvat Bridge is not a limited company. */
  siteName: Text(60),
  /** The homepage <title> and the default title of every page. */
  siteTitle: Text(90),
  siteDescription: Text(200),
  /** Where the name comes from; appended to the Organization description in JSON-LD. */
  siteOrigin: Text(400),
  contactEmail: z.email().max(120),
  /** "UK Based // Working Globally": the hero eyebrow and the footer line. Keep verbatim. */
  eyebrow: Text(60),
  /** Alt text of the shared Open Graph image (same as app/opengraph-image.alt.txt). */
  ogImageAlt: Text(300),
  /** schema.org Organization. Always Organization, never LocalBusiness, never a legalName. */
  organization: z.strictObject({
    areaServed: Text(60),
    addressCountry: z.string().regex(/^[A-Z]{2}$/),
    knowsAbout: z.array(Text(80)).min(1).max(12),
  }),
  header: z.strictObject({
    /** The header's contact button below sm, where the full label does not fit. */
    contactShortLabel: Text(30),
  }),
  footer: z.strictObject({
    blurb: Text(300),
    columnTitles: z.strictObject({ explore: Text(30), disciplines: Text(30), clients: Text(30) }),
    /** The Explore column's last link (to the contact section). */
    contactLinkLabel: Text(30),
    /** "© <year> <copyrightHolder>. <rightsNotice>" */
    copyrightHolder: Text(60),
    rightsNotice: Text(80),
    legalLinks: z.array(Link).min(1).max(4),
  }),
  notFound: z.strictObject({
    metaTitle: Text(60),
    eyebrow: Text(40),
    title: Text(80),
    lede: Text(300),
    primaryCta: Link,
    secondaryCta: Link,
    routes: z.array(Link).min(1).max(8),
    /** Before the contact address: "Still stuck?" */
    contactPrompt: Text(60),
    figureDescription: Text(300),
  }),
  articles: z.strictObject({
    publishedLabel: Text(30),
    updatedLabel: Text(30),
    readingTimeLabel: Text(30),
    /** After the minutes: "min read". */
    readingTimeUnit: Text(20),
    allInsightsLabel: Text(40),
    relatedTitle: Text(60),
    /** The closing block of every article (service pages set their own). */
    close: z.strictObject({ title: Text(120), lede: Text(400), ctaLabel: Text(60) }),
  }),
});
export type SiteSettings = z.infer<typeof SiteSettings>;

// ---------------------------------------------------------------------------------------------
// navigation:main

const discipline = <K extends ServiceKey>(key: K) => z.strictObject({ key: z.literal(key), label: Text(60), href: Href });

export const Navigation = z.strictObject({
  /** Homepage chapters in the header, in page order. `key` is the homepage section the link lights for. Unique keys (runtime only). */
  sections: z.array(z.strictObject({ key: z.enum(SECTION_KEYS), label: Text(40), href: Href })).min(1).max(5),
  pricing: Link,
  login: Link,
  contact: Link,
  /** One link per discipline, to its service page (footer). */
  disciplines: z.tuple([discipline("ai"), discipline("automation"), discipline("software"), discipline("seo")]),
});
export type Navigation = z.infer<typeof Navigation>;

// ---------------------------------------------------------------------------------------------
// Collections

const service = <K extends ServiceKey>(key: K) =>
  z.strictObject({
    key: z.literal(key),
    icon: z.enum(ICONS),
    title: Text(80),
    strapline: Text(80),
    description: Text(400),
    /** Not shown on the homepage plate today; kept for the service's own descriptions. */
    tags: z.array(Text(60)).min(1).max(8),
    outcome: Text(60),
    href: Href,
  });

/** collection:services — the four disciplines, in homepage order (the plates are keyed by `key`). */
export const ServicesCollection = z.strictObject({
  items: z.tuple([service("ai"), service("automation"), service("software"), service("seo")]),
});

const step = <K extends StepKey>(key: K) => z.strictObject({ key: z.literal(key), title: Text(40), description: Text(300) });

/** collection:process_steps — the four steps (Method plates and every service page's "How we work"). */
export const ProcessStepsCollection = z.strictObject({
  items: z.tuple([step("discover"), step("define"), step("build"), step("improve")]),
});

/** collection:capabilities — unique keys (runtime only). */
export const CapabilitiesCollection = z.strictObject({
  items: z
    .array(z.strictObject({ key: Key, category: Text(40), title: Text(60), description: Text(300) }))
    .min(1)
    .max(12),
});

/** collection:work_projects — the Recent work index. Concepts must say so (`kind`). Unique keys (runtime only). */
export const WorkProjectsCollection = z.strictObject({
  items: z
    .array(
      z.strictObject({
        key: Key,
        name: Text(80),
        context: Text(200),
        kind: z.enum(["client", "concept"]),
        href: ExternalHref,
        image: z.strictObject({
          /** A screenshot shipped in public/work/. */
          src: z.string().regex(/^\/work\/[a-z0-9-]+\.(?:jpg|png|webp)$/),
          width: z.number().int().min(1).max(8000),
          height: z.number().int().min(1).max(8000),
          alt: Text(600),
        }),
      }),
    )
    .min(1)
    .max(8),
});

// ---------------------------------------------------------------------------------------------
// Pages

export const Seo = z.strictObject({
  /** <title> before the site name, and the social title. */
  title: Text(70),
  description: Text(200),
  /** "noindex" pages are left out of the sitemap (sitemap_entries()). */
  robots: z.enum(["index", "noindex"]),
  /** Sitemap hints. lastmod comes from the page's `updatedOn` (omitted when the page has none). */
  sitemap: z.strictObject({
    changeFrequency: z.enum(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]),
    priority: z.number().min(0).max(1),
  }),
});
/** The homepage takes its title and description from settings (siteTitle, siteDescription). */
export const HomeSeo = Seo.omit({ title: true, description: true });

// Homepage blocks: one fixed sequence (the energy wire is routed through them in this order).

const heroDiscipline = <K extends ServiceKey>(key: K) =>
  z.strictObject({ key: z.literal(key), label: Text(60), short: Text(20), href: Href });

export const HeroBlock = z.strictObject({
  type: z.literal("hero"),
  /** Two lines: the drawn line, then the built line. The eyebrow is settings.eyebrow. */
  titleLines: z.tuple([Text(60), Text(60)]),
  lede: Text(300),
  primaryCta: Link,
  secondaryCta: Link,
  /** The chart's bracket labels. */
  chart: z.strictObject({ above: Text(40), below: Text(40) }),
  /** The four tiers, narrowest first; `short` is lettered inside the tier. */
  disciplines: z.tuple([heroDiscipline("ai"), heroDiscipline("automation"), heroDiscipline("software"), heroDiscipline("seo")]),
});
/** The plates come from collection:services. */
export const ServicePlatesBlock = z.strictObject({ type: z.literal("service_plates"), heading: Text(120) });
/** The projects come from collection:work_projects. */
export const WorkIndexBlock = z.strictObject({
  type: z.literal("work_index"),
  heading: Text(80),
  labels: z.strictObject({ client: Text(40), concept: Text(40) }),
});
const StatePair = z.strictObject({ label: Text(60), status: Text(60) });
export const BridgeSeamBlock = z.strictObject({
  type: z.literal("bridge_seam"),
  heading: Text(80),
  lede: Text(300),
  leftLabel: Text(40),
  rightLabel: Text(40),
  /** The slider's visible label. */
  controlLabel: Text(40),
  /** One row per pair, so today and next always match in number. */
  pairs: z.array(z.strictObject({ current: StatePair, future: StatePair })).min(2).max(8),
});
/** The steps come from collection:process_steps. */
export const MethodBlock = z.strictObject({ type: z.literal("method"), heading: Text(80), cta: Link });
/** The items come from collection:capabilities. */
export const CapabilitiesBlock = z.strictObject({ type: z.literal("capabilities"), heading: Text(80), lede: Text(300) });
export const AboutBlock = z.strictObject({
  type: z.literal("about"),
  heading: Text(120),
  quote: Text(300),
  originTitle: Text(60),
  originBody: Text(600),
  link: Link,
});
export const InsightsTeaserBlock = z.strictObject({
  type: z.literal("insights_teaser"),
  heading: Text(80),
  link: Link,
  count: z.number().int().min(1).max(6),
});
export const ContactBlock = z.strictObject({
  type: z.literal("contact"),
  heading: Text(80),
  lede: Text(300),
  /** Shown without JavaScript, before the contact address. */
  noscriptLead: Text(200),
  chat: z.strictObject({
    greeting: Text(200),
    /** The follow-up question for each topic; the topics themselves are code-owned (CHAT_NEEDS). */
    followUps: z.strictObject(Object.fromEntries(CHAT_NEEDS.map((n) => [n, Text(200)])) as Record<(typeof CHAT_NEEDS)[number], ReturnType<typeof Text>>),
    askContact: Text(200),
    placeholders: z.strictObject({ start: Text(80), details: Text(80) }),
  }),
});

export const HomePage = z.strictObject({
  template: z.literal("home"),
  seo: HomeSeo,
  blocks: z.tuple([
    HeroBlock,
    ServicePlatesBlock,
    WorkIndexBlock,
    BridgeSeamBlock,
    MethodBlock,
    CapabilitiesBlock,
    AboutBlock,
    InsightsTeaserBlock,
    ContactBlock,
  ]),
});

// Service pages: an ordered list of blocks.

export const TextGridContent = z.strictObject({
  type: z.literal("text_grid"),
  columns: z.union([z.literal(2), z.literal(3)]),
  items: z.array(TitledText).min(1).max(12),
});
export const OfferingListContent = z.strictObject({
  type: z.literal("offering_list"),
  items: z.array(z.strictObject({ title: Text(160), body: Text(1200), scope: Text(200).optional() })).min(1).max(12),
});
const TitledList = z.strictObject({ title: Text(80), items: z.array(Text(300)).min(1).max(20) });
export const ListPairContent = z.strictObject({ type: z.literal("list_pair"), lists: z.tuple([TitledList, TitledList]), note: Text(400).optional() });
export const FaqListContent = z.strictObject({
  type: z.literal("faq_list"),
  items: z.array(z.strictObject({ question: Text(200), answer: Text(1500) })).min(1).max(20),
});
export const LinkListContent = z.strictObject({
  type: z.literal("link_list"),
  items: z.array(z.strictObject({ href: Href, title: Text(120), reason: Text(300) })).min(1).max(12),
});
/** A single sentence set off below the content: body size (an aside) or lede size (a conclusion). */
export const NoteContent = z.strictObject({ type: z.literal("note"), size: z.enum(["body", "lede"]), text: Text(600) });
/** Paragraphs, optionally followed by buttons. */
export const ParagraphsContent = z.strictObject({
  type: z.literal("paragraphs"),
  paragraphs: z.array(Text(1200)).min(1).max(8),
  ctas: z.array(Cta).max(3),
});
/** The four shared steps (collection:process_steps), each followed by this page's note for it. */
export const ProcessStepsContent = z.strictObject({
  type: z.literal("process_steps"),
  notes: z.strictObject({ discover: Text(400).optional(), define: Text(400).optional(), build: Text(400).optional(), improve: Text(400).optional() }),
});

export const SectionContent = z.discriminatedUnion("type", [
  TextGridContent,
  OfferingListContent,
  ListPairContent,
  FaqListContent,
  LinkListContent,
  NoteContent,
  ParagraphsContent,
  ProcessStepsContent,
]);

export const PageHeaderBlock = z.strictObject({
  type: z.literal("page_header"),
  kicker: Text(60),
  title: Text(160),
  lede: Text(500),
  /** The service's homepage diagram, shown beside the header. */
  diagram: z.enum(DIAGRAMS),
  ctas: z.array(Cta).min(1).max(3),
});
export const SectionBlock = z.strictObject({
  type: z.literal("section"),
  /** The section's id (unique on the page; runtime only). The heading gets `<anchor>-title`. */
  anchor: AnchorId,
  title: Text(120),
  intro: Text(500).optional(),
  /** Hairline above the section. */
  ruled: z.boolean(),
  background: z.enum(["paper", "raised", "haze"]),
  /** Heading above the content instead of beside it. */
  stacked: z.boolean(),
  content: z.array(SectionContent).min(1).max(6),
});
/**
 * Curated articles (shown once published), then any other published article whose
 * relatedServices names this page. The section is omitted while it would be empty.
 */
export const RelatedInsightsBlock = z.strictObject({
  type: z.literal("related_insights"),
  anchor: AnchorId,
  title: Text(120),
  curated: z.array(z.strictObject({ slug: Slug, reason: Text(300) })).max(12),
});
/** The closing band (the same block that ends every article). */
export const ClosingBlock = z.strictObject({ type: z.literal("closing"), title: Text(120), lede: Text(400), ctaLabel: Text(60) });

export const ServiceBlock = z.discriminatedUnion("type", [PageHeaderBlock, SectionBlock, RelatedInsightsBlock, ClosingBlock]);

export const ServicePage = z.strictObject({
  template: z.literal("service"),
  seo: Seo,
  /** When the content last changed: sitemap lastmod. */
  updatedOn: IsoDate,
  /** schema.org Service (name is also the breadcrumb label and the header kicker). */
  service: z.strictObject({ name: Text(80), serviceType: Text(120) }),
  blocks: z.array(ServiceBlock).min(1).max(30),
});

/** /pricing. The plans themselves are the public.plans table (tag `plans`), not content. */
export const PricingPage = z.strictObject({
  template: z.literal("pricing"),
  seo: Seo,
  breadcrumb: Text(60),
  header: z.strictObject({ kicker: Text(60), title: Text(120), lede: Text(500), link: Link }),
  plans: z.strictObject({
    /** Shown when no plans can be read: "<beforeEmail> <contact email> <afterEmail>". */
    emptyState: z.strictObject({ beforeEmail: Text(300), afterEmail: Text(300) }),
    custom: z.strictObject({
      title: Text(60),
      subtitle: Text(80),
      body: Text(500),
      /** Above the list of services (collection:services titles and straplines). */
      listTitle: Text(60),
      cta: Link,
    }),
  }),
  billing: z.strictObject({
    anchor: AnchorId,
    title: Text(120),
    intro: Text(300),
    items: z.array(TitledText).min(1).max(8),
    links: z.array(Link).max(4),
  }),
  /** The services quoted per project: each listed by its page's service name and meta description. */
  otherServices: z.strictObject({ anchor: AnchorId, title: Text(120), intro: Text(500), pages: z.array(SitePath).min(1).max(6) }),
});

export const InsightsIndexPage = z.strictObject({
  template: z.literal("insights_index"),
  seo: Seo,
  header: z.strictObject({ kicker: Text(60), title: Text(120), lede: Text(300) }),
  /** The CollectionPage name and breadcrumb label. */
  collectionName: Text(60),
});

export const LegalPage = z.strictObject({
  template: z.literal("legal"),
  seo: Seo,
  /** "Last updated" and sitemap lastmod. Change it whenever the text changes. */
  updatedOn: IsoDate,
  header: z.strictObject({ kicker: Text(60), title: Text(120) }),
  lastUpdatedLabel: Text(40),
  /** The opening paragraph, in the lede size. */
  lede: Inlines,
  body: RichText,
});

export const Page = z.discriminatedUnion("template", [HomePage, ServicePage, PricingPage, InsightsIndexPage, LegalPage]);
export type Page = z.infer<typeof Page>;
export type HomePage = z.infer<typeof HomePage>;
export type ServicePage = z.infer<typeof ServicePage>;
export type PricingPage = z.infer<typeof PricingPage>;
export type InsightsIndexPage = z.infer<typeof InsightsIndexPage>;
export type LegalPage = z.infer<typeof LegalPage>;
export type ServiceBlock = z.infer<typeof ServiceBlock>;
export type SectionContent = z.infer<typeof SectionContent>;

// ---------------------------------------------------------------------------------------------
// Documents

export const PAGE_KEY = /^page:\/[a-z0-9/_-]*$/;

/** The schema each fixed document key must satisfy; pages are matched by PAGE_KEY. */
export const DOCUMENT_SCHEMAS = {
  "settings:site": SiteSettings,
  "navigation:main": Navigation,
  "collection:services": ServicesCollection,
  "collection:process_steps": ProcessStepsCollection,
  "collection:capabilities": CapabilitiesCollection,
  "collection:work_projects": WorkProjectsCollection,
} as const;
export type FixedKey = keyof typeof DOCUMENT_SCHEMAS;
export type DocumentData<K extends string> = K extends FixedKey ? z.infer<(typeof DOCUMENT_SCHEMAS)[K]> : Page;
export type ServicesCollection = z.infer<typeof ServicesCollection>;
export type ProcessStepsCollection = z.infer<typeof ProcessStepsCollection>;
export type CapabilitiesCollection = z.infer<typeof CapabilitiesCollection>;
export type WorkProjectsCollection = z.infer<typeof WorkProjectsCollection>;

const envelope = <K extends z.ZodType, D extends z.ZodType>(kind: string, key: K, data: D) =>
  z.strictObject({ key, kind: z.literal(kind), schemaVersion: z.literal(CONTENT_SCHEMA_VERSION), data });

/** A seed or draft document `{key, kind, schemaVersion, data}`: the JSON Schema root. */
export const ContentDocument = z.union([
  envelope("settings", z.literal("settings:site"), SiteSettings),
  envelope("navigation", z.literal("navigation:main"), Navigation),
  envelope("collection", z.literal("collection:services"), ServicesCollection),
  envelope("collection", z.literal("collection:process_steps"), ProcessStepsCollection),
  envelope("collection", z.literal("collection:capabilities"), CapabilitiesCollection),
  envelope("collection", z.literal("collection:work_projects"), WorkProjectsCollection),
  envelope("page", z.string().regex(PAGE_KEY), Page),
]);
export type ContentDocument = z.infer<typeof ContentDocument>;

/** Templates a fixed path must use (runtime only). Other page paths may use service or legal. */
export const TEMPLATE_FOR_PATH: Record<string, Page["template"]> = {
  "/": "home",
  "/pricing": "pricing",
  "/insights": "insights_index",
};

// ---------------------------------------------------------------------------------------------
// Validation

export class InvalidDocumentError extends Error {}

function duplicates(values: string[]): string[] {
  return values.filter((v, i) => values.indexOf(v) !== i);
}

/** Cross-field rules JSON Schema cannot express. Returns problems, empty when valid. */
export function crossFieldProblems(key: string, data: unknown): string[] {
  const problems: string[] = [];
  const d = data as Record<string, unknown>;
  const dupes = (label: string, values: string[]) => {
    const found = duplicates(values);
    if (found.length) problems.push(`${label}: duplicate ${[...new Set(found)].join(", ")}`);
  };
  if (key === "navigation:main") dupes("sections.key", (d.sections as { key: string }[]).map((s) => s.key));
  if (key === "collection:capabilities" || key === "collection:work_projects") dupes("items.key", (d.items as { key: string }[]).map((i) => i.key));
  if (PAGE_KEY.test(key)) {
    const page = data as Page;
    const path = key.slice("page:".length);
    const required = TEMPLATE_FOR_PATH[path];
    if (required && page.template !== required) problems.push(`${path} must use the ${required} template`);
    if (!required && (page.template === "home" || page.template === "pricing" || page.template === "insights_index")) {
      problems.push(`the ${page.template} template is only for ${Object.keys(TEMPLATE_FOR_PATH).find((p) => TEMPLATE_FOR_PATH[p] === page.template)}`);
    }
    if (page.template === "service") {
      dupes("anchors", page.blocks.flatMap((b) => (b.type === "section" || b.type === "related_insights" ? [b.anchor] : [])));
      if (page.blocks[0]?.type !== "page_header" || page.blocks.filter((b) => b.type === "page_header").length !== 1) {
        problems.push("a service page starts with exactly one page_header");
      }
    }
  }
  return problems;
}

/** Validates one document's data for its key; throws InvalidDocumentError naming the first problems. */
export function parseDocumentData<K extends string>(key: K, data: unknown): DocumentData<K> {
  const schema = (DOCUMENT_SCHEMAS as Record<string, z.ZodType>)[key] ?? (PAGE_KEY.test(key) ? Page : null);
  if (!schema) throw new InvalidDocumentError(`${key}: unknown document key`);
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.slice(0, 5).map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`);
    throw new InvalidDocumentError(`${key}: ${issues.join("; ")}`);
  }
  const problems = crossFieldProblems(key, result.data);
  if (problems.length) throw new InvalidDocumentError(`${key}: ${problems.join("; ")}`);
  return result.data as DocumentData<K>;
}

/** The kind a key implies (the database checks the same: kind = split_part(key, ':', 1)). */
export const kindOf = (key: string) => key.slice(0, key.indexOf(":"));
