import Link from "next/link";
import type { PostMeta } from "@/lib/blog";

export const meta: PostMeta = {
  slug: "when-should-a-business-build-custom-software",
  title: "When Should a Business Build Custom Software?",
  description:
    "How to tell the difference between a problem an off-the-shelf tool can solve and one that genuinely needs custom software — with real signals to check first.",
  date: "2026-09-15",
  author: "Chinvat Bridge",
  category: "Software Strategy",
  tags: ["software", "web", "operations"],
  readingMinutes: 6,
};

export function Content() {
  return (
    <>
      <p>
        Almost never, as a first option &mdash; and that&rsquo;s the right default, not a
        discouragement. Off-the-shelf software is cheaper, faster to get running, and maintained
        by someone else. Custom software earns its cost in a narrower set of situations: when
        your process is genuinely different from how the software category assumes it works,
        when you&rsquo;re paying for several tools to do the job of one because none of them
        quite fits, or when the thing you need doesn&rsquo;t have a category yet.
      </p>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">
          Signals that off-the-shelf is still the right answer
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            You haven&rsquo;t seriously tried the mainstream tools in your category yet. Most
            business problems &mdash; invoicing, scheduling, CRM, e-commerce &mdash; are well
            served by mature products, and &ldquo;we&rsquo;re different&rdquo; is worth testing
            against a real trial before it&rsquo;s treated as fact.
          </li>
          <li>
            The workaround you&rsquo;re using with existing tools is annoying but works. Annoying
            and working is a much cheaper state than &ldquo;working, but only because we built
            and now maintain our own software.&rdquo;
          </li>
          <li>
            Your process is likely to change significantly in the next year. Custom software
            built around today&rsquo;s process can become a liability if the business changes
            shape before the investment pays back.
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">
          Signals that custom software is worth considering
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>You&rsquo;re stitching together three or more tools with manual steps
            between them</strong>, and it&rsquo;s a permanent state rather than a temporary one.
            If a genuinely core part of your operation runs through spreadsheets,
            copy-pasting, and manual reconciliation between systems that were never designed to
            work together, that&rsquo;s a real signal.
          </li>
          <li>
            <strong>The thing that makes your business different is also the thing no software
            handles.</strong> If your competitive advantage is a specific process, pricing
            model, or way of matching customers to services that doesn&rsquo;t map onto any
            existing product category, forcing it into generic software usually means giving up
            the advantage to fit the tool.
          </li>
          <li>
            <strong>You need your own customers or staff to interact with a system you
            control</strong> &mdash; a client portal, a booking system with rules specific to
            your business, an internal tool your team uses daily that off-the-shelf options only
            handle 70% of. Once a workaround becomes something customers or staff touch every
            day, the cost of the friction adds up fast.
          </li>
          <li>
            <strong>You&rsquo;ve actually costed the alternative</strong> &mdash; the combined
            subscription cost of multiple tools, plus the ongoing staff time spent on manual
            steps between them, and it&rsquo;s a genuinely large number over a year or two, not a
            guess.
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">
          The middle ground most businesses skip
        </h2>
        <p>
          Between &ldquo;buy a generic tool&rdquo; and &ldquo;build fully custom
          software&rdquo; sits a middle option that&rsquo;s often the right answer: a smaller,
          purpose-built internal tool or dashboard that solves one specific problem well,
          connected to the systems you already use rather than replacing them. This is usually
          far cheaper and faster to build than a full custom platform, because it doesn&rsquo;t
          need to solve every problem &mdash; just the one that&rsquo;s actually costing you
          time. Client portals, internal dashboards, and lightweight booking or scheduling tools
          built around your exact rules are common examples.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">
          What a well-scoped custom project looks like
        </h2>
        <p>
          The projects that go well share a pattern: a clearly written-down problem, a specific
          group of people who will use the result, and a defined first version that solves that
          one problem &mdash; not a wish list of every feature that might be useful eventually.
          Scope creep, not technical difficulty, is the most common reason custom software
          projects run over budget or never quite launch. A good starting brief is usually
          shorter than people expect: what&rsquo;s the process today, what&rsquo;s wrong with
          it, and what does &ldquo;solved&rdquo; look like for the people actually doing the
          work.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">
          Build, or connect what you already have?
        </h2>
        <p>
          Before committing to a custom build, it&rsquo;s worth checking whether the actual
          problem is a connection problem rather than a missing-software problem &mdash; see our
          piece on{" "}
          <Link
            className="text-gold-300 hover:text-gold-400 underline underline-offset-4"
            href="/insights/what-should-you-automate-first"
          >
            what to automate first
          </Link>
          . A surprising number of &ldquo;we need custom software&rdquo; conversations turn out
          to be solvable by properly connecting tools you already pay for.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">In short</h2>
        <p>
          Default to off-the-shelf software until you have a specific, costed reason not to.
          Custom software earns its cost when your process is genuinely different, when
          you&rsquo;re paying (in tools and staff time) for a permanent workaround between
          systems, or when the thing customers or staff interact with daily doesn&rsquo;t exist
          as a product yet. When it is the right call, a small, well-scoped tool that solves one
          real problem beats a large platform that tries to solve everything at once.
        </p>
        <p>
          If you&rsquo;re not sure which side of that line you&rsquo;re on,{" "}
          <Link className="text-gold-300 hover:text-gold-400 underline underline-offset-4" href="/#contact">
            describe the problem to us
          </Link>{" "}
          &mdash; we&rsquo;ll tell you honestly if it&rsquo;s a connection problem, an
          off-the-shelf fit, or a genuine custom{" "}
          <Link className="text-gold-300 hover:text-gold-400 underline underline-offset-4" href="/#services">
            software project
          </Link>
          .
        </p>
      </div>
    </>
  );
}
