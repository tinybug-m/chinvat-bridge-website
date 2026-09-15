import Link from "next/link";
import type { PostMeta } from "@/lib/blog";

export const meta: PostMeta = {
  slug: "what-should-you-automate-first",
  title: "What Should You Automate First?",
  description:
    "A simple framework for picking your first business process automation project, plus the five most common places small UK businesses find quick wins.",
  date: "2026-09-15",
  author: "Chinvat Bridge",
  category: "Process Automation",
  tags: ["automation", "workflows", "operations"],
  readingMinutes: 6,
};

export function Content() {
  return (
    <>
      <p>
        Automate the process that is repetitive, rule-based, and currently done by copying
        information from one system into another. That combination &mdash; repeated often,
        follows clear rules, involves moving data between tools &mdash; is where automation pays
        back fastest and breaks least often. Everything else on your list can wait.
      </p>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">
          Why that combination matters
        </h2>
        <p>Each part of the test rules out a different way automation projects go wrong:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Repetitive</strong> &mdash; if it happens once a month, the automation rarely
            pays back the time spent building and maintaining it.
          </li>
          <li>
            <strong>Rule-based</strong> &mdash; if the process requires judgement calls that
            change case by case, you&rsquo;ll spend more time handling exceptions than you
            saved.
          </li>
          <li>
            <strong>Moving data between systems</strong> &mdash; this is where manual work is
            both the most tedious and the most error-prone (typos, missed rows, forgotten
            steps), so it&rsquo;s also where automation has the most obvious, measurable
            benefit.
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">
          Five places small UK businesses usually find their first win
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>New customer or lead intake.</strong> A form submission, a new email
            enquiry, or a new row in a spreadsheet triggering a welcome email, a CRM entry, and
            a task for whoever follows up &mdash; instead of someone doing all three by hand.
          </li>
          <li>
            <strong>Invoice and expense processing.</strong> Pulling data from a supplier
            invoice or receipt into your accounting software instead of retyping it. This is one
            of the most common and best-understood automation wins for UK small businesses, and
            most accounting platforms (Xero, QuickBooks) already support it natively or via a
            connector.
          </li>
          <li>
            <strong>Scheduling and reminders.</strong> Appointment confirmations, review
            requests sent a set number of days after a job, renewal reminders before a contract
            or subscription lapses.
          </li>
          <li>
            <strong>Reporting that gets compiled by hand.</strong> A weekly or monthly report
            that someone currently builds by opening three different tools and copying numbers
            into a spreadsheet. If the source data lives in software with an API or export, this
            is almost always automatable.
          </li>
          <li>
            <strong>Internal handoffs.</strong> A sale being marked &ldquo;won&rdquo; should be
            able to automatically notify whoever handles onboarding, without someone remembering
            to send a Slack message or email.
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">
          How to actually choose between them
        </h2>
        <p>
          If more than one of the above applies to your business, use two questions to rank
          them: how often does it happen, and how annoyed is the person doing it? Frequency
          multiplied by frustration is usually a better guide than frequency alone &mdash; a task
          done fifty times a day that nobody minds is often less urgent than one done five times
          a day that everyone dreads, because dread is where mistakes and burnout happen.
        </p>
        <p>
          It&rsquo;s also worth checking whether the tools you already pay for can do it before
          building anything custom. Most small businesses are already running software &mdash; a
          CRM, an accounting package, a helpdesk, an e-commerce platform &mdash; that has some
          built-in automation or a connector to tools like Zapier or Make. Wiring existing tools
          together is almost always faster and cheaper than custom development, and it&rsquo;s
          where{" "}
          <Link className="text-gold-300 hover:text-gold-400 underline underline-offset-4" href="/#services">
            workflow automation
          </Link>{" "}
          work usually starts.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">
          When off-the-shelf connectors aren&rsquo;t enough
        </h2>
        <p>
          Sometimes the systems involved don&rsquo;t talk to each other cleanly &mdash; an older
          piece of industry-specific software, a spreadsheet that&rsquo;s become a de facto
          database, or a process that spans tools with no existing connector between them.
          That&rsquo;s the point where custom integration work (built against the systems&rsquo;
          APIs directly) starts to make more sense than trying to force a no-code tool to do
          something it wasn&rsquo;t designed for.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">
          A word of caution: don&rsquo;t automate a broken process
        </h2>
        <p>
          Automating a process that&rsquo;s inefficient just makes the inefficiency happen faster
          and more invisibly. Before automating, write down the process as it actually happens
          today &mdash; not as it&rsquo;s supposed to happen. If there are steps nobody can
          explain the reason for, or approvals that exist &ldquo;just in case&rdquo;, fix the
          process first. Automation should come after you&rsquo;ve confirmed the process is
          worth repeating exactly as it is.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">In short</h2>
        <p>
          Look for a process that&rsquo;s repetitive, rule-based, and involves moving information
          between systems by hand. Rank your candidates by frequency times frustration. Check
          what your existing tools can already do before building anything new. And fix the
          process itself before you automate it &mdash; automating a bad process just breaks
          things faster.
        </p>
        <p>
          If you&rsquo;ve got a process in mind and aren&rsquo;t sure whether it&rsquo;s worth
          automating,{" "}
          <Link className="text-gold-300 hover:text-gold-400 underline underline-offset-4" href="/#contact">
            describe it to us
          </Link>{" "}
          and we&rsquo;ll tell you honestly whether it&rsquo;s a quick win, a bigger project, or
          something your existing software can already do for free.
        </p>
      </div>
    </>
  );
}
