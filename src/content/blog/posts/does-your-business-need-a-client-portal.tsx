import Link from "next/link";
import { WhenPublished } from "@/components/insights/WhenPublished";
import type { PostMeta } from "@/lib/blog";

/*
 * DRAFT from seo/overnight-2026-11-18/editorial/articles/does-your-business-need-a-client-portal.md (its front matter holds the
 * keyword, audience and review notes). Hidden in production while `draft` is true; visible in
 * `next dev` for review. To publish: remove `draft`, set `date` to the publishing day, and add the
 * article to its service page's related insights.
 */
export const meta: PostMeta = {
  slug: "does-your-business-need-a-client-portal",
  title: "Does Your Business Need a Client Portal?",
  seoTitle: "Does Your Business Need a Client Portal?",
  description:
    "When a client portal earns its keep for a small business, what a good one does, the build-or-buy decision, and the security questions to settle first.",
  date: "2026-11-18",
  author: "Chinvat Bridge",
  category: "Software Strategy",
  tags: ["software", "client-portals", "professional-services"],
  readingMinutes: 7,
  draft: true,
};

export function Content() {
  return (
    <>
      <p>A client portal earns its keep when clients regularly need something from you that a person currently has to send by hand: a status update, a document, an invoice, a form to fill in. If your team spends part of every week answering “where are we with…?” emails and attaching the same kinds of files, a portal can return that time and give clients a better experience. If clients hear from you a few times a year, it probably can’t. (Portals are part of the <Link href="/services/custom-software">software we build</Link>, but the first answer is often a feature you already pay for.)</p>

      <h2>What a client portal is for</h2>

      <p>At its simplest, a portal is a private place where each client signs in and sees their own information:</p>

      <ul>
        <li><strong>Status:</strong> where their matter, project or order stands, and what happens next.</li>
        <li><strong>Documents:</strong> what you’ve sent them and what you need from them, in one place instead of scattered across email threads.</li>
        <li><strong>Actions:</strong> forms to complete, approvals to give, files to upload, invoices to pay.</li>
        <li><strong>History:</strong> updates and reports over time, so nobody has to search their inbox.</li>
      </ul>

      <p>The value comes from replacing <em>repeated, manual communication</em>, not from the portal itself. A portal that clients never log into is a cost, not a service.</p>

      <h2>Signs it’s worth it</h2>

      <ul>
        <li>Your team answers the same status questions every week.</li>
        <li>Documents go back and forth by email, with versions and attachments people struggle to find.</li>
        <li>Clients have to send you information in a structured way (forms, ID, financial records), and chasing it takes time.</li>
        <li>You manage engagements that run for weeks or months, with regular updates.</li>
        <li>Sensitive information is being emailed that you would rather keep somewhere access-controlled.</li>
      </ul>

      <h2>Signs it isn’t, yet</h2>

      <ul>
        <li>Most clients are one-off transactions.</li>
        <li>Clients prefer a phone call, and that works for both sides.</li>
        <li>The real problem is internal (your team can’t find things either), which an internal tool solves better than a client-facing one.</li>
        <li>You haven’t checked the software you already pay for. Many practice-management, accounting and project tools include a client area.</li>
      </ul>

      <h2>Buy or build?</h2>

      <h3>Start with what you already have</h3>

      <p>If your firm uses practice-management, accounting or project software, check whether it offers a client portal. It may be included, or a modest add-on, and it is already connected to your data. For many small firms this is the right answer, even if it isn’t perfect.</p>

      <h3>Off-the-shelf portal products</h3>

      <p>Dedicated client-portal products offer document sharing, messaging, forms and branding without development. They suit firms whose process is fairly standard, and they are quick to set up. Watch for per-client or per-user pricing as you grow, how well they connect to your other systems, and how easily you can get your data out if you leave.</p>

      <h3>A custom portal</h3>

      <p>Building your own makes sense when:</p>

      <ul>
        <li>your process is specific enough that products force awkward workarounds;</li>
        <li>the portal has to bring together information from several systems (your CRM, your accounts, your job tracker) into one clear view for the client;</li>
        <li>it is part of what makes your service better, so you want to control how it looks and works;</li>
        <li>per-client pricing on a product would become significant at your scale.</li>
      </ul>

      <p>A custom portal doesn’t have to be large. A first version that shows status, shares documents and posts updates, connected to the systems where that information already lives, covers most of what clients want.</p>

      <h2>What a good portal gets right</h2>

      <p><strong>Security first.</strong> Each client must see only their own information, enforced by the system rather than relying on every page being written correctly. Sign-in should be simple (a link sent by email, or signing in with an existing account) and robust. Under UK GDPR you are expected to keep personal data secure with appropriate measures; the <a href="https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/security/a-guide-to-data-security/" target="_blank" rel="noopener noreferrer">ICO’s guide to data security</a> is a sensible checklist.</p>

      <p><strong>Information that updates itself.</strong> If staff have to copy updates into the portal by hand, it will fall out of date within a month. The portal should read from the systems where the work is already recorded, which is often more an integration job, <Link href="/services/workflow-automation">connecting the tools you already use</Link>, than a design job.</p>

      <p><strong>Plain design.</strong> Clients visit occasionally. They should see at a glance where things stand and what, if anything, they need to do.</p>

      <p><strong>A reason to log in.</strong> Tell clients when something new is there, by email, so the portal becomes the place things happen rather than a duplicate of the inbox.</p>

      <p><strong>An exit.</strong> Whether bought or built, make sure you can export your data and clients’ documents.</p>

      <h2>Questions to answer before you choose</h2>

      <ol>
        <li>Which three client questions take up the most staff time today?</li>
        <li>Where does the information that answers them live now?</li>
        <li>What do clients need to <em>do</em>, not just see?</li>
        <li>How many clients would use it, and how often?</li>
        <li>What does your existing software already offer?</li>
      </ol>

      <p>If the answers point to a product, use the product. If they point to a portal that pulls together your own systems in your own way, that is when <Link href="/services/custom-software">building your own</Link> earns its cost.<WhenPublished slug="how-we-built-this-site"> <Link href="/insights/how-we-built-this-site">How we built our own client portal</Link> shows what that looks like in practice.</WhenPublished></p>

      <h2>In short</h2>

      <p>A client portal is worth it when it replaces repeated, manual communication: status updates, documents and requests that currently travel by email. Check the software you already pay for first, then off-the-shelf portal products. Build when your process, your systems or your scale make those a poor fit, and keep the first version small, secure and fed automatically from the systems where the work happens.</p>

      <p>If your team is answering the same client questions every week, <Link href="/#contact">describe what you need</Link>, and we’ll tell you whether that’s a feature you already own, a product, or a portal worth building.</p>
    </>
  );
}
