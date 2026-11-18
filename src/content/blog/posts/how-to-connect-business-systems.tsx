import Link from "next/link";
import type { PostMeta } from "@/lib/blog";

/*
 * DRAFT from seo/overnight-2026-11-18/editorial/articles/how-to-connect-business-systems.md (its front matter holds the
 * keyword, audience and review notes). Hidden in production while `draft` is true; visible in
 * `next dev` for review. To publish: remove `draft`, set `date` to the publishing day, and add the
 * article to its service page's related insights.
 */
export const meta: PostMeta = {
  slug: "how-to-connect-business-systems",
  title: "How to Connect Business Systems That Don’t Talk to Each Other",
  seoTitle: "Connecting Business Systems That Don’t Talk",
  description:
    "A practical guide for UK SMEs: map what moves between your tools, decide where each record lives, and choose between built-in integrations, connectors and APIs.",
  date: "2026-11-18",
  author: "Chinvat Bridge",
  category: "Process Automation",
  tags: ["automation", "integration", "operations"],
  readingMinutes: 9,
  draft: true,
};

export function Content() {
  return (
    <>
      <p>Most business software can share information with other software, through a built-in integration, a connector platform or its API. The hard part is rarely the technology. It is deciding which system is the source of truth for each piece of information, and then choosing the lightest connection that will run reliably. Get those two decisions right and most “our systems don’t talk to each other” problems become a series of small, manageable jobs. This is the core of our <Link href="/services/workflow-automation">workflow automation and integration</Link> work, and the approach is the same whoever does it.</p>

      <h2>Start with a map, not a tool</h2>

      <p>Before choosing any software, write down three things on a single page:</p>

      <ol>
        <li><strong>Every system involved.</strong> The CRM, the accounts package, the website forms, the shared inbox, the booking tool, and the spreadsheets that fill the gaps.</li>
        <li><strong>What moves between them.</strong> A new customer’s details, an order, a job status, an invoice, a payment.</li>
        <li><strong>Who moves it today, and how often.</strong> “Office manager, from form email to CRM, about 20 times a week.”</li>
      </ol>

      <p>This map usually shows that the problem isn’t ten broken connections but two or three handoffs that carry most of the manual work. Those are where to start. <Link href="/insights/what-should-you-automate-first">What should you automate first?</Link> offers a simple way to rank them.</p>

      <h2>Decide where each piece of information lives</h2>

      <p>Integrations go wrong most often when two systems both think they own the same record. Before connecting anything, decide the <strong>source of truth</strong> for each kind of information:</p>

      <table>
        <thead>
          <tr>
            <th>Information</th>
            <th>Usually lives in</th>
            <th>Others should…</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Customer contact details</td>
            <td>CRM</td>
            <td>Read from it, or receive updates from it</td>
          </tr>
          <tr>
            <td>Invoices and payments</td>
            <td>Accounting software</td>
            <td>Never create invoices independently</td>
          </tr>
          <tr>
            <td>Products, prices and stock</td>
            <td>E-commerce platform or stock system</td>
            <td>Pull prices and stock levels from it</td>
          </tr>
          <tr>
            <td>Jobs, projects and their status</td>
            <td>Job or project tool</td>
            <td>Report status, not change it</td>
          </tr>
        </tbody>
      </table>

      <p>Once each record has one home, the connections have a clear direction. Information flows <em>from</em> its home <em>to</em> wherever else it is needed, and edits happen in one place.</p>

      <h2>The four ways systems connect</h2>

      <h3>Built-in integrations</h3>

      <p>Many products connect directly to popular partners: an accounting package that syncs with your payment provider, a CRM that reads your email. Check each tool’s integrations page first. These are usually the cheapest and best-supported option, though they only do what the vendor designed them to do.</p>

      <h3>Connector platforms</h3>

      <p>Tools such as Zapier and Make link thousands of apps through “when this happens, do that” workflows, without code. They are quick to set up and easy to change, and they suit moderate volumes between popular tools. Their limits are per-task pricing that grows with volume, complex logic that becomes hard to follow, and error handling you have to set up deliberately.</p>

      <h3>Direct API integration</h3>

      <p>An API is the published way one piece of software lets another read and write its data. A custom integration talks to each system’s API directly, either reacting instantly through webhooks (notifications a system sends when something happens) or on a schedule. This is the right choice when there is no connector, the rules are specific to your business, the volume is high, or the workflow is critical enough to need full control over how failures are handled.</p>

      <h3>Files, for older systems</h3>

      <p>Some industry-specific or older software has no API but can export and import files. A scheduled export, transformation and import is less elegant, but it is often perfectly reliable, and far better than retyping.</p>

      <h2>Choosing between them</h2>

      <table>
        <thead>
          <tr>
            <th>If…</th>
            <th>Start with</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Both tools offer a native integration that does what you need</td>
            <td>Built-in integration</td>
          </tr>
          <tr>
            <td>Popular tools, simple rules, tens to hundreds of events a day</td>
            <td>A connector platform</td>
          </tr>
          <tr>
            <td>No connector exists, the rules are complex, or the volume makes per-task pricing expensive</td>
            <td>Direct API integration</td>
          </tr>
          <tr>
            <td>The workflow is business-critical (payments, orders, compliance)</td>
            <td>Direct API integration, or a connector with deliberate monitoring</td>
          </tr>
          <tr>
            <td>One system only exports files</td>
            <td>A scheduled file-based sync</td>
          </tr>
        </tbody>
      </table>

      <p>Most businesses end up with a mixture, and that is fine. What matters is that someone knows what exists and how each piece works.</p>

      <h2>What makes an integration reliable</h2>

      <p>These are the details that separate a connection that quietly works for years from one that breaks the first time something unusual happens.</p>

      <ul>
        <li><strong>A shared identifier.</strong> Records need a reliable way to match across systems, such as a customer ID or an order number. Matching on names or email addresses alone leads to duplicates the first time someone changes their email.</li>
        <li><strong>A rule for duplicates.</strong> Decide what happens when a record arrives that already exists: update it, skip it, or flag it for a person.</li>
        <li><strong>Field mapping, written down.</strong> Which field goes where, in what format. Dates, phone numbers and postcodes cause more trouble than they should.</li>
        <li><strong>Failures that are loud.</strong> Every integration eventually meets something it didn’t expect: a password change, a renamed field, a system that is briefly down. It should retry where that is safe, alert someone when it can’t, and keep a record of what happened. A silent failure discovered weeks later is the expensive kind.</li>
        <li><strong>Respect for limits.</strong> APIs restrict how many requests you can make in a given period. A bulk update that ignores those limits will fail halfway through.</li>
        <li><strong>Testing with real data.</strong> Sample data is always cleaner than the real thing. Test with a copy of real records, including the messy ones.</li>
        <li><strong>Documentation.</strong> One page per workflow: what triggers it, what it does, where it logs, and who to call. Without this, the integration becomes a black box nobody dares change.</li>
      </ul>

      <h2>Data protection when systems share data</h2>

      <p>Connecting systems moves personal data, often through a third party, so it is worth a moment’s thought under UK GDPR. Pass each step only the fields it needs (the ICO calls this <a href="https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/data-minimisation/" target="_blank" rel="noopener noreferrer">data minimisation</a>), check where each platform processes and stores data, use accounts and permissions you can review, and keep your record of processing up to date.</p>

      <h2>An illustrative example</h2>

      <p>Picture a small professional-services firm. Today an enquiry arrives through the website form; someone copies it into the CRM, emails an acknowledgement, and later re-types the client’s details into the accounts package to raise the first invoice.</p>

      <p>Connected, the same journey looks like this:</p>

      <ol>
        <li>The form submission creates or updates the contact in the CRM (the source of truth for clients), matched on email address the first time and linked by the CRM’s own ID from then on, and sends the acknowledgement.</li>
        <li>When the deal is marked won in the CRM, the client is created in the accounting software using the CRM’s ID, so the two records stay linked.</li>
        <li>The first invoice is drafted in the accounts package for a person to check and send.</li>
        <li>If any step fails, an alert goes to the office manager with the details, and nothing is lost.</li>
      </ol>

      <p>Nobody retypes anything, every record has one home, and a person still approves the step that involves money.</p>

      <h2>When connecting isn’t enough</h2>

      <p>Sometimes the map shows that the real problem is a missing tool, not a missing connection. A spreadsheet has become the database, or no product handles the core of how you work. That is when a small tool of its own, built to fit your process and connected to everything else, makes more sense than another integration.</p>

      <h2>In short</h2>

      <p>Map what moves between your systems and who moves it. Decide where each piece of information lives. Then choose the lightest reliable connection for each handoff: built-in integrations first, connector platforms for simple flows between popular tools, direct API work when the rules, volumes or stakes demand it. Build every connection to fail loudly and write down how it works.</p>

      <p>If you have a handoff in mind, <Link href="/#contact">describe the process to us</Link>. We’ll tell you whether it’s a quick connection, a bigger project, or something your software can already do. Or read more about <Link href="/services/workflow-automation">how we approach automation projects</Link>, and when we’d recommend <Link href="/services/custom-software">a small tool of its own</Link> instead.</p>
    </>
  );
}
