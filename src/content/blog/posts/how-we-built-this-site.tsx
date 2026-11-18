import Link from "next/link";
import type { PostMeta } from "@/lib/blog";

/*
 * DRAFT from seo/overnight-2026-11-18/editorial/articles/how-we-built-this-site.md (its front matter holds the
 * keyword, audience and review notes). Hidden in production while `draft` is true; visible in
 * `next dev` for review. To publish: remove `draft`, set `date` to the publishing day, and add the
 * article to its service page's related insights.
 */
export const meta: PostMeta = {
  slug: "how-we-built-this-site",
  title: "How We Built Our Own Site, Client Portal and Checkout",
  seoTitle: "How We Built Our Site, Portal and Checkout",
  description:
    "A look inside our own website: a custom Next.js build with a client portal, Stripe subscriptions, sign-in, and the technical SEO we sell, all on one stack.",
  date: "2026-11-18",
  author: "Chinvat Bridge",
  category: "Software Strategy",
  tags: ["software", "web", "seo", "case-study"],
  readingMinutes: 7,
  draft: true,
};

export function Content() {
  return (
    <>
      <p>We sell custom software and SEO, so our own website has to do both properly. It isn’t a template. It is a custom application in which clients can subscribe to an SEO plan, sign in, and follow their project in a portal, and its technical SEO is built in rather than bolted on. This is how it is put together, what we chose and why, and what we’d do differently.</p>

      <h2>What the site has to do</h2>

      <p>Beyond explaining what we offer, the site runs part of the business:</p>

      <ul>
        <li><strong>Take subscriptions.</strong> A visitor can choose an SEO plan, enter their business details and pay, without a call or an invoice.</li>
        <li><strong>Create the client’s account automatically</strong> once payment succeeds.</li>
        <li><strong>Give each client a portal</strong> showing the progress of their engagement, the current sprint, and an archive of updates and reports, visible only to them.</li>
        <li><strong>Give us an admin area</strong> to manage clients and post updates.</li>
        <li><strong>Be found.</strong> Fast pages, clean structure and accurate structured data, because that is the work we do for clients.</li>
      </ul>

      <h2>The stack, and why</h2>

      <p>We chose mainstream, well-documented tools, so the site is easy to host, secure and hand over:</p>

      <ul>
        <li><strong>Next.js and React, in TypeScript.</strong> Pages are rendered on the server or generated in advance, so search engines and visitors get complete HTML straight away, while interactive parts such as the contact conversation run in the browser.</li>
        <li><strong>Supabase (PostgreSQL)</strong> for data and sign-in. Clients sign in with a one-time link sent by email, or with Google. Row-level security in the database means each client can only ever read their own records, enforced by the database itself rather than by page code alone.</li>
        <li><strong>Stripe</strong> for payments. Card details never touch our servers.</li>
        <li><strong>Vercel</strong> for hosting.</li>
      </ul>

      <p>It is the stack we propose for <Link href="/services/custom-software">custom software</Link> for clients, too.</p>

      <h2>How a subscription becomes a portal</h2>

      <ol>
        <li>The visitor picks a plan on the pricing page; plan details live in the database, so prices and inclusions can change without a code release.</li>
        <li>They enter their business details, and the site creates a Stripe Checkout session.</li>
        <li>When Stripe confirms the payment, it notifies the site through a signed webhook. The site verifies the signature, creates the client’s account and records the subscription.</li>
        <li>The client signs in and lands in their portal. If a payment later fails or the subscription is cancelled, Stripe tells the site the same way and the account is updated.</li>
      </ol>

      <p>The webhook is the part that most often goes wrong in subscription sites. Ours rejects anything that isn’t signed by Stripe, and creating the account is an “insert or update”, so a notification that arrives twice does no harm. You can see the shape of the portal in our <Link href="/client-portal">client portal preview</Link>, which uses illustrative data.</p>

      <h2>Technical SEO, built in</h2>

      <p>The things we check on client sites are part of this one’s code:</p>

      <ul>
        <li><strong>Every page describes itself:</strong> its own title, description, canonical URL and social card, generated from one helper so no page silently inherits the homepage’s.</li>
        <li><strong>Structured data</strong> connects the organisation, its services and its articles, so search engines can tell what the business offers and who wrote what.</li>
        <li><strong>The sitemap only claims real dates:</strong> each article’s own publication date, and each service page’s last real change, never the build time.</li>
        <li><strong>Private pages stay private:</strong> sign-in, checkout and portal pages are marked <code>noindex</code>, and the portal redirects anyone not signed in.</li>
        <li><strong>Accessibility and performance</strong> are treated as part of the job: one heading structure per page, descriptive link text, form fields with the right autocomplete purposes, generous tap targets, and motion that respects the reduced-motion setting.</li>
      </ul>

      <p>In our own lab tests on a throttled mobile profile, the inner pages reach their largest content in under two and a half seconds with no measurable layout shift. Lab tests aren’t real-visitor data, and we’ll publish field figures once we have them.</p>

      <h2>How we keep it working</h2>

      <p>The site has an end-to-end test suite of more than a hundred tests, each run at desktop, tablet and phone sizes. It covers navigation, the contact conversation (including what happens when sending fails), every route’s metadata, the sitemap’s dates, and the service pages’ structured data. Alongside the production build, the type checks and the linter, it is how we check a change before it goes live.</p>

      <h2>What we’d do differently</h2>

      <ul>
        <li><strong>The homepage does a lot of drawing.</strong> The animated diagrams are part of who we are, but on a mid-range phone they keep the browser busy during load. They don’t delay the main content, and we are measuring real-visitor responsiveness before deciding whether to defer some of the work.</li>
        <li><strong>Domains.</strong> For a while the site answered on two domains, with search engines told to prefer the one we were leaving. It is exactly the kind of quiet problem a technical audit exists to catch, and we caught it in ours.</li>
      </ul>

      <h2>What this means if you’re a client</h2>

      <p>The same approach applies to your project: mainstream tools, a database that enforces who can see what, payments handled by a specialist provider, tests we run before we release, and technical SEO designed in from the start. It’s also why we’ll often suggest something smaller than you expect. <Link href="/insights/when-should-a-business-build-custom-software">When should a business build custom software?</Link> explains when we think building is worth it.</p>

      <p>If you have a portal, a booking flow or an internal tool in mind, <Link href="/#contact">describe what you need</Link>. Or read about our <Link href="/services/custom-software">custom software</Link> and <Link href="/services/seo">SEO service</Link>.</p>
    </>
  );
}
