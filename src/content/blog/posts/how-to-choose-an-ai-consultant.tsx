import Link from "next/link";
import type { PostMeta } from "@/lib/blog";

/*
 * DRAFT from seo/overnight-2026-11-18/editorial/articles/how-to-choose-an-ai-consultant.md (its front matter holds the
 * keyword, audience and review notes). Hidden in production while `draft` is true; visible in
 * `next dev` for review. To publish: remove `draft`, set `date` to the publishing day, and add the
 * article to its service page's related insights.
 */
export const meta: PostMeta = {
  slug: "how-to-choose-an-ai-consultant",
  title: "How to Choose an AI Consultant for a Small Business",
  seoTitle: "How to Choose an AI Consultant",
  description:
    "Whether you need an AI consultant at all, what a good one does, the questions that separate practical help from hype, and how AI consultancy is usually priced.",
  date: "2026-11-18",
  author: "Chinvat Bridge",
  category: "AI & Workflows",
  tags: ["ai", "buying-guide"],
  readingMinutes: 8,
  draft: true,
};

export function Content() {
  return (
    <>
      <p>Choose someone who starts from your work rather than the technology, will tell you plainly when AI isn’t the answer, can build and connect what they recommend rather than only advise, and is specific about how they handle your data and measure results. Those four traits separate the consultants who change how a small business runs from the ones who leave behind a strategy document and a few unused licences.</p>

      <h2>First: do you need a consultant at all?</h2>

      <p>Plenty of small businesses don’t, at least not yet. If you have one clear task in mind (drafting proposals, summarising meeting notes) and a mainstream AI assistant does it well, buy the subscription, set some ground rules about what data goes in, and see how it goes. <Link href="/insights/where-ai-can-save-your-business-time">Where AI can actually save your business time</Link> is a good way to find that first task.</p>

      <p>Outside help starts to pay when:</p>

      <ul>
        <li>the task involves your own systems and data (your CRM, your documents, your inbox), not just a chat window;</li>
        <li>the same job needs to run many times a day, consistently, without someone copying text in and out;</li>
        <li>mistakes would reach customers, money or legal commitments, so you need review steps and a record;</li>
        <li>nobody on the team has the time or skills to work it out.</li>
      </ul>

      <p>That last point is common. The government’s 2026 AI adoption survey found that the most significant barriers were capability-related: limited AI skills, expertise or knowledge affected 67% of businesses that had already adopted AI, and 78% of those planning to (<a href="https://www.gov.uk/government/publications/ai-adoption-survey-2026/ai-adoption-survey-report-2026-executive-summary" target="_blank" rel="noopener noreferrer">DSIT, October 2026</a>). And adoption is still a minority activity: the ONS reported that 30% of UK businesses used at least one AI technology in September 2026 (<a href="https://www.ons.gov.uk/businessindustryandtrade/business/businessservices/bulletins/businessinsightsandimpactontheukeconomy/8october2026" target="_blank" rel="noopener noreferrer">ONS, October 2026</a>). If you are only starting, you are not late. (You can read <Link href="/services/ai-integration">how we approach AI projects</Link>; everything below applies to anyone you speak to, including us.)</p>

      <h2>What a good AI consultant actually does</h2>

      <p>The job is broader than “recommending tools”. A useful consultant for a small business will:</p>

      <ol>
        <li><strong>Find the right tasks.</strong> Look at how your week actually goes and pick the frequent, text-heavy tasks where AI does most of the work and a person checks the result.</li>
        <li><strong>Say which tasks aren’t for AI.</strong> Some are better served by <Link href="/services/workflow-automation">plain automation</Link>, some by a better process, and some should stay manual.</li>
        <li><strong>Choose tools on evidence.</strong> Test candidate tools and models on <em>your</em> examples, weighing reliability, running cost and where data is processed.</li>
        <li><strong>Do the integration.</strong> Connect the AI step to the systems where the work happens, so it isn’t another window to copy and paste into.</li>
        <li><strong>Build in guardrails.</strong> Review steps before anything reaches a customer, limits on what the system can do alone, and a log of what it did.</li>
        <li><strong>Measure it.</strong> Agree a before-and-after number up front, such as minutes per task or first-response time, and check it after launch.</li>
        <li><strong>Leave you able to run it.</strong> Your team should understand what the system does, when to trust it, and what to do when it’s wrong.</li>
      </ol>

      <h2>Questions to ask, and what good answers sound like</h2>

      <p><strong>“Which of our tasks would you <em>not</em> use AI for?”</strong> A good consultant has an answer, usually quickly. Be wary of someone who sees AI everywhere.</p>

      <p><strong>“How will we know it’s working?”</strong> Look for a specific measure and a plan to record the “before” number now. “Improved productivity” isn’t a measure.</p>

      <p><strong>“Where will our data go, and is it used to train models?”</strong> They should be able to name the service, where it processes data, its retention policy and whether your data trains anything, and explain what that means for your obligations under UK GDPR.</p>

      <p><strong>“What happens when it gets something wrong?”</strong> The honest answer is that it will, sometimes. Good answers describe review steps, limits and logging. Bad answers claim accuracy figures they haven’t measured on your work.</p>

      <p><strong>“What will it cost to run, not just to build?”</strong> Many AI services charge by use. A credible estimate includes running costs at your expected volume.</p>

      <p><strong>“Can you show me something you’ve built?”</strong> A demo, a walkthrough or a written case study with specifics. Logos and percentages without context tell you little.</p>

      <p><strong>“Who will actually do the work?”</strong> With a small firm it may be the person you’re talking to, which is often a strength. With a larger one, ask to meet the people who will build it.</p>

      <h2>Red flags</h2>

      <ul>
        <li><strong>Savings promised before anyone has looked at your work.</strong> “Save 40% of admin time” from someone who hasn’t seen your admin.</li>
        <li><strong>One tool for every problem.</strong> Especially if they resell it.</li>
        <li><strong>No mention of data protection</strong> until you raise it.</li>
        <li><strong>Strategy without delivery.</strong> A long report and a roadmap, but nobody to build the first step.</li>
        <li><strong>Agents for everything.</strong> Autonomous AI that acts without review is rarely the right first project for a small business.</li>
      </ul>

      <h2>How AI consultancy is usually priced</h2>

      <p>Pricing in the UK varies widely, and published figures are almost always set by the firms publishing them, so treat any single number with caution. The common models are:</p>

      <ul>
        <li><strong>Day rates</strong>, typical of independent consultants, for advice and hands-on work.</li>
        <li><strong>A fixed-price assessment or audit</strong> that ends with a written list of opportunities. Useful if it is specific to your business and you keep it whether or not you hire the same firm to build.</li>
        <li><strong>A project fee</strong> for a defined first build, ideally with scope, cost and running costs agreed before work starts.</li>
        <li><strong>A monthly retainer</strong> for ongoing improvement and support once something is live.</li>
      </ul>

      <p>For most small businesses the sensible sequence is a short, specific assessment, then one narrow, measured project, then a decision about what’s next based on results, not promises.</p>

      <h2>A good first engagement looks like this</h2>

      <p>One task. A “before” number recorded. A tool chosen on your examples. An integration into the system where the work happens. A person reviewing output where it matters. A check after a few weeks against the number you started with. If it works, extend it; if it doesn’t, you’ve spent little and learned a lot.</p>

      <h2>In short</h2>

      <p>You may not need a consultant for your first AI task. You probably do once AI has to work with your own systems and data, at volume, with mistakes that matter. Choose someone who starts from your work, tells you where AI doesn’t fit, builds and integrates what they recommend, and is specific about data and measurement. Ask the seven questions above of anyone you speak to, including us.</p>

      <p>You can read about <Link href="/services/ai-integration">our AI integration work</Link>, or <Link href="/#contact">describe the task you’d like to improve</Link> and we’ll tell you honestly whether AI is the right answer.</p>
    </>
  );
}
