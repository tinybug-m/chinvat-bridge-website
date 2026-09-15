# MISSION — Bring this website to production-ready state

You are the senior engineer on this codebase. Work autonomously. Implement, don't propose.

---

## 0. PROJECT FACTS (fill these in before running — do not invent them)

Claude Code must treat this block as the only source of truth about the business. Anything not stated here and not already in the repo does **not** get written into the site.

```
Business name:        Chinvat Bridge
What it sells:        Websites + local Google/SEO services to UK businesses
Primary market:       <e.g. UK-wide / specific cities — fill in>
Production domain:    https://<fill in>
Company registration: <company no. / trading name / registered address, or "sole trader — omit">
Contact email:        <fill in>
Contact phone:        <fill in, or "none — email only">
Real social profiles:  <list only accounts that actually exist; otherwise write "none">
Form backend:         <e.g. Resend / Formspree / none yet>
Analytics:            <e.g. GA4 ID / Plausible / none>
Brand voice:          <e.g. plain, direct, no jargon, British spelling>
```

If any field above is left blank or marked unknown, **do not guess** — implement the feature so the missing value is a single clearly-named constant in `src/config/site.ts` (or the project's equivalent), log it in the assumptions file, and move on.

---

## 1. GROUND RULES (these override every priority below)

**Never fabricate.** No invented testimonials, client logos, case studies, review counts, "trusted by 200+ businesses", awards, team members, years in business, pricing that isn't already in the repo, or statistics without a real cited source. If a section's design needs social proof that doesn't exist, either remove the section or replace it with something truthful (e.g. a process explainer, an FAQ, a service breakdown).

**Never create fake destinations.** No `href="#"`, no `onClick={() => {}}`, no routes that 404, no social icons linking to nothing, no "coming soon" pages. If a control has no legitimate destination, either build the destination or delete the control — deleting is acceptable and often correct.

**No doorway pages.** Do not mass-generate `/seo-in-{town}` style location pages. Google treats thin templated location pages as spam and it would damage the exact client the site is selling to. Any location page must be genuinely distinct in content, and there should be at most a handful.

**Stay inside the existing stack.** No new dependencies unless a task is impossible without one — and if you add one, justify it in the assumptions file. No architectural rewrites. No redesign. Match existing patterns, file layout, naming, and Tailwind/CSS conventions already in the repo.

**Legal/compliance is part of "complete" for a UK business site:** privacy policy, cookie notice consistent with whatever analytics is actually installed, terms of service, and accessibility-sane markup. Write real UK-appropriate copy, but add a visible `TODO: review before publishing` HTML comment at the top of each legal page — these need human sign-off.

**Scope discipline.** Prefer editing existing files over creating new ones. Don't refactor code you weren't asked to touch. Don't reformat files you didn't otherwise change.

---

## 2. PHASE 0 — AUDIT FIRST (no code changes)

Before writing any feature code:

1. `git status`, `git branch`, `git log --oneline -20`. Preserve uncommitted work — do not stash or discard it. Report what you find.
2. Create a working branch: `git checkout -b overnight/site-completion`.
3. Read `package.json` and record the exact commands for: dev, build, typecheck, lint, format, test. Use those commands verbatim for the rest of the session. If a command doesn't exist, say so — don't invent one.
4. Build a full inventory and write it to `.claude/audit.md`:
   - every route that exists (file path → URL)
   - every internal link/href in the codebase, marked ✅ resolves / ❌ dead
   - every button and interactive element with no handler or no destination
   - every placeholder string (lorem, TODO, FIXME, "coming soon", dummy emails/phones, `example.com`)
   - existing metadata coverage per route
   - existing components you can reuse (button, card, section, container, form)
   - what the site's actual service offering is, inferred from existing copy
5. Run the validation suite once now and record the baseline output in `.claude/audit.md`. You need to know which errors you inherited vs. which you introduce.

Commit: `chore: repo audit and route inventory`.

Only after the audit is written do you start implementing.

---

## 3. WORK PHASES

Complete each phase fully, validate, commit, update `.claude/overnight-progress.md`, then move to the next. One logical commit per phase minimum. Never use `--no-verify`, `git reset --hard`, force push, or push to remote at all.

### Phase 1 — Missing pages
Create every page implied by existing navigation, CTAs, footers, and business purpose. Derive them from the audit, not from imagination. Expect roughly: home, services index, one page per service already named in the site, about, contact, pricing (only if pricing already exists in the repo), legal pages, 404, blog. Every new page uses existing layout/section components.

### Phase 2 — Every interaction works
Each button, link, card, breadcrumb and form gets a real destination or a real action. For the contact form specifically: implement client + server validation, a real submit path (a Next.js route handler or server action calling the configured provider), loading state, success state, and error state. If no email provider is configured, implement the full flow against a single adapter function that throws a clear "not configured" error, and note it in the assumptions file — do not silently swallow submissions.

### Phase 3 — Blog architecture
Simplest maintainable option that fits the stack: MDX or typed markdown in `content/blog/`, read at build time, statically generated. No CMS, no database, no admin UI. Required: listing page with pagination-ready structure, `[slug]` pages, typed frontmatter (title, slug, description, date, updated, author, tags, image, draft flag), draft posts excluded from build and sitemap, reading time, related-posts by shared tag. Adding a new article must mean: drop one file in a folder, nothing else.

### Phase 4 — Initial articles
Write **4–6** articles, 1,200–1,800 words each, on topics a UK small-business owner would actually search for and that match what this business sells. Choose from: Google Business Profile optimisation, why a local business ranks below competitors, what a small business website should actually cost in the UK, Core Web Vitals in plain English, getting reviews without breaking Google's rules, local keyword research without paid tools.

Quality bar:
- Open with the answer, not "In today's digital landscape".
- Concrete and specific: real settings names, real steps, real screenshots-described-in-alt-text, real numbers only where verifiable.
- British spelling and UK context (Companies House, VAT, UK phone formats, GBP).
- One primary intent per article. No keyword stuffing. No claims about results the business hasn't made elsewhere in the repo.
- 2–4 contextual internal links per article to relevant service pages, placed where they genuinely help.
- Every article ends with one honest, non-pushy CTA.

### Phase 5 — Per-page SEO
Use the Next.js App Router metadata API — `generateMetadata` for dynamic routes, static `metadata` exports elsewhere, with `metadataBase` and shared defaults in the root layout so nothing is duplicated. Per page: unique title (≤60 chars) and description (140–160 chars), canonical, Open Graph, Twitter card, exactly one H1, logical heading order, descriptive alt text on every image, `next/image` everywhere with correct sizes.

### Phase 6 — Technical SEO
`app/sitemap.ts` generating all public routes + published articles with real lastModified dates. `app/robots.ts` allowing crawl and pointing at the sitemap. `app/not-found.tsx` with useful links, not a dead end. JSON-LD via a small typed helper: `LocalBusiness`/`Organization` on home, `Service` on service pages, `Article` + `BreadcrumbList` on posts, `FAQPage` only where visible FAQ content actually exists on the page. Drafts, previews and any authed routes excluded from the sitemap and set `noindex`.

### Phase 7 — Internal linking
Home → services index → individual services → articles → contact should all be reachable by crawlable `<Link>` navigation. Services link to relevant articles; articles link back to relevant services. Footer carries the full route map. No link spam, no repeated exact-match anchor text.

### Phase 8 — UX consistency
Audit against the existing design system only: spacing scale, type scale, button variants, container widths, card treatments, form field styling, focus states, mobile nav, and every breakpoint from 320px up. Fix loading, error and empty states. Keyboard navigable, visible focus rings, sufficient contrast. Preserve the existing visual identity — no new UI patterns, no new colours.

### Phase 9 — Code quality
Fix TypeScript and ESLint errors properly — no `any`, no `@ts-ignore`, no disable comments. Remove unused imports and dead code you can prove is unused. De-duplicate obvious repetition. Add error handling where a failure is currently unhandled. Nothing beyond this.

### Phase 10 — Final validation
Run the full suite from Phase 0 again: typecheck, lint, format check, tests, production build. Then:
- `grep` the whole repo for `href="#"`, `TODO`, `FIXME`, `lorem`, `example.com`, `placeholder`, empty handlers — zero legitimate hits should remain.
- Crawl every route from the build output and confirm each returns 200.
- Confirm sitemap URL count matches the public route count.
- Check for hydration warnings in the build/dev output.

Fix what fails. Never suppress, skip, or comment out a failing check.

---

## 4. TRACKING

Maintain `.claude/overnight-progress.md`, updated after every phase:

```md
## Status
Current phase: N — <name>
Last commit: <sha> <message>

## Completed
- [x] ...

## Discovered work
- ...

## Assumptions made
| Decision | Why | Needs review? |

## Blocked
- <item> — <what's needed to unblock>

## Validation (latest run)
typecheck / lint / test / build: pass|fail + summary
```

If your context is compacted or the session restarts, re-read `.claude/audit.md` and `.claude/overnight-progress.md` first and resume from "Current phase".

---

## 5. WHEN TO STOP AND ASK

Work autonomously through ambiguity: inspect the repo, match existing patterns, choose the most consistent option, log it in Assumptions, continue.

Stop and ask **only** for: missing credentials or API keys, a change that would delete another person's uncommitted work, a legal/factual claim about the business you cannot verify from this prompt or the repo, or anything requiring a push to remote.

---

## 6. DEFINITION OF DONE

Tick these in `.claude/overnight-progress.md`, each with evidence (command output or file path):

- [ ] Every route in the audit resolves; zero dead links or dead buttons
- [ ] Zero placeholder content, zero `href="#"`, zero empty handlers
- [ ] Legal pages exist and are marked for human review
- [ ] Blog listing + article pages work; adding an article is a one-file change
- [ ] 4–6 articles published, meeting the quality bar
- [ ] Every public page has unique title, description, canonical, OG, one H1
- [ ] sitemap.xml and robots.txt correct; drafts and private routes excluded
- [ ] JSON-LD valid on home, services and articles
- [ ] 404 page exists and is useful
- [ ] Layout works from 320px upward
- [ ] typecheck, lint, tests, production build all pass
- [ ] Every phase committed separately; nothing pushed
- [ ] `.claude/overnight-progress.md` accurate

---

## 7. FINAL REPORT

Report only:

**Completed** — pages created, interactions fixed, SEO implemented, articles written, code cleaned.
**Validation** — exact command and result for typecheck, lint, tests, build.
**Assumptions needing my review** — decisions made under ambiguity, especially anything touching business facts or legal copy.
**Not done** — only genuine blockers, with what's needed to unblock.

No summaries of what you could have done. Start with Phase 0 now.
