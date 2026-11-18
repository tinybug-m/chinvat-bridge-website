import Link from "next/link";
import type { PostMeta } from "@/lib/blog";

/*
 * DRAFT from seo/overnight-2026-11-18/editorial/articles/how-to-choose-a-technology-partner.md (its front matter holds the
 * keyword, audience and review notes). Hidden in production while `draft` is true; visible in
 * `next dev` for review. To publish: remove `draft`, set `date` to the publishing day, and add the
 * article to its service page's related insights.
 */
export const meta: PostMeta = {
  slug: "how-to-choose-a-technology-partner",
  title: "How to Choose a Technology Partner",
  seoTitle: "How to Choose a Technology Partner",
  description:
    "Questions a small business should ask before hiring a firm for software, automation, AI or SEO: about the work, ownership, support, data and cost.",
  date: "2026-11-18",
  author: "Chinvat Bridge",
  category: "Software Strategy",
  tags: ["buying-guide", "software", "automation", "seo"],
  readingMinutes: 7,
  draft: true,
};

export function Content() {
  return (
    <>
      <p>Choose a partner who asks about your business before proposing technology, tells you plainly what they wouldn’t build, agrees scope and cost before work starts, and leaves you owning what you paid for. The questions below help you find out which firms do that. They apply whether you are hiring for <Link href="/#services">software, automation, AI or SEO</Link>, and to any firm you speak to, us included.</p>

      <h2>Before you speak to anyone</h2>

      <p>Write down three things on a page:</p>

      <ol>
        <li><strong>The problem</strong>, in the words of the people who have it. “Quotes take two days because prices live in three spreadsheets”, not “we need a new system”.</li>
        <li><strong>What “solved” looks like.</strong> A measure if you can: hours a week, response time, enquiries a month.</li>
        <li><strong>What you already have.</strong> The tools you pay for, who uses them, and what they don’t do.</li>
      </ol>

      <p>A good partner will ask for exactly this. A firm that proposes a solution before asking about any of it is selling a product, not solving your problem.</p>

      <h2>Questions about the work</h2>

      <p><strong>“What would you not build, and why?”</strong> The most revealing question. Expect an answer about simpler options: a feature in software you already own, an off-the-shelf product, a process change.</p>

      <p><strong>“What would the first version do, and what would it leave out?”</strong> Good projects start small. Be wary of a proposal that tries to solve everything in one go; scope creep, not technical difficulty, is the usual reason projects overrun.</p>

      <p><strong>“How will we know it’s working?”</strong> Look for a specific measure, agreed before work starts, and a plan to check it afterwards.</p>

      <p><strong>“Can you show me something similar you’ve built, and what you’d do differently now?”</strong> A walkthrough or a written case study with specifics tells you more than logos and percentages. The second half of the question shows whether they learn.</p>

      <h2>Questions about ownership and handover</h2>

      <p>These are rarely asked and often matter most when things change.</p>

      <ul>
        <li><strong>Who owns the code, the designs and the content?</strong> For bespoke work most businesses expect to own what they paid for. Get it in writing.</li>
        <li><strong>Whose accounts does it run on?</strong> Hosting, domains, automation platforms, analytics and search-console access should be in your name, with the partner added as a user.</li>
        <li><strong>Is it documented?</strong> Ask what you’d receive if you moved to another firm: how it’s built, how to deploy it, where the credentials live.</li>
        <li><strong>What happens if we stop paying?</strong> For a retainer, ask about notice periods and what happens to work in progress. For software, ask whether anything stops working.</li>
      </ul>

      <p>For <Link href="/services/custom-software">custom software projects</Link> and <Link href="/services/workflow-automation">automation work</Link> in particular, a partner who is relaxed about these questions is usually one who expects to keep your business by being useful, not by being hard to leave.</p>

      <h2>Questions about support</h2>

      <ul>
        <li>Who looks after it once it’s live, and how quickly do they respond?</li>
        <li>How are security updates handled?</li>
        <li>What does a small change cost, and how long does it take?</li>
        <li>Is support included, billed by the hour, or a monthly arrangement?</li>
      </ul>

      <p>Software and automations need looking after. Agreeing how before the build starts avoids an awkward conversation after it.</p>

      <h2>Questions about data</h2>

      <ul>
        <li>Where will our data be stored and processed, and by which providers?</li>
        <li>Who at your firm will have access to it?</li>
        <li>If AI services are involved, is our data used to train them?</li>
      </ul>

      <p>Under UK GDPR your obligations stay with you, so a partner should answer these plainly and be willing to sign a data-processing agreement where one is needed.</p>

      <h2>Questions about cost</h2>

      <ul>
        <li><strong>What is the price for, exactly?</strong> A fixed scope, a number of days, or a monthly set of deliverables?</li>
        <li><strong>What are the running costs?</strong> Hosting, subscriptions, usage-based fees for AI or connector platforms.</li>
        <li><strong>What would make it cost more?</strong> A partner who can name the risks up front is managing them.</li>
      </ul>

      <p>For SEO specifically, <Link href="/insights/how-much-does-seo-cost-uk">How much does SEO cost in the UK?</Link> sets out typical arrangements; for AI help, <Link href="/insights/how-to-choose-an-ai-consultant">How to choose an AI consultant</Link> goes further on the questions specific to AI.</p>

      <h2>Signs of a good fit</h2>

      <ul>
        <li>They asked more questions than they answered in the first conversation.</li>
        <li>They suggested something smaller or cheaper than you expected, and explained why.</li>
        <li>Their proposal says what is <em>not</em> included.</li>
        <li>You can talk to the person who will do the work.</li>
        <li>Their answers on ownership, data and support were specific, not reassuring.</li>
      </ul>

      <h2>Warning signs</h2>

      <ul>
        <li>Guarantees about results nobody controls, such as search rankings or exact time savings, before they have seen your work.</li>
        <li>Pressure to sign a long contract before a first piece of work.</li>
        <li>Vague answers about who owns what.</li>
        <li>One tool or platform recommended for every problem.</li>
      </ul>

      <h2>In short</h2>

      <p>Write down the problem, what solved looks like, and what you already have. Then ask every firm what they would not build, what the first version would leave out, how you’d measure it, who owns the result, how it is supported, where your data goes, and what the running costs are. The right partner will welcome the questions.</p>

      <p>If you’d like to put them to us, <Link href="/#contact">start a conversation</Link>.</p>
    </>
  );
}
