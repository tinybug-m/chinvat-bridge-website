import Link from "next/link";
import type { PostMeta } from "@/lib/blog";

/*
 * DRAFT from seo/overnight-2026-11-18/editorial/articles/uk-small-business-ai-adoption-2026.md (its front matter holds the
 * keyword, audience and review notes). Hidden in production while `draft` is true; visible in
 * `next dev` for review. To publish: remove `draft`, set `date` to the publishing day, and add the
 * article to its service page's related insights.
 */
export const meta: PostMeta = {
  slug: "uk-small-business-ai-adoption-2026",
  title: "What the UK’s AI Adoption Figures Actually Say About Small Businesses",
  seoTitle: "UK Small Business AI Adoption: What the Figures Say",
  description:
    "What the ONS and DSIT figures really show about AI use in UK businesses in 2026: who uses it, for what, what it costs and delivers, and what holds firms back.",
  date: "2026-11-18",
  author: "Chinvat Bridge",
  category: "AI & Workflows",
  tags: ["ai", "research"],
  readingMinutes: 8,
  draft: true,
};

export function Content() {
  return (
    <>
      <p>About three in ten UK businesses now use some form of AI, and small firms are not far behind the average: 29% of businesses with fewer than ten employees reported using an AI technology in September 2026, against 30% of all businesses. Most of that use is accessible text tools, most firms spend little or nothing on it, the benefits reported are real but modest, and the biggest barrier is not cost but skills. That is the picture from the two main official sources, the ONS and the Department for Science, Innovation and Technology (DSIT), read carefully. Here is what each one says, and where the numbers are easy to misread.</p>

      <h2>Two surveys, two methods</h2>

      <p>The figures come from two different exercises, and it is worth knowing which is which before quoting either.</p>

      <ul>
        <li><strong>The ONS Business Insights and Conditions Survey (BICS)</strong> is a voluntary, fortnightly survey of private-sector businesses. The latest AI figures come from Wave 165, which ran from 21 September to 4 October 2026, and were published on 8 October 2026. The ONS describes the underlying datasets as official statistics in development.</li>
        <li><strong>The DSIT AI adoption survey 2026</strong> interviewed 3,503 businesses by telephone between 7 January and 21 April 2026, with follow-up interviews and site visits. Its executive summary was published on 29 October 2026.</li>
      </ul>

      <p>Because the methods, timing and questions differ, their headline figures differ slightly too. They agree on the direction and the broad size.</p>

      <h2>How many businesses use AI?</h2>

      <ul>
        <li><strong>ONS:</strong> “Around 3 in 10 (30%) of all businesses reported using at least one type of artificial intelligence (AI) technology in September 2026”, up from 9% when the question was introduced in September 2023.</li>
        <li><strong>DSIT:</strong> “one-third of UK businesses were using at least one AI technology (32% compared to 16% in 2025)”. In other words, adoption doubled in a year.</li>
      </ul>

      <p><strong>By size</strong>, adoption rises with the number of employees:</p>

      <table>
        <thead>
          <tr>
            <th>Business size</th>
            <th>Using at least one AI technology</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Fewer than 10 employees</td>
            <td>29%</td>
            <td>ONS, September 2026</td>
          </tr>
          <tr>
            <td>10 or more employees</td>
            <td>38%</td>
            <td>ONS, September 2026</td>
          </tr>
          <tr>
            <td>Larger firms</td>
            <td>51% (ONS) to 52% (DSIT)</td>
            <td>ONS, September 2026; DSIT 2026</td>
          </tr>
        </tbody>
      </table>

      <p>One caution on the larger-firm figure: the ONS bulletin gives 51% for businesses with “250 or more employees” in its summary and chart title, and for businesses with “100 or more employees” in its body text. Quote it with the size band you can see in the source you link to.</p>

      <p><strong>By sector</strong>, knowledge-intensive industries lead. The ONS reports around 60% adoption in information and communication, the highest of any industry it surveyed, and DSIT reports 61% for the same sector and 39% for business services and administration.</p>

      <h2>The two 38% figures</h2>

      <p>The October ONS bulletin contains two different 38% figures, both about businesses with ten or more employees, and they measure different things:</p>

      <ul>
        <li><strong>38% of businesses with ten or more employees used AI technologies.</strong> This is an adoption rate.</li>
        <li><strong>Of businesses with ten or more employees that use AI, 38% said administrative and clerical roles were the most affected.</strong> This is about which jobs AI touches, among firms that already use it.</li>
      </ul>

      <p>Quoting the second as if it were the first, or the other way round, is an easy mistake.</p>

      <h2>What businesses use it for</h2>

      <p>Use is concentrated in tools that are easy to start with:</p>

      <ul>
        <li>Among businesses with ten or more employees, the most used AI technologies were text generation using large language models (21%) and visual content creation (19%) (ONS).</li>
        <li>Large language model based approaches were used by 77% of businesses using or planning to use AI (DSIT).</li>
        <li>Administration was the most common area of day-to-day use, cited by 81% of those using or planning to use AI (DSIT).</li>
      </ul>

      <h2>What it costs</h2>

      <p>Not much, for most. DSIT found that 47% of businesses able to estimate their AI spending reported no expenditure in 2025, which it attributes to “the widespread use of free tools or AI features embedded within existing software”. Where businesses did spend, spending rose with business size.</p>

      <p>DSIT also found that cost was “more commonly associated with the time, effort and resource required to implement and embed AI, rather than the direct cost of tools themselves”.</p>

      <h2>What it delivers</h2>

      <p>The reported benefits are real but mostly incremental:</p>

      <ul>
        <li>71% of adopters reported improvements in workforce productivity, and 60% more efficient or flexible processes.</li>
        <li>Half of adopters (50%) reported an overall increase in productivity, “although these gains were generally described as modest”.</li>
        <li>On operating costs, 24% reported reductions, 64% had seen “no immediate financial effect”, and 9% reported an increase.</li>
        <li>Only 14% of businesses considered AI tools to be of high or critical importance to their operations.</li>
      </ul>

      <p>Use is frequent, though: 57% of adopters said they use AI constantly, with 27% using it at least weekly.</p>

      <h2>What holds businesses back</h2>

      <ul>
        <li><strong>Skills.</strong> “Limited AI skills, expertise or knowledge affected 67% of businesses that had adopted AI, and 78% of those planning to adopt it.”</li>
        <li><strong>A clear business case.</strong> A lack of a clear business case or proven return on investment was cited particularly by non-adopters (65%).</li>
        <li><strong>Accuracy and trust.</strong> 56% of adopters, and 60% of those planning to use AI, had concerns about bias and lack of accuracy. Most businesses (81%) apply some level of human input or oversight to AI-generated outputs.</li>
      </ul>

      <h2>What happens to jobs</h2>

      <p>Among businesses with ten or more employees that use AI, 6% reported reduced headcount as a result and fewer than 1% an increase, proportions the ONS describes as broadly stable over the last year. Administrative and clerical roles were the most affected (38%), followed by creative or design roles (24%).</p>

      <h2>What this means for a small business (our view)</h2>

      <p>The figures are the sources’. This section is our interpretation.</p>

      <ul>
        <li><strong>You are not late.</strong> Seven in ten businesses didn’t report using any AI technology, and among small firms the share is similar. Starting carefully now is not falling behind.</li>
        <li><strong>The cheap start is the normal start.</strong> Nearly half of businesses able to estimate their spending spent nothing in 2025, using free tools and features inside software they already had. Begin there, with one task; <Link href="/insights/where-ai-can-save-your-business-time">Where AI can actually save your business time</Link> suggests which.</li>
        <li><strong>The hard part is the work around the tool.</strong> Skills, a clear business case, and the time to implement and embed are the barriers businesses report, not licence fees. That is where <Link href="/services/ai-integration">practical AI integration</Link> helps: choosing the task, connecting the tool to your systems, and measuring the result.</li>
        <li><strong>Keep a person in the loop.</strong> Most businesses already do, and accuracy is the most common worry. Design for review from the start.</li>
        <li><strong>Expect improvement, not transformation.</strong> Modest productivity gains on specific tasks are what most adopters report. That is worth having, and it is a sensible bar for any project or adviser; <Link href="/insights/how-to-choose-an-ai-consultant">How to choose an AI consultant</Link> covers how to hold someone to it.</li>
      </ul>

      <h2>How to read these figures</h2>

      <ul>
        <li>“Using at least one AI technology” is a broad definition: one person using a text tool counts.</li>
        <li>BICS is voluntary and covers the private sector only; its estimates carry sampling uncertainty, and the ONS publishes confidence intervals alongside them.</li>
        <li>DSIT’s survey ran from January to April 2026; the ONS figures are from late September to early October 2026. Neither is “more right”; they are different measurements.</li>
        <li>Both sources round their figures, and percentages often apply to a subgroup (adopters, businesses with ten or more employees, those planning to adopt). Check the base before quoting.</li>
      </ul>

      <h2>Sources</h2>

      <ul>
        <li>Office for National Statistics, <a href="https://www.ons.gov.uk/businessindustryandtrade/business/businessservices/bulletins/businessinsightsandimpactontheukeconomy/8october2026" target="_blank" rel="noopener noreferrer">Business insights and impact on the UK economy: 8 October 2026</a> (BICS Wave 165, 21 September to 4 October 2026).</li>
        <li>Department for Science, Innovation and Technology, <a href="https://www.gov.uk/government/publications/ai-adoption-survey-2026/ai-adoption-survey-report-2026-executive-summary" target="_blank" rel="noopener noreferrer">AI adoption survey report 2026: executive summary</a>, published 29 October 2026.</li>
      </ul>

      <p>If you’d like to talk through where AI could help in your business, <Link href="/#contact">tell us what you’re trying to improve</Link>.</p>
    </>
  );
}
