import Link from "next/link";
import { WhenPublished } from "@/components/insights/WhenPublished";
import type { PostMeta } from "@/lib/blog";

/*
 * DRAFT from seo/overnight-2026-11-18/editorial/articles/ai-subscriptions-vs-ai-integration.md (its front matter holds the
 * keyword, audience and review notes). Hidden in production while `draft` is true; visible in
 * `next dev` for review. To publish: remove `draft`, set `date` to the publishing day, and add the
 * article to its service page's related insights.
 */
export const meta: PostMeta = {
  slug: "ai-subscriptions-vs-ai-integration",
  title: "AI Subscriptions or AI Integration?",
  seoTitle: "AI Subscriptions or AI Integration?",
  description:
    "Why buying AI licences often changes little, what integrating AI into your systems adds, and how a small business can tell when to move from one to the other.",
  date: "2026-11-18",
  author: "Chinvat Bridge",
  category: "AI & Workflows",
  tags: ["ai", "workflows"],
  readingMinutes: 7,
  draft: true,
};

export function Content() {
  return (
    <>
      <p>A subscription gives each person a capable assistant. Integration changes a process. Most small businesses should start with subscriptions, because they are cheap, quick and teach you where AI helps. Integration becomes worth it for the few specific, frequent tasks where people are copying text in and out of a chat window all day, where results need to be consistent, or where the work needs a record and a review step. That second step is what we mean by <Link href="/services/ai-integration">AI integration</Link>.</p>

      <h2>What a subscription gives you</h2>

      <p>Business plans for general-purpose AI assistants give each member of staff a tool that can draft, summarise, rewrite, brainstorm and answer questions. Used well, that is a genuine help for individual tasks: the first draft of a proposal, a summary of a long thread, a clearer version of an awkward email.</p>

      <p>Business and enterprise tiers typically add administration and stronger data terms than consumer versions, such as controls over whether your content is used to train models. Read the terms of the plan you buy, and set simple rules about what may and may not be pasted in.</p>

      <p>Many business plans now also offer shared workspaces, connectors to file stores and some business apps, and admin logs. These narrow the gap. They don’t close it, because the assistant still works where a person opens it, not inside your process.</p>

      <h2>Where subscriptions stop</h2>

      <p>The limits show up quickly, and they are about the work around the tool, not the tool itself.</p>

      <ul>
        <li><strong>Out of the box, copy and paste is the integration.</strong> Someone copies an email into the assistant, copies the answer back out, and pastes it into the CRM. The tool saves some writing time but adds handling time.</li>
        <li><strong>It doesn’t know your business unless you teach it.</strong> Unless someone supplies the context each time, or sets up connectors and shared knowledge, the assistant doesn’t know your prices, policies, products or the customer’s history.</li>
        <li><strong>Results vary from person to person.</strong> Ten people writing ten different prompts get ten different standards of output.</li>
        <li><strong>The record sits apart from the work.</strong> Any log lives in the vendor’s admin console, so someone looking at the customer’s record can’t see what the AI produced, what a person changed, or why a customer was told something.</li>
        <li><strong>It is built around a person asking.</strong> A subscription isn’t designed to work through the overnight inbox or react the moment a form arrives in your systems.</li>
      </ul>

      <p>None of this makes subscriptions a mistake. It explains why many businesses buy licences and then see little change in how the business runs.</p>

      <h2>What integration adds</h2>

      <p>Integrating AI means connecting a model to the systems where the work happens, so a specific task runs the same way every time:</p>

      <ul>
        <li><strong>It is triggered by the work</strong>: a new email, a form submission, an uploaded document. Nobody has to open a chat window.</li>
        <li><strong>It works from your information</strong>, such as your policies, your product data and the customer’s record, supplied automatically.</li>
        <li><strong>The instructions are fixed and tested</strong>, so output is consistent and can be improved deliberately.</li>
        <li><strong>A person reviews where it matters</strong> before anything reaches a customer or touches money.</li>
        <li><strong>Everything is logged</strong>: input, output and who approved it.</li>
        <li><strong>It runs at volume</strong>, at any hour.</li>
      </ul>

      <h2>Side by side</h2>

      <table>
        <thead>
          <tr>
            <th></th>
            <th>AI subscription</th>
            <th>AI integration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Best for</td>
            <td>Individual, varied tasks</td>
            <td>One specific task done often</td>
          </tr>
          <tr>
            <td>Set-up</td>
            <td>Minutes</td>
            <td>A defined project</td>
          </tr>
          <tr>
            <td>Knows your business</td>
            <td>Only what each person pastes in</td>
            <td>Your data, supplied automatically</td>
          </tr>
          <tr>
            <td>Consistency</td>
            <td>Varies by person</td>
            <td>Fixed, tested instructions</td>
          </tr>
          <tr>
            <td>Record of outputs</td>
            <td>In the vendor’s admin tools, apart from the work</td>
            <td>Logged alongside the work</td>
          </tr>
          <tr>
            <td>Runs without a person present</td>
            <td>Mostly not</td>
            <td>Yes, with review steps where needed</td>
          </tr>
          <tr>
            <td>Cost model</td>
            <td>Per seat, per month</td>
            <td>Build cost plus usage-based running costs</td>
          </tr>
        </tbody>
      </table>

      <h2>Signs it’s time to integrate a task</h2>

      <ul>
        <li>Several people do the same task with the assistant every day, and paste the same instructions each time.</li>
        <li>The output always ends up in the same system: the CRM, the helpdesk, the accounts package.</li>
        <li>Volume is rising, and the copy-and-paste time now outweighs the writing time saved.</li>
        <li>You need the result to be consistent, because customers see it.</li>
        <li>You need to know afterwards what was said and who approved it.</li>
      </ul>

      <p>If none of these is true, keep the subscription and spend the effort on helping people use it well.</p>

      <h2>A sensible path</h2>

      <ol>
        <li><strong>Start with subscriptions</strong> for the people who write and summarise most. Agree simple rules on data.</li>
        <li><strong>Watch what people actually use it for.</strong> The repeated tasks will show themselves within weeks. <Link href="/insights/where-ai-can-save-your-business-time">Where AI can actually save your business time</Link> suggests what to look for.</li>
        <li><strong>Pick one repeated task</strong> that meets the signs above, and record how long it takes today.</li>
        <li><strong>Integrate that one task</strong>, with a review step and a log, and measure it against the number you recorded.</li>
        <li><strong>Decide on the next task from results</strong>, not from enthusiasm.</li>
      </ol>

      <h2>In short</h2>

      <p>Subscriptions help individuals; integration changes processes. Start with subscriptions, learn which tasks repeat, and integrate only the specific, frequent tasks where copy and paste has become the bottleneck, consistency matters, or you need a record. One well-integrated task usually does more for a small business than another round of licences.</p>

      <p>If you’ve reached the point where one task deserves <Link href="/services/ai-integration">proper integration into your systems</Link>, <Link href="/#contact">tell us what it is</Link>.<WhenPublished slug="how-to-choose-an-ai-consultant"> And if you’re weighing up outside help, <Link href="/insights/how-to-choose-an-ai-consultant">how to choose an AI consultant</Link> sets out what to ask.</WhenPublished></p>
    </>
  );
}
