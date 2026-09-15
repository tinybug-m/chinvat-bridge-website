# Repo Audit — Chinvat Bridge

Generated for the overnight mission, Phase 0. All facts below are verified from the actual
repo content (constants, data files, migrations, live commit history) — nothing here is
invented to fill mission-template blanks.

## Validation commands (verbatim from package.json)

| Purpose | Command | Result at baseline |
|---|---|---|
| dev | `pnpm run dev` (`next dev`) | works |
| build | `pnpm run build` (`next build`) | **pass**, 0 errors (includes TypeScript checking as part of the build step) |
| lint | `pnpm run lint` (`eslint`) | **pass**, 0 errors/warnings |
| typecheck | *no dedicated script* | TypeScript is checked as part of `next build`; there is no standalone `tsc --noEmit` script to run independently |
| format | *no script exists* | no Prettier/formatter configured in this repo |
| test | *no script exists* | no test runner configured; zero automated tests exist |

Per the mission's own rule ("If a command doesn't exist, say so — don't invent one"), typecheck/format/test
are recorded as absent rather than fabricated.

## Corrected business facts (Section 0 of the mission file)

The mission template's own guesses for "what it sells" and most other Section 0 fields are
either blank placeholders or don't match this repo. Filled in here from verified repo content only:

```
Business name:        Chinvat Bridge
What it sells:        UK-based technology consultancy — four disciplines: AI & Automation
                       Integration, Automation & Workflows, Software & Web (custom builds),
                       and SEO & Digital Growth. Only SEO & Digital Growth is currently sold
                       as a self-serve product (3 Stripe subscription tiers: Starter £299/mo,
                       Growth £499/mo, Scale £799/mo). The other three disciplines are
                       consultation/quote-based ("get in touch for a scoped quote" — see
                       Services.tsx), not self-serve.
Primary market:        UK-based, working globally (site copy: "UK Based // Working Globally") — not city-specific
Production domain:     https://www.chinvatbridge.uk  (confirmed live; see note below)
Company registration:  UNKNOWN — nothing in the repo states a company number, registered
                        address, or "sole trader" status. Do not invent one.
Contact email:         UNRESOLVED — see "Open question" below
Contact phone:         none — email only (CONTACT_MAILTO / mailto: links only, no phone
                        number anywhere in the repo)
Real social profiles:  none — no social links exist anywhere in the codebase
Form backend:          none — the "contact form" is not a form at all. Contact/Advisory
                        Channel CTAs are plain `mailto:` links (see Contact.tsx,
                        AdvisoryChannel.tsx, ComingSoonNotice.tsx). This already works (opens
                        the visitor's own email client) — it is a real destination, not a
                        dead one, just not a server-side form + provider.
Analytics:             none installed — no GA4/Plausible/any tracking script anywhere in the
                        repo. No cookie banner exists; none is currently needed since nothing
                        sets a tracking cookie.
Brand voice:           Plain, precise, no hype, no fabricated stats/claims, British English.
                        Established explicitly across this project's history — deliberately
                        avoids the "sovereign/consular" jargon of the original design
                        reference in favour of a credible, grounded tone.
```

### Open question — needs your review (do not resolve automatically)

`CONTACT_EMAIL` in `src/lib/constants.ts` is `inquiries@chinvatbridge.co.uk` — the **`.co.uk`**
domain. But the site's real, live, DNS-resolving domain is **`chinvatbridge.uk`** (no "co.").
`chinvatbridge.co.uk` does not resolve at all (confirmed via DNS lookup earlier this project).
This was flagged mid-session once already and never answered: do you have a working inbox at
`inquiries@chinvatbridge.uk`, or is `.co.uk` a separately-owned domain you actually receive
mail at? Left untouched pending your answer — this mission will not guess a business email
domain.

Similarly, `SITE_URL`'s hardcoded *fallback* (used only if `NEXT_PUBLIC_SITE_URL` is unset) in
`src/lib/constants.ts` still says `https://www.chinvatbridge.co.uk` — the dead domain. The
real domain is correctly set via the `NEXT_PUBLIC_SITE_URL` env var in production, so this
fallback isn't live-affecting today, but it's a stale value that should be corrected to
`chinvatbridge.uk` once the email-domain question above is answered (both likely want the
same fix at the same time).

## Route inventory

| File | URL | Type | Metadata |
|---|---|---|---|
| `src/app/page.tsx` | `/` | static | inherits root layout default (no per-page override — intentional) |
| `src/app/pricing/page.tsx` | `/pricing` | dynamic (reads `plans` table) | ✅ |
| `src/app/login/page.tsx` | `/login` | dynamic (reads `?error`) | ✅ |
| `src/app/privacy/page.tsx` | `/privacy` | static | ✅ |
| `src/app/terms/page.tsx` | `/terms` | static | ✅ |
| `src/app/client-portal/page.tsx` | `/client-portal` | static, `noindex` | ✅ (explicit "preview only") |
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

No route file exists for a 404 page beyond Next's built-in `_not-found` — **flagged for Phase 6**
(mission requires a real, useful `app/not-found.tsx`; currently using the framework default).

No blog routes exist yet (`/insights` or `/blog` + `[slug]`) — flagged for Phase 3.

No standalone per-service pages exist — services are homepage anchor sections
(`/#services`, `/#approach`, etc.), not separate routes. See "Phase 1 finding" below.

## Internal link audit

Every `href` value found in the codebase (excluding `reference/*.html`, which are static design
mockups never served by the app):

| href | Resolves? |
|---|---|
| `/` | ✅ |
| `/#contact`, `/#services` | ✅ (real sections on the homepage) |
| `#main-content` | ✅ (skip-to-content anchor, real target in `SiteShell`) |
| `/admin` | ✅ (admin-gated) |
| `/client-portal` | ✅ |
| `/login` | ✅ |
| `/pricing` | ✅ |
| `/privacy` | ✅ |
| `/terms` | ✅ |
| `/subscribe/details?plan=${plan.id}` | ✅ (dynamic, plan.id always valid — sourced from the `plans` table itself) |
| `/auth/checkout-login?session_id=${sessionId}` | ✅ |
| `/admin/customers/${customer.id}` | ✅ |
| `mailto:${CONTACT_EMAIL}` (several) | ✅ (opens mail client — real destination) |
| `https://stripe.com/gb/privacy` | ✅ (external, Stripe's own privacy page, linked from Terms) |

**Zero `href="#"`, zero dead links, zero empty `onClick` handlers found.**

## Buttons / interactive elements without a real destination

None found with a *missing* destination. One intentionally-disabled control exists and is
honestly labeled, not a fake link:
- `AdvisoryChannel.tsx` — "Schedule Strategy Call (Coming Soon)" button uses the native
  `disabled` attribute (removed from tab order, not clickable, not styled as if it were) —
  this is the correct honest pattern per the mission's own ground rules, not a violation.

## Placeholder / dummy content scan

`grep -rniE "lorem ipsum|TODO|FIXME|coming soon|example\.com|test@|dummy" src` → only one
substantive hit, the same honest "(Coming Soon)" label above (a real disabled control, not
placeholder copy standing in for missing content). No lorem ipsum, no TODO/FIXME comments, no
`example.com`/`test@` addresses, no dummy data anywhere in `src/`.

The **Insights homepage section** (`src/data/insights.ts`) lists 4 topics honestly marked
`"Planned Briefing"` / `"Topic in Development"` — this is a deliberate, honest "not published
yet" state (no links, no fake dates), not a placeholder violation. These 4 topics are the
natural candidates for Phase 4's articles (see below) — completing them turns an honest
"coming soon" into real content, which is exactly what the mission's ground rules want.

## Phase 1 finding — no additional pages are implied by navigation

`NAV_LINKS` and `SECTION_NAV_LINKS` only ever point to in-page anchors on the homepage
(`/#services`, `/#approach`, `/#insights`, `/#about`) or to real existing routes. No copy
anywhere says "read more," "learn more about [service]," "view case study," or similar with no
backing link. **Conclusion: the mission's default expectation of a "services index + one page
per service" does not apply here** — nothing in the actual site implies those pages should
exist; they were never promised. The one clear structural gap versus what's *implied* is the
Insights section's own honest "coming soon" state, which does imply a future blog (Phase 3/4).

A real `app/not-found.tsx` is a genuine gap (Phase 6) — not implied by nav copy, but required
by the mission's Definition of Done regardless.

## Reusable components available (atomic design — already established, do not introduce new patterns)

- **Atoms**: `Button`, `SubmitButton`, `Chip`, `Container`, `CornerFrame`, `EmailLink`,
  `Eyebrow`, `SectionHeading`, `SteppedProgressBar`, icon set (`icons/`)
- **Molecules**: `Bay`, `BrandLockup`, `BulletRow`, `CheckoutStepper`, `ComingSoonNotice`,
  `FormField`, `Section`, `SectionIntro`
- **Organisms**: full section set for the homepage (`Hero`, `Services`, `ServiceCard`,
  `Capabilities`, `Process`, `Insights`, `Philosophy`, `Contact`, `Pricing`, `PricingCard`),
  layout (`Header`, `Footer`, `MobileNav`), checkout (`DetailsForm`, `PlanSummary`), dashboard
  (`RealEngagementSummary`, `RealProjectProgress`, `RealSprintLog`, `RealUpdatesArchive`,
  `AdvisoryChannel`, plus the static preview versions `EngagementSummary`/`SprintLog`/
  `ReportsArchive`/`DeliverableProgress`/`PreviewBanner`), auth (`LoginForm`)
- **Templates**: `SiteShell` (header+footer+skip-link), `CheckoutShell` (minimal, no nav —
  deliberately distraction-free for the checkout funnel), `StatusPage` (confirmation/error card,
  `bare` prop for embedding inside another shell)

Any new page must be built from these — no new visual patterns, no new colors, matching the
existing dark-obsidian/gold "Bridge" design language.

## Existing backend (relevant to legal-copy accuracy in Phase 1/6)

Real, live Supabase Postgres tables (not hypothetical): `customers`, `customer_updates`,
`customer_progress_items`, `customer_sprint_items`, `plans`. Real Stripe subscriptions (test
mode). Real Google OAuth + email magic-link auth. This matters for Privacy Policy accuracy —
the existing `/privacy` page already describes real data practices; any Phase-1 legal review
must stay consistent with what's actually collected (email, name, company, phone, website,
country, billing data via Stripe) and not describe systems that don't exist (e.g., no
analytics, so no analytics-cookie language should be added).

## Baseline validation output

```
$ pnpm run lint
$ eslint
(exit 0, no output — clean)

$ pnpm run build
✓ Compiled successfully
✓ Running TypeScript — 0 errors
✓ Generating static pages (21/21)
(exit 0)
```

No inherited errors of any kind. Any failure introduced after this point in the mission is new.
