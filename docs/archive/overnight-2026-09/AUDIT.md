# Repo Audit — Chinvat Bridge

**Last verified:** 15 September 2026, against the repo as it was then. Facts about
the business (names, prices, contact details) change rarely. The route list and
build output can go stale, so re-check those if the code has changed since this date.

Every fact below was checked against the actual repo (constants, data files,
migrations, commit history). Nothing was invented to fill gaps. Where something is
unknown, it says UNKNOWN. **Never fill those gaps with made-up values.**

## How to use this file (for Claude Code)

The two files each own different things:

- **`OVERNIGHT_TASK.md` decides:** colours, light/dark themes, fonts, readability
  and contrast. The old dark-obsidian/gold palette is being replaced by light and
  dark themes with a neon yellow primary colour. Restyling existing components to
  achieve this is expected.
- **This file decides:** business facts, contact details, prices, copy, routes,
  which components exist, and what content may be created. Never contradict it.

Decisions already made, so neither file needs to be interpreted:

- **Components:** reuse the ones listed below. Restyle them freely for the new
  themes and readability, but don't delete them, and don't invent new visual
  patterns or add UI libraries. `Eyebrow` stays; its styling (size, weight,
  letter-spacing, case) may change.
- **Theme toggle:** goes in `Header` and `MobileNav`. `CheckoutShell` gets no
  toggle and no extra navigation; it follows the saved or OS theme.
- **Structured data:** use `Organization`, never `LocalBusiness` (there is no
  public address, phone number or city).
- **Content:** no new articles, blog pages, service pages, testimonials or
  statistics.

## Copy rules

- British English. Don't change British spellings (colour, optimise,
  organisation) to American ones.
- Keep "UK Based // Working Globally" exactly as written; the `//` is
  deliberate, not a typo.
- Prices, plan names and the contact email must match the facts below exactly.
- Only fix clear typos. Don't rewrite copy for tone.

## Validation commands (verbatim from package.json)

Package manager: **pnpm**.

| Purpose | Command | Result at baseline |
|---|---|---|
| dev | `pnpm run dev` (`next dev`) | works |
| build | `pnpm run build` (`next build`) | **pass**, 0 errors. Also type-checks the project. |
| lint | `pnpm run lint` (`eslint`) | **pass**, 0 errors/warnings |
| typecheck | *no script* | TypeScript is checked inside `next build`. No standalone `tsc --noEmit` script. |
| format | *no script* | No Prettier/formatter configured. |
| test | *no script* | No test runner. Zero automated tests exist. |

Missing commands are recorded as missing. Don't invent them.

## Business facts

```
Business name:        Chinvat Bridge
What it sells:        UK-based technology consultancy with four disciplines:
                        AI & Automation Integration, Automation & Workflows,
                        Software & Web (custom builds), and SEO & Digital Growth.
                        Only SEO & Digital Growth is sold self-serve, as 3 Stripe
                        subscription tiers: Starter £299/mo, Growth £499/mo,
                        Scale £799/mo. The other three are quote-based
                        ("get in touch for a scoped quote", see Services.tsx).
Primary market:       UK-based, working globally (site copy: "UK Based // Working
                        Globally"). Not city-specific.
Production domain:    https://www.chinvatbridge.uk (live)
Company registration: UNKNOWN. No company number, registered address or
                        sole-trader status anywhere in the repo.
Contact email:        chinvatbridge.tech@gmail.com (CONTACT_EMAIL in
                        src/lib/constants.ts). Do not change it.
Contact phone:        none. Email only (mailto: links). No phone number anywhere.
Social profiles:      none. No social links anywhere in the codebase.
Form backend:         none. Contact CTAs are plain mailto: links (Contact.tsx,
                        AdvisoryChannel.tsx, ComingSoonNotice.tsx). They work by
                        opening the visitor's email app.
Analytics:            none. No tracking scripts, no cookie banner, and none is
                        needed because nothing sets a tracking cookie.
Brand voice:          Plain, precise, no hype, no fabricated stats or claims,
                        British English. Deliberately avoids the
                        "sovereign/consular" jargon of the original design
                        reference in favour of a grounded, credible tone.
```

### Known issue — owner to fix by hand

`SITE_URL`'s fallback in `src/lib/constants.ts` (used only when
`NEXT_PUBLIC_SITE_URL` is unset) still says `https://www.chinvatbridge.co.uk`.
That domain doesn't resolve. The correct value is `https://www.chinvatbridge.uk`.
Production sets `NEXT_PUBLIC_SITE_URL` correctly, so the live site isn't affected.

**Claude Code: don't edit this yourself.** If it still says `.co.uk`, leave it and
mention it in PROGRESS.md.

## Route inventory

| File | URL | Type | Metadata |
|---|---|---|---|
| `src/app/page.tsx` | `/` | static | inherits root layout default (intentional) |
| `src/app/pricing/page.tsx` | `/pricing` | dynamic (reads `plans` table) | ✅ |
| `src/app/login/page.tsx` | `/login` | dynamic (reads `?error`) | ✅ |
| `src/app/privacy/page.tsx` | `/privacy` | static | ✅ |
| `src/app/terms/page.tsx` | `/terms` | static | ✅ |
| `src/app/client-portal/page.tsx` | `/client-portal` | static, `noindex` | ✅ ("preview only") |
| `src/app/dashboard/page.tsx` | `/dashboard` | dynamic, auth-gated, `noindex` | ✅ |
| `src/app/admin/page.tsx` | `/admin` | dynamic, admin-gated, `noindex` | ✅ |
| `src/app/admin/customers/[id]/page.tsx` | `/admin/customers/[id]` | dynamic, admin-gated, `noindex` | ✅ |
| `src/app/subscribe/details/page.tsx` | `/subscribe/details?plan=` | dynamic, `noindex` | ✅ |
| `src/app/subscribe/success/page.tsx` | `/subscribe/success` | dynamic, `noindex` | ✅ |
| `src/app/subscribe/cancelled/page.tsx` | `/subscribe/cancelled` | static, `noindex` | ✅ |
| `src/app/subscribe/error/page.tsx` | `/subscribe/error` | dynamic, `noindex` | ✅ |
| `src/app/auth/callback/route.ts` | `/auth/callback` | route handler (OAuth/OTP code exchange) | n/a |
| `src/app/auth/checkout-login/route.ts` | `/auth/checkout-login` | route handler (auto-login after purchase) | n/a |
| `src/app/api/webhooks/stripe/route.ts` | `/api/webhooks/stripe` | route handler (Stripe webhook) | n/a |
| *(Next built-ins)* | `/sitemap.xml`, `/robots.txt`, `/icon`, `/opengraph-image`, `/_not-found` | generated | — |

**Theme note:** the light/dark themes must also work on the auth-gated pages
(dashboard, admin) and in `CheckoutShell`, not just the public pages. These pages
can't be viewed without logging in, so check their components in code.

Services are anchor sections on the homepage (`/#services`, `/#approach`, etc.),
not separate routes. Nothing in the navigation or copy promises separate service
pages, so don't create them.

## Gaps found

- **404 page:** no `app/not-found.tsx`; the site uses Next's default. A styled 404
  built from existing components is a reasonable improvement.
- **Blog:** no `/insights` or `/blog` routes. The homepage Insights section
  (`src/data/insights.ts`) lists 4 topics honestly marked "Planned Briefing" /
  "Topic in Development", with no links and no fake dates. This is intentional.
  **Don't write articles or build a blog during overnight runs.** New published
  content needs the owner's review.

## Internal link audit

Every `href` in the codebase (excluding `reference/*.html`, which are static design
mockups the app never serves):

| href | Resolves? |
|---|---|
| `/` | ✅ |
| `/#contact`, `/#services` | ✅ (real homepage sections) |
| `#main-content` | ✅ (skip-link target in `SiteShell`) |
| `/admin` | ✅ (admin-gated) |
| `/client-portal` | ✅ |
| `/login` | ✅ |
| `/pricing` | ✅ |
| `/privacy` | ✅ |
| `/terms` | ✅ |
| `/subscribe/details?plan=${plan.id}` | ✅ (plan.id comes from the `plans` table) |
| `/auth/checkout-login?session_id=${sessionId}` | ✅ |
| `/admin/customers/${customer.id}` | ✅ |
| `mailto:${CONTACT_EMAIL}` (several) | ✅ (opens email app) |
| `https://stripe.com/gb/privacy` | ✅ (external, linked from Terms) |

**Zero `href="#"`, zero dead links, zero empty `onClick` handlers.**

Don't restyle or edit `reference/*.html`. They aren't part of the live site.

## Intentionally disabled controls

- `AdvisoryChannel.tsx`: the "Schedule Strategy Call (Coming Soon)" button uses the
  native `disabled` attribute. This is honest and correct. Leave it disabled, and
  make sure its disabled style is still readable in both themes.

## Placeholder content scan

`grep -rniE "lorem ipsum|TODO|FIXME|coming soon|example\.com|test@|dummy" src`
found only the "(Coming Soon)" label above. No lorem ipsum, no TODO/FIXME, no
`example.com` or `test@` addresses, no dummy data in `src/`.

## Reusable components (atomic design — reuse these)

- **Atoms:** `Button`, `SubmitButton`, `Chip`, `Container`, `CornerFrame`,
  `EmailLink`, `Eyebrow`, `SectionHeading`, `SteppedProgressBar`, icon set (`icons/`)
- **Molecules:** `Bay`, `BrandLockup`, `BulletRow`, `CheckoutStepper`,
  `ComingSoonNotice`, `FormField`, `Section`, `SectionIntro`
- **Organisms:** homepage sections (`Hero`, `Services`, `ServiceCard`,
  `Capabilities`, `Process`, `Insights`, `Philosophy`, `Contact`, `Pricing`,
  `PricingCard`); layout (`Header`, `Footer`, `MobileNav`); checkout
  (`DetailsForm`, `PlanSummary`); dashboard (`RealEngagementSummary`,
  `RealProjectProgress`, `RealSprintLog`, `RealUpdatesArchive`, `AdvisoryChannel`,
  plus preview versions `EngagementSummary`, `SprintLog`, `ReportsArchive`,
  `DeliverableProgress`, `PreviewBanner`); auth (`LoginForm`)
- **Templates:** `SiteShell` (header + footer + skip link), `CheckoutShell`
  (minimal, no nav, deliberately distraction-free), `StatusPage` (confirmation/error
  card; `bare` prop for embedding in another shell)

Build any new page from these. Restyle them for the new themes and better
readability, but don't remove existing components (including `Eyebrow`) or change
page structure without a clear readability reason logged in PROGRESS.md.

## Existing backend (keep legal pages accurate)

Live Supabase Postgres tables: `customers`, `customer_updates`,
`customer_progress_items`, `customer_sprint_items`, `plans`. Stripe subscriptions
(test mode). Google OAuth and email magic-link auth.

Data actually collected: email, name, company, phone, website, country, and billing
data via Stripe. `/privacy` already describes this. Don't edit legal pages to
describe systems that don't exist (for example, no analytics-cookie wording).

## Baseline validation output (15 September 2026)

```
$ pnpm run lint
$ eslint
(exit 0, no output)

$ pnpm run build
✓ Compiled successfully
✓ Running TypeScript — 0 errors
✓ Generating static pages (21/21)
(exit 0)
```

No inherited errors. Any failure after this point was introduced by later changes.
