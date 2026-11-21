import Link from "next/link";
import type { PostMeta } from "@/lib/blog";

/*
 * From seo/overnight-2026-11-18/editorial/articles/replace-spreadsheets-with-custom-software.md (its front matter holds the
 * keyword, audience and review notes).
 */
export const meta: PostMeta = {
  slug: "replace-spreadsheets-with-custom-software",
  title: "Outgrown Your Spreadsheets? When to Replace Them with Software",
  seoTitle: "When to Replace Spreadsheets With Software",
  description:
    "How to tell when a business spreadsheet has become a system, the four ways out from cheapest to most tailored, and how to move without breaking anything.",
  date: "2026-11-20",
  author: "Chinvat Bridge",
  category: "Software Strategy",
  tags: ["software", "operations", "spreadsheets"],
  readingMinutes: 8,
};

export function Content() {
  return (
    <>
      <p>A spreadsheet is the right tool until three things are true at once: several people depend on the same file, it holds your business’s records rather than doing sums, and a mistake in it would cost real money. When all three apply, the spreadsheet has quietly become a system, and it is worth asking whether something built for the job would serve you better. That something isn’t always <Link href="/services/custom-software">custom software</Link>. Often it is a tidier spreadsheet or an off-the-shelf tool, and this guide covers how to tell which.</p>

      <h2>Why spreadsheets win in the first place</h2>

      <p>Spreadsheets earn their place. They cost nothing extra, everyone already knows how to use them, and they bend to whatever the business needs this week. A new column takes seconds, and nobody has to wait for a developer. For a business finding its way, that flexibility is exactly right, and moving away from it too early just swaps a flexible tool for a rigid one.</p>

      <p>The problem is that the same flexibility that makes a spreadsheet easy to start makes it hard to trust once it grows. There are no rules about what goes in each cell, no record of who changed what, and nothing to stop two people working from different copies.</p>

      <h2>Signs a spreadsheet has become a system</h2>

      <p>You don’t need all of these. Two or three, in a spreadsheet the business genuinely runs on, is usually enough to start looking.</p>

      <h3>More than one person edits it, and versions multiply</h3>

      <p>“Jobs_FINAL_v3_Sarah.xlsx” is the classic sign. Even with a single shared copy online, simultaneous edits, accidental sorts and overwritten rows become routine once several people work in it every day.</p>

      <h3>It holds records, not calculations</h3>

      <p>A spreadsheet that adds up a quote is a calculator. A spreadsheet that lists every customer, job, order or piece of stock, with its status, is a database without a database’s protections: no required fields, no check that a date is a date, and nothing to stop duplicates.</p>

      <h3>The rules live in someone’s head</h3>

      <p>Colour codes that mean something, columns you must never sort, a tab that is updated “on Fridays”. When the person who knows the rules is on holiday and things go wrong, the spreadsheet has outgrown its documentation, and probably its owner.</p>

      <h3>You copy information in and out of it</h3>

      <p>Details from a web form are typed in by hand; figures are copied out to raise an invoice or build a report. Every copy takes time and is a chance for error, and it usually means the spreadsheet sits between systems that could talk to each other directly.</p>

      <h3>Mistakes are expensive</h3>

      <p>A wrong price sent to a customer, a missed renewal, a double-booked engineer. If a single bad cell can cost money or a client relationship, the file needs more protection than a spreadsheet can give.</p>

      <h3>You need to control who sees what</h3>

      <p>Client details, salaries, health or financial information. Under UK GDPR you are expected to take appropriate measures to keep personal data secure (the <a href="https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/security/a-guide-to-data-security/" target="_blank" rel="noopener noreferrer">ICO’s guide to data security</a> sets out what that means), and a widely shared spreadsheet makes that hard: anyone with the file sees everything, and a copy can leave the business as an email attachment.</p>

      <h2>Four ways out, from cheapest to most tailored</h2>

      <h3>Tidy and protect the spreadsheet</h3>

      <p>Sometimes the honest answer is a better spreadsheet. Convert ranges into proper tables, add data validation so a status column only accepts real statuses, protect the formulas, and keep one shared copy in Microsoft 365 or Google Workspace with version history switched on. It costs an afternoon and often buys another year.</p>

      <p>This works when the problem is untidiness rather than scale: a handful of users, modest data, and nothing that needs to happen automatically.</p>

      <h3>Move to an off-the-shelf tool built for the job</h3>

      <p>If the spreadsheet is really a CRM, a job-management system, a stock list or a booking diary, there is very likely a mature product for it. These products have already solved the problems your spreadsheet is starting to show, such as permissions, history, reminders and mobile access, and they are maintained by someone else.</p>

      <p>The test is whether your process fits how the product works. Try two or three on a real week’s work before deciding it doesn’t.</p>

      <h3>Use an online database tool</h3>

      <p>Between spreadsheets and software sit online database tools: they look like a spreadsheet but enforce structure, link records together (this customer, their jobs, their invoices) and offer simple forms and views. For many small teams they are the right middle step, especially when the main need is structure and shared access.</p>

      <p>They become strained when the logic gets complicated, when customers or many staff need their own access, or when per-user pricing starts to add up.</p>

      <h3>Build a small custom tool</h3>

      <p>Custom software makes sense when the way you work is genuinely different from what the products assume, when you are paying for several tools and still patching the gaps by hand, or when customers or staff need to use the system every day in a way no product supports. See <Link href="/insights/when-should-a-business-build-custom-software">when should a business build custom software?</Link> for those signals in more depth.</p>

      <p>The key word is <em>small</em>. Replacing a spreadsheet rarely calls for a large system. It calls for one well-made tool that does what the spreadsheet does, properly.</p>

      <h2>What a good first version looks like</h2>

      <p>Take an illustrative example: a field-services firm runs its jobs from a shared spreadsheet, with one row per job, a status column, an engineer column and notes. A sensible first version of a custom tool would:</p>

      <ul>
        <li>hold the same jobs, with required fields and fixed statuses, so nothing goes in half-finished;</li>
        <li>give office staff and engineers each the view they need, with sign-in, so engineers see their own jobs and the office sees everything;</li>
        <li>record who changed what and when;</li>
        <li>import the existing spreadsheet on day one, so no history is lost;</li>
        <li>keep an export button, so the data is never trapped.</li>
      </ul>

      <p>It would <em>not</em> start with invoicing, scheduling optimisation, a customer portal and a mobile app. Those can follow once the core works and the team trusts it. Scope creep, not technical difficulty, is what usually sinks this kind of project.</p>

      <p>Built well, a tool like this also stops being an island. Through its API it can take enquiries straight from your website, or push completed jobs into your accounts package. That is the point where replacing a spreadsheet and <Link href="/services/workflow-automation">connecting the tools you already pay for</Link> become the same project.</p>

      <h2>Moving the data without breaking the business</h2>

      <p>Most of the risk in leaving a spreadsheet sits in the move itself, not in the new tool.</p>

      <ol>
        <li><strong>Clean before you move.</strong> Remove duplicates, agree what each status means, and fill or flag missing values. The new system will enforce rules the old file never did, so the data has to meet them.</li>
        <li><strong>Decide what history you need.</strong> Five years of closed jobs may be better kept as a read-only archive than migrated.</li>
        <li><strong>Run both for a short, fixed period.</strong> A week or two of parallel running catches gaps, but set an end date or the old file never dies.</li>
        <li><strong>Make the old file read-only on switch-over day.</strong> One source of truth, from that day on.</li>
        <li><strong>Train the people, not just the process.</strong> The colour codes and Friday rituals need translating into the new tool, and the person who knew them is the best person to help.</li>
      </ol>

      <h2>Questions to answer before you start</h2>

      <ul>
        <li>Who uses the spreadsheet today, and what does each person need from it?</li>
        <li>Which decisions depend on it, and what goes wrong when it’s out of date?</li>
        <li>Which other systems does information come from or go to?</li>
        <li>What happens when the one person who understands it is away?</li>
        <li>What would “solved” look like for the people who use it every day?</li>
      </ul>

      <p>If you can answer these in a page, you already have most of a brief for any of the four routes above.</p>

      <h2>In short</h2>

      <p>A spreadsheet has become a system when several people depend on it, it holds records rather than sums, and errors in it cost money. Start with the cheapest fix that solves the actual problem: tidy the spreadsheet, adopt a product built for the job, or try an online database. Build custom software when your process genuinely doesn’t fit those, and keep the first version small, structured and easy to get your data out of.</p>

      <p>If you’re not sure which of the four routes your spreadsheet needs, <Link href="/#contact">tell us what it does and who uses it</Link>. We’ll say honestly whether it’s a tidy-up, an off-the-shelf fit, or a case for <Link href="/services/custom-software">custom software built around the way you work</Link>.</p>
    </>
  );
}
