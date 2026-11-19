import Link from "next/link";
import { WhenPublished } from "@/components/insights/WhenPublished";
import type { PostMeta } from "@/lib/blog";

/*
 * DRAFT from seo/overnight-2026-11-18/editorial/articles/how-much-does-seo-cost-uk.md (its front matter holds the
 * keyword, audience and review notes). Hidden in production while `draft` is true; visible in
 * `next dev` for review. To publish: remove `draft`, set `date` to the publishing day, and add the
 * article to its service page's related insights.
 */
export const meta: PostMeta = {
  slug: "how-much-does-seo-cost-uk",
  title: "How Much Does SEO Cost in the UK?",
  seoTitle: "How Much Does SEO Cost in the UK?",
  description:
    "What UK small businesses typically pay for SEO, how retainers, audits and day rates differ, what drives the price, and the red flags to avoid at any budget.",
  date: "2026-11-18",
  author: "Chinvat Bridge",
  category: "SEO & Discovery",
  tags: ["seo", "pricing"],
  readingMinutes: 8,
  draft: true,
};

export function Content() {
  return (
    <>
      <p>Most small UK businesses buy SEO as a monthly retainer, and published price guides from UK agencies put small-business retainers anywhere from a few hundred pounds to a few thousand pounds a month. One-off technical audits range from a few hundred pounds for a small site to several thousand for a large one, and freelancers often charge by the hour or day. The spread is wide because “SEO” covers very different amounts of work. The useful question isn’t what SEO costs, but what work you are paying for.</p>

      <h2>The three ways SEO is priced</h2>

      <h3>Monthly retainers</h3>

      <p>The most common arrangement. You pay a fixed amount each month for an agreed set of work: technical fixes, on-page optimisation, content and, at higher levels, link building and digital PR. Retainers suit SEO because results build over months, and the work is never truly finished as your site, your competitors and search engines change.</p>

      <p>Look for a retainer that states <em>what</em> is delivered each month (how many pieces of content, how many link-building campaigns, what the report contains), not just a number of hours. It is how we set out <Link href="/services/seo">our SEO service</Link>, and a fair test to apply to anyone.</p>

      <h3>One-off projects and audits</h3>

      <p>A technical SEO audit, a site migration, or a content strategy delivered as a fixed piece of work. Audits are a sensible first step if you don’t know what’s wrong, but an audit on its own changes nothing: someone still has to make the fixes. Ask whether the price includes implementation, or only the report.<WhenPublished slug="what-a-technical-seo-audit-should-include"> We cover what a good audit contains in <Link href="/insights/what-a-technical-seo-audit-should-include">what a technical SEO audit should include</Link>.</WhenPublished></p>

      <h3>Hourly and day rates</h3>

      <p>Common with independent consultants, and useful for advice, training or a specific technical problem. A day rate tells you little about the total cost until you know how many days the work will take, so ask for an estimate in days for a defined scope.</p>

      <h2>What drives the price</h2>

      <p><strong>How competitive your searches are.</strong> Ranking for “accountant in Leeds” is a different job from ranking for “accountant”. The more businesses competing for the same searches, and the stronger their sites, the more content and authority it takes to compete.</p>

      <p><strong>The size and state of your site.</strong> A ten-page site in good technical order needs far less work than a 2,000-page site with duplicate pages, broken redirects or a rendering problem. If the site itself needs rebuilding, that is a separate cost from SEO.</p>

      <p><strong>How much content is produced.</strong> Content is usually the largest share of ongoing work. Well-researched, original pages written for a specific search take time to do properly. Very high volumes at very low prices usually mean thin or generic content, which is unlikely to rank and can drag down the rest of the site.</p>

      <p><strong>Whether link building is included.</strong> Earning links from relevant, credible sites, through digital PR and editorial outreach, is labour-intensive and is often what separates entry-level plans from higher ones. Be wary of cheap links: Google’s <a href="https://developers.google.com/search/docs/essentials/spam-policies" target="_blank" rel="noopener noreferrer">spam policies</a> treat buying links, or exchanging them for ranking purposes, as manipulation.</p>

      <p><strong>Who does the work, and how much strategy is involved.</strong> Senior time costs more. A retainer that includes proper keyword research, competitor analysis and a monthly strategy review is doing more than one that only produces content.</p>

      <h2>What you should expect at different budgets</h2>

      <p>These are typical patterns, not rules.</p>

      <ul>
        <li><strong>At the lower end</strong> (a few hundred pounds a month): technical foundations, on-page optimisation of key pages, a modest amount of content and a monthly report. It suits small businesses in less competitive local or niche markets, and sites that are mostly in good shape.</li>
        <li><strong>In the middle</strong> (several hundred to around a couple of thousand pounds a month): fuller audits and ongoing technical work, more content, competitor analysis and some link building or digital PR.</li>
        <li><strong>At the higher end</strong> (several thousand pounds a month and up): competitive national markets, large sites, international SEO, and sustained digital PR. This is mostly for larger businesses.</li>
      </ul>

      <h2>Red flags at any price</h2>

      <ul>
        <li><strong>Guaranteed rankings or traffic.</strong> Nobody outside the search engines controls rankings. Google’s own guidance on <a href="https://developers.google.com/search/docs/fundamentals/do-i-need-seo" target="_blank" rel="noopener noreferrer">hiring an SEO</a> warns against anyone who guarantees a ranking.</li>
        <li><strong>Secret methods.</strong> Good SEO is explainable. If you can’t be told what is being done to your site, you can’t judge it.</li>
        <li><strong>Bought or exchanged links.</strong> These risk penalties that can take months to recover from.</li>
        <li><strong>No access to your own data.</strong> You should own your Search Console and analytics accounts, and the agency should be added as a user, not the other way round.</li>
        <li><strong>Long lock-ins before any results.</strong> A minimum term is reasonable for some projects; a long contract with no break clause and no defined deliverables isn’t.</li>
        <li><strong>Reports that only show rankings.</strong> A good report connects work done to visibility, traffic and, ideally, enquiries.</li>
      </ul>

      <h2>What our plans cost</h2>

      <p>We publish our prices, because comparing SEO offers is hard enough already. Our monthly plans are below; as our <Link href="/terms">terms</Link> set out, prices exclude any applicable tax, which is added at checkout where relevant.</p>

      <ul>
        <li><strong>Starter, £299 a month:</strong> keyword research, on-page SEO, a technical SEO audit with ongoing fixes, Core Web Vitals monitoring, structured data, a basic content strategy and competitor analysis, content each month, a monthly report and email support.</li>
        <li><strong>Growth, £499 a month:</strong> everything in Starter with a fuller audit and deeper technical work, more content, fuller competitor analysis and content strategy, one link-building and digital PR campaign a month, fortnightly strategy briefings and priority support.</li>
        <li><strong>Scale, £799 a month:</strong> more content again, two link-building campaigns a month, multi-region site architecture and hreflang for international sites, and a lead consultant.</li>
      </ul>

      <p>Plans are billed monthly with no long-term contract, and we ask for 30 days’ notice to cancel. The <Link href="/pricing">pricing page</Link> lists exactly what each plan includes, and <Link href="/services/seo">what our SEO service includes</Link> explains how the work fits together. Like anyone honest about SEO, we don’t guarantee rankings.</p>

      <h2>How to decide what to spend</h2>

      <ol>
        <li><strong>Start from the value of a customer.</strong> If one new client is worth £5,000 a year, the question is how many extra enquiries a year would make a retainer worthwhile, not whether £300 or £800 sounds like a lot.</li>
        <li><strong>Give it time.</strong> Technical fixes can show effects within weeks of pages being recrawled; content and authority usually take months. Judge a retainer over two or three quarters, not one month.</li>
        <li><strong>Fix the site first if it needs it.</strong> If visitors already arrive and don’t enquire, more traffic won’t help yet. <Link href="/insights/why-your-website-isnt-bringing-you-customers">Why your website isn’t bringing you enough customers</Link> covers what to check first.</li>
        <li><strong>Ask for a written plan.</strong> Whoever you hire should be able to tell you, before you sign, what they would do in the first three months and why.</li>
      </ol>

      <h2>In short</h2>

      <p>UK small businesses typically pay from a few hundred to a few thousand pounds a month for SEO, depending on how competitive their market is, the state of their site, how much content is produced and whether link building is included. Compare offers on the work delivered, not the headline price; avoid guarantees, secrecy and bought links; and judge results over months.</p>

      <p>If you’d like to see how our plans compare with what you are paying now, <Link href="/pricing">compare our SEO plans</Link>, or <Link href="/#contact">tell us about your website</Link> and we’ll tell you what we’d look at first.</p>
    </>
  );
}
