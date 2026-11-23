# Visible strings that stay in code

Public marketing copy comes from the editorial documents in this folder (settings, navigation,
collections, pages) through `src/lib/content`. The strings below stay in code on purpose. Each is
listed with the reason; anything not listed here and visible on a public page is a bug.

## Application behaviour, not copy

| Where | Strings | Why it stays in code |
|---|---|---|
| `components/home/contact/brief.ts` `NEEDS` | "AI & Automation", "Workflows", "Software & Web", "SEO & Growth", "Not sure yet" | A server contract: `actions/enquiry.ts` validates the posted topic against this list. The content schema fixes `chat.followUps` to exactly these keys (`CHAT_NEEDS`) so the follow-up lines stay editable. |
| `components/home/contact/ContactChat.tsx` | Validation messages, "That didn't go through.", the "sent" line template (interpolates the visitor's name and email), "Chinvat Bridge" header, "1 of 3" progress, "Edit", form labels (Name, Email, Company (optional)), button labels | Form behaviour and error handling; templates with interpolation. |
| `components/home/contact/brief.ts` `buildMessage` | Enquiry subject and body template, `mailto:` fallback | The email the team receives, not page copy. |
| `components/site/*` | "Skip to content", "Menu", "Site navigation", aria labels ("Main", "Mobile", "Footer: …") | Accessibility scaffolding of the shell. |
| `components/home/work/WorkIndex.tsx` | " (opens in a new tab)" (screen readers) | Accessibility. |
| `components/home/bridge/BridgeSeam.tsx` | Slider value text template ("…% modernised: … to …"), "to" (screen readers) | Interpolated accessibility text; the pair labels themselves are content. |
| `components/home/hero/CrossingHero.tsx`, `brand/Lockup.tsx`, `brand/Mark` | "Chinvat Bridge" mark title and lockup label | Brand assets (the generated mark), not copy. |
| `components/home/services/ServicePlate.tsx` | "Read the article" / "Explore the service" / "See pricing" | Derived from each service's link target. |
| `app/error.tsx` | The error page | Must render when content cannot be loaded. |
| `components/content/LegalPage.tsx`, `insights/*` | "About this document", "About this article" (aria labels) | Accessibility. |

## Application pages (not marketing content)

Login, checkout (`/subscribe/*`), the dashboard, admin, and the `/client-portal` preview with its
example data, plus their components (`organisms/**`, `molecules/**`, `templates/CheckoutShell`,
`StatusPage`). These are product UI owned by the platform stream; their wording changes with the
code that drives it.

## Data that is not editorial content

- **Plans** (names, prices, specs, capabilities): `public.plans`, read by `getPlans()` (tag `plans`).
- **Redirects**: `next.config.ts` (ARCHITECTURE_DECISIONS D15). Article slug changes redirect at
  runtime through `article_redirect()`.
- **SEO configuration**: canonical origin (`SITE_URL`), robots rules, structured-data types
  (Organization, never LocalBusiness), the title template's separator.
- **Constants for app-owned pages**: `SITE_NAME`, `CONTACT_EMAIL` in `src/lib/constants.ts` serve the
  checkout, portal, error page and enquiry email, which render outside the content model. They must
  match `settings:site`.

## Dev-only studies

`components/home/hero/content.ts` (`HERO_COPY`) is used only by the hero studies
(`/hero-studies/*`, 404 in production). The shipped hero reads `page:/`.

## Still code-owned pending another stream

- `src/data/service-pages.ts` and `src/data/seo-service.ts` remain only because
  `app/api/editorial/revalidate/route.ts` imports them. Service pages render from `page:/services/*`.
- The homepage Insights teaser (`components/home/insights/Insights.tsx`) still has its heading and
  link label in code; the `insights_teaser` block in `page:/` holds the same copy for it to adopt.
- `/insights` and article pages (labels "Published", "Updated", "Reading time", "All insights",
  "Related reading", the closing block) are in `settings:site` (`articles`) for the insights stream
  to adopt.
