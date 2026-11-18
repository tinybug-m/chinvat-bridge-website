import Link from "next/link";
import type { PostMeta } from "@/lib/blog";

/*
 * DRAFT from seo/overnight-2026-11-18/editorial/articles/what-a-technical-seo-audit-should-include.md (its front matter holds the
 * keyword, audience and review notes). Hidden in production while `draft` is true; visible in
 * `next dev` for review. To publish: remove `draft`, set `date` to the publishing day, and add the
 * article to its service page's related insights.
 */
export const meta: PostMeta = {
  slug: "what-a-technical-seo-audit-should-include",
  title: "What a Technical SEO Audit Should Include",
  seoTitle: "What a Technical SEO Audit Should Include",
  description:
    "The checks that matter in a technical SEO audit — crawling, indexing, rendering, structure, structured data and Core Web Vitals — and the tool scores you can ignore.",
  date: "2026-11-18",
  author: "Chinvat Bridge",
  category: "SEO & Discovery",
  tags: ["seo", "technical-seo"],
  readingMinutes: 9,
  draft: true,
};

export function Content() {
  return (
    <>
      <p>A useful technical SEO audit answers three questions. Can search engines crawl and index the pages that matter? Do they understand what each page is about? Is anything on the site holding those pages back? It should end with a short, prioritised list of fixes, each tied to a URL and the evidence for it, rather than a 200-page export from a crawling tool. Here is what belongs in one, and what you can safely ignore. It is also the checklist behind the <Link href="/services/seo">technical SEO audits and fixes</Link> in our plans.</p>

      <h2>Crawling and indexing: can search engines reach the right pages?</h2>

      <p>This is the foundation, and the part where small problems cause the biggest losses.</p>

      <ul>
        <li><strong>robots.txt.</strong> Check that it doesn’t block anything important, and that it points to the sitemap. Remember that robots.txt controls <em>crawling</em>, not indexing: a blocked page can still appear in results if other pages link to it. To keep a page out of the index, allow crawling and use <code>noindex</code> (<a href="https://developers.google.com/search/docs/crawling-indexing/robots/intro" target="_blank" rel="noopener noreferrer">Google’s robots.txt guide</a>).</li>
        <li><strong>Indexing directives.</strong> Look for <code>noindex</code> on pages that should rank, often left over from a staging site, and for its absence on pages that shouldn’t (login, checkout, internal previews).</li>
        <li><strong>The sitemap.</strong> It should list every page you want indexed and nothing else: no redirects, no <code>noindex</code> pages, no errors. <code>lastmod</code> dates should reflect real changes, not the build time.</li>
        <li><strong>Status codes and redirects.</strong> Pages that should exist return 200; removed pages return 404 or 410, or redirect permanently (301 or 308) to their closest replacement. Watch for chains (A → B → C) and loops.</li>
        <li><strong>One version of every page.</strong> <code>http</code> and <code>https</code>, <code>www</code> and bare domain, trailing slash or not, and in some cases <strong>two whole domains</strong> should all resolve to a single version, with a matching canonical tag (<a href="https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls" target="_blank" rel="noopener noreferrer">Google on duplicate URLs</a>). A canonical is a strong hint, not an instruction, so it needs to agree with your redirects, sitemap and internal links.</li>
      </ul>

      <blockquote>
        <p>We found the last of these on our own site while preparing this guide: the site answered on two domains, and every canonical pointed at the one we were moving away from. It’s an easy mistake, invisible to visitors, and exactly what an audit is for.</p>
      </blockquote>

      <h2>Rendering: does the page search engines see match the one people see?</h2>

      <p>Many modern sites build their content with JavaScript. Google can render JavaScript, but it costs time and can fail, and other search engines and AI crawlers vary in how well they cope. Check the HTML your server actually returns: are the main text, headings, links and structured data in it, or do they appear only after scripts run? In Search Console, the URL Inspection tool shows the page as Google rendered it. Sites built with frameworks that render on the server, or generate static pages, usually pass this easily; single-page apps often don’t.</p>

      <h2>Structure and internal links: can search engines tell what matters?</h2>

      <ul>
        <li><strong>Every important page is linked</strong>, with ordinary <code>&lt;a href&gt;</code> links, from somewhere a crawler will find it. A page reachable only through a search box or a script is effectively hidden.</li>
        <li><strong>Important pages are close to the homepage</strong>, a few clicks away rather than buried.</li>
        <li><strong>Each commercial topic has its own URL.</strong> A service described only as a section of the homepage (<code>/#services</code>) has nothing that can rank on its own.</li>
        <li><strong>Anchor text describes the destination.</strong> “Workflow automation” tells a search engine more than “click here”.</li>
        <li><strong>No orphans:</strong> pages in the sitemap that nothing links to.</li>
      </ul>

      <h2>On-page signals: does each page say what it is?</h2>

      <ul>
        <li>A unique, descriptive <code>&lt;title&gt;</code> on every page, leading with what the page offers.</li>
        <li>A meta description that would make someone click: not a ranking factor, but it shapes the snippet.</li>
        <li>One clear H1, and headings that follow the page’s actual structure.</li>
        <li>No two pages competing for the same search (cannibalisation): if they do, merge them or give each a distinct purpose.</li>
        <li>Descriptive alt text on meaningful images, and empty alt on decorative ones.</li>
      </ul>

      <h2>Structured data: are you describing the business accurately?</h2>

      <p>Structured data (JSON-LD) tells search engines what a page represents: the organisation behind the site, a service, an article, a breadcrumb trail. An audit should check that it parses, that it matches what is visible on the page, and that the entities connect (articles and services pointing to the same organisation).</p>

      <p>It should also be realistic about rich results. Some once-popular markup no longer produces them for most sites: since August 2023 Google shows FAQ rich results only for well-known, authoritative government and health websites, and it retired HowTo rich results the following month (<a href="https://developers.google.com/search/blog/2023/08/howto-faq-changes" target="_blank" rel="noopener noreferrer">Google, August 2023, updated September 2023</a>). Adding FAQ markup to a small business’s service page won’t create a rich result, whatever a plugin suggests.</p>

      <h2>Performance and Core Web Vitals: does the page load and respond well?</h2>

      <p>Google’s <a href="https://developers.google.com/search/docs/appearance/core-web-vitals" target="_blank" rel="noopener noreferrer">Core Web Vitals</a> measure loading (Largest Contentful Paint, good at 2.5 seconds or less), responsiveness (Interaction to Next Paint, good at 200 milliseconds or less) and visual stability (Cumulative Layout Shift, good at 0.1 or less), assessed at the 75th percentile of real visits (<a href="https://web.dev/articles/vitals" target="_blank" rel="noopener noreferrer">web.dev</a>).</p>

      <p>Two points an audit should make clear:</p>

      <ul>
        <li><strong>Field data beats lab data.</strong> A lab test on one machine is useful for diagnosis; what real visitors experience, from Search Console’s Core Web Vitals report or real-user monitoring, is what counts.</li>
        <li><strong>Fix what’s failing, then stop.</strong> Moving from “good” to “slightly better” rarely changes rankings. Moving a template from “poor” to “good” can help, and it helps visitors either way.</li>
      </ul>

      <h2>What to ignore, or treat with suspicion</h2>

      <ul>
        <li><strong>Tool “health scores”.</strong> A score of 72 out of 100 means whatever the tool’s maker decided. Judge findings on their impact, not on the score.</li>
        <li><strong>Keyword density</strong> and <strong>text-to-HTML ratio.</strong> Neither is how modern search engines assess a page.</li>
        <li><strong>The meta keywords tag.</strong> Google ignores it.</li>
        <li><strong>Every missing alt attribute marked “critical”.</strong> Worth fixing for accessibility, but rarely a ranking emergency.</li>
        <li><strong>HTML validation errors</strong> that don’t affect rendering or crawling.</li>
        <li><strong>Hundreds of “issues” with no priority.</strong> If everything is critical, nothing is.</li>
      </ul>

      <h2>What the deliverable should look like</h2>

      <p>A good audit report is short enough to act on. For each finding it gives:</p>

      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>What</td>
            <td>Canonical tags point to an old domain</td>
          </tr>
          <tr>
            <td>Where</td>
            <td>Every page; example URLs listed</td>
          </tr>
          <tr>
            <td>Evidence</td>
            <td>The canonical tag on the homepage, and the response headers of both domains</td>
          </tr>
          <tr>
            <td>Severity</td>
            <td>Critical: splits all ranking signals</td>
          </tr>
          <tr>
            <td>Fix</td>
            <td>Set the canonical origin; redirect the old domain; update Search Console</td>
          </tr>
          <tr>
            <td>Who</td>
            <td>Developer and site owner</td>
          </tr>
          <tr>
            <td>How to check</td>
            <td>Old-domain URLs redirect; canonical matches; Search Console shows the new URLs indexed</td>
          </tr>
        </tbody>
      </table>

      <p>Findings should be ordered by impact, the audit should say what was <em>not</em> checked, and there should be a plan to retest after the fixes. The audit itself changes nothing until someone makes those fixes, so ask whether implementation is included.</p>

      <h2>What an audit costs</h2>

      <p>It depends mostly on the size and complexity of the site and on whether fixes are included. Published UK prices for a small-site audit start at a few hundred pounds, and larger or more complex sites run to several thousand. See <Link href="/insights/how-much-does-seo-cost-uk">how much does SEO cost in the UK?</Link> for how audits compare with ongoing work.</p>

      <h2>In short</h2>

      <p>A technical SEO audit worth paying for checks crawling and indexing, rendering, structure and internal links, on-page signals, structured data and real-world performance, and ignores vanity scores. It delivers a prioritised list of specific fixes with evidence, and a way to confirm each one worked. If your site already gets visitors who don’t enquire, start with <Link href="/insights/why-your-website-isnt-bringing-you-customers">why your website isn’t bringing you enough customers</Link> instead.</p>

      <p>Every one of <Link href="/services/seo">our SEO plans</Link> begins with a technical audit and fixes. If you’d like a second opinion on your site, <Link href="/#contact">tell us where search is holding you back</Link>.</p>
    </>
  );
}
