# Overnight website improvement — instructions for Claude Code

You are running **unattended overnight** inside a loop script. Each run starts
fresh with this file. No human is available: **never ask questions** — make a
sensible decision, and write down your reasoning in the progress file.

The goals, in the owner's words: add a white (light) theme and a black (dark)
theme, make the primary colour neon yellow, replace the fonts (they don't look
good), and fix text that is hard to read or tiring on the eyes. After that,
keep making the website better and better until the script stops you.

---

## How every run works

1. Read `.overnight/PROGRESS.md` (create it on the first run). If
   `.overnight/last-failure.txt` exists, your previous run's changes were
   **reverted** because the build failed — read it, and either fix the cause or
   choose a different task.
   Also read `docs/AUDIT.md`. It holds verified business facts, the route list
   and the existing component set. Treat its facts as correct and never
   contradict them. Where it conflicts with this file about colours, themes or
   fonts, this file wins.
2. If Phase 1 is not marked complete, continue Phase 1. Otherwise pick the
   single most valuable item from Phase 2 that isn't done yet.
3. Make **one focused, coherent set of changes** — roughly what fits in one
   reviewable commit.
4. Run the build (and typecheck / lint if those scripts exist). Fix every error
   you introduced. Never finish a run with a broken build.
5. Update `.overnight/PROGRESS.md`: what you did, files touched, decisions made,
   and a **Backlog** list of ideas for later runs.
6. Write a one-line summary (under 70 characters) of this run to
   `.overnight/last-summary.txt` (overwrite it).
7. Stop. **Do not run git commit** — the wrapper script checks the build and
   commits for you.

---

## Phase 1 — core goals (do these first, in order)

### 1.1 Discover
Inspect the project: framework, styling approach (Tailwind, CSS modules, plain
CSS, styled-components…), where colours and fonts are currently defined, and
every page/route. Record this in PROGRESS.md. Work **with** the existing stack —
don't migrate frameworks and don't add a UI component library.

### 1.2 Design tokens
Put every colour into CSS custom properties with semantic names, defined in one
place. If the project uses Tailwind, map the Tailwind theme colours to these
variables (configured the right way for the Tailwind version in use) and make
dark mode driven by the `data-theme` attribute. Then replace hardcoded colours
across components with the tokens.

Suggested tokens: `--color-bg`, `--color-surface`, `--color-surface-2`,
`--color-border`, `--color-text`, `--color-text-muted`, `--color-primary`,
`--color-primary-hover`, `--color-on-primary`, `--color-primary-text`,
`--color-focus`.

### 1.3 Neon yellow primary colour
Single source of truth: `--brand-neon: #E6FF00`. If the owner changes this one
value later, the whole site should follow.

**Critical readability rule.** Neon yellow is extremely bright. On a white
background, yellow text is almost invisible (contrast around 1.1:1). So:

- **Light theme:** use neon as a *fill* only — buttons, highlight marks,
  badges, underlines, small accents — always with near-black text on top. Never
  put neon-yellow text on white or light surfaces. For links and "primary
  coloured" text, use a dark olive from the same hue family (start around
  `#4D5600` and adjust) that reaches at least 4.5:1 on the background.
- **Dark theme:** neon may be used for links, text accents and icons on dark
  backgrounds. Buttons: neon fill with near-black text.
- Hover/active states: slightly lighter or darker versions of the same hue,
  never a different colour.
- Use neon **sparingly** — an accent, not a wallpaper. Large neon areas are
  tiring to look at.

### 1.4 Light and dark themes
- **Light:** soft off-white background (not harsh pure white), near-black text,
  muted text still at least 4.5:1.
- **Dark:** near-black background with slightly lighter surfaces for cards,
  off-white text (avoid pure `#FFFFFF` on pure `#000000` — it causes glare and
  eye strain), muted text still at least 4.5:1.
- Default follows the visitor's OS setting (`prefers-color-scheme`).
- Add a theme toggle to the site header and the mobile nav (not to
  `CheckoutShell`, which stays distraction-free and simply follows the saved or
  OS theme): sun/moon icon, `aria-label`, keyboard
  accessible. The choice is saved in `localStorage` and applied as
  `data-theme="light|dark"` on `<html>`.
- **No flash of the wrong theme** on load: a tiny inline script in `<head>`
  sets the attribute before the page paints. If the project is Next.js you may
  use `next-themes`; otherwise write the small script yourself.
- Set the CSS `color-scheme` property per theme so form controls and
  scrollbars match. Add `<meta name="theme-color">` for both themes.
- Check **every** page and component in both themes: logos and images (add a
  dark-mode variant or treatment if a logo disappears), SVG icons (prefer
  `currentColor`), shadows (use borders or lighter surfaces in dark mode),
  borders, form inputs, placeholders, embedded maps, code blocks.

### 1.5 Typography and readability
- Replace the current fonts with a deliberate, highly readable pairing. Good
  starting point: **Atkinson Hyperlegible Next** for body text (designed
  specifically for legibility) and **Bricolage Grotesque** for headings. If a
  package isn't available, choose an equally readable alternative and log why.
- Self-host fonts (`next/font` for Next.js, otherwise `@fontsource` /
  `@fontsource-variable` packages). Use `font-display: swap`, load only the
  weights you actually use, and give each font a system fallback stack.
- Body text at least 16px (1rem); 17–18px on larger screens is fine.
  Line-height about 1.6 for body, 1.1–1.25 for headings. Paragraphs max
  about 65–75 characters wide.
- A consistent fluid type scale for headings using `clamp()`.
- Nothing below 14px except legal fine print. No thin (300) weights for body
  text. No all-caps paragraphs. No low-contrast grey text.
- Text on top of images always gets an overlay/scrim so it stays readable.
- **Every text/background pair in both themes must meet WCAG 2.2 AA:** 4.5:1
  for normal text, 3:1 for large text and UI components (buttons, input
  borders, focus rings). Write a small dependency-free script,
  `scripts/check-contrast.mjs`, that computes the contrast ratios of your token
  pairs for both themes. Run it with node, fix every failure, and record the
  results in PROGRESS.md.

**Phase 1 is complete** only when all of 1.1–1.5 are done and the build passes.
Write `PHASE 1 COMPLETE` clearly in PROGRESS.md when it is.

---

## Phase 2 — keep improving (repeat until the script stops you)

Each run, audit the site with fresh eyes and pick the highest-impact item.
Rough priority order:

1. **Leftover readability issues** — hardcoded colours you missed, low-contrast
   text, cramped line lengths, anything that looks wrong in one of the themes.
2. **Accessibility** — visible focus rings in both themes, logical heading
   order, meaningful alt text (describe what's shown; never invent facts),
   labels on every form field, `aria-label` on icon-only buttons, a
   skip-to-content link, tap targets at least 44px, `prefers-reduced-motion`
   respected.
3. **Responsive layout** — works from 360px phones to wide desktops, no
   horizontal scrolling, a usable mobile menu.
4. **Visual consistency** — work inside the existing components listed in
   `docs/AUDIT.md`: one spacing scale, consistent button styles, consistent
   section rhythm. Don't invent new visual patterns. Keep the `Eyebrow`
   component; you may restyle it for readability (size, weight, letter-spacing,
   case), but don't remove it. Avoid adding fade-in animations to every section.
5. **Performance** — correctly sized and lazy-loaded images, modern formats
   where the stack supports it, no layout shift, remove unused CSS/JS.
6. **Technical SEO** — a unique title and meta description per page, exactly
   one `<h1>` per page, Open Graph tags, canonical URLs. The sitemap and
   robots.txt already exist; only check they're correct. If adding structured
   data, use `Organization` (not `LocalBusiness`: there is no public address,
   phone or city) and **only** information already on the site.
7. **Polish** — clear hover/pressed states on interactive elements, a styled
   404 page, favicon, helpful form error messages.
8. **Code quality** — remove dead styles, merge duplicated components — only
   when clearly safe.

Don't redo work already logged as done unless you found a bug in it. If you
genuinely can't find a meaningful improvement, do a careful full audit of every
page in both themes, log the findings in the Backlog, and fix the smallest real
issue you found.

---

## Hard rules (never break these)

- Stay inside this repository. Never deploy, push, publish, or call remote
  services.
- Don't touch `.env` files, secrets, CI configuration or deployment config.
- Don't change the business's facts: names, phone numbers, addresses, prices,
  opening hours, testimonials, reviews, legal text. **Don't invent content,
  statistics, claims or testimonials.** Only fix obvious typos in copy.
- Don't delete pages, sections or features. Don't change URLs or routes (that
  breaks SEO).
- No new dependencies except font packages (and `next-themes` for a Next.js
  project). No analytics or tracking scripts.
- Don't upgrade the framework or any major dependency version.
- Keep each run focused. Never leave the build broken; if something can't be
  made to work, undo it and write down why.
- Never ask questions. Decide, then log your reasoning.
