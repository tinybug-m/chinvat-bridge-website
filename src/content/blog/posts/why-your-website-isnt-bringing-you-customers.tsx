import Link from "next/link";
import type { PostMeta } from "@/lib/blog";

export const meta: PostMeta = {
  slug: "why-your-website-isnt-bringing-you-customers",
  title: "Why Your Website Isn't Bringing You Enough Customers",
  description:
    "The most common, checkable reasons a UK small business website gets visitors but not enquiries — and what to check first before assuming you need more traffic.",
  date: "2026-09-15",
  author: "Chinvat Bridge",
  category: "SEO & Discovery",
  tags: ["seo", "local-seo", "website"],
  readingMinutes: 6,
};

export function Content() {
  return (
    <>
      <p>
        Before assuming the problem is &ldquo;not enough traffic&rdquo;, check three things in
        this order: can people actually find you when they search for what you do, does your
        site load properly on a phone, and is it obvious what you want a visitor to do next. In
        that order, because fixing traffic before fixing the other two just means more people
        bounce off a page that was never going to convert them anyway.
      </p>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">
          1. Can people find you for the searches that actually matter?
        </h2>
        <p>
          Search engines rank pages for search terms, not businesses. If your homepage
          doesn&rsquo;t contain the words a real customer would actually type &mdash; your
          service, your location, and the problem you solve, in plain language &mdash; it has
          nothing to rank for, no matter how good the design is. A page titled &ldquo;Home&rdquo;
          with a hero image and no real copy is invisible to Google, however nice it looks.
        </p>
        <p>
          A quick way to check: search for your own business by the terms you&rsquo;d expect a
          customer to use (&ldquo;plumber in [your town]&rdquo;, &ldquo;bookkeeping for small
          business UK&rdquo;), in an incognito browser window so your own search history
          doesn&rsquo;t skew the results. If you don&rsquo;t appear on the first page, and a
          plausible competitor does, look at what&rsquo;s on their page that isn&rsquo;t on
          yours &mdash; it&rsquo;s usually more specific service copy, more location detail, or
          a Google Business Profile that&rsquo;s actually filled in.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">
          2. Does your site actually work on a phone, on a real connection?
        </h2>
        <p>
          Most local searches happen on mobile, often on the move. If your site takes more than
          a couple of seconds to become usable, or text is too small to read without zooming,
          people leave before they ever see what you offer &mdash; and Google&rsquo;s own
          ranking signals increasingly factor in exactly this kind of real-world loading speed
          (known as Core Web Vitals). A site that &ldquo;looks fine on my laptop&rdquo; can
          still be genuinely slow and cramped on a mid-range phone over a normal mobile
          connection, which is how most of your actual customers will see it.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">
          3. Is it obvious what you want someone to do?
        </h2>
        <p>
          A visitor who finds your site and understands what you do will still leave without
          contacting you if the next step isn&rsquo;t obvious. Every page that could plausibly
          be someone&rsquo;s entry point &mdash; not just the homepage &mdash; needs a clear way
          to get in touch: a phone number, a contact form, a booking link. If your
          call-to-action is buried at the bottom of a long page, or hidden inside a menu,
          you&rsquo;re relying on visitors to hunt for it.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">
          Your Google Business Profile matters as much as your website
        </h2>
        <p>
          For most local UK businesses, the Google Business Profile (the panel that appears
          alongside map results) is seen by more potential customers than the website itself.
          It&rsquo;s worth auditing separately: is the category correct and specific, are your
          opening hours accurate, do you have real photos of your actual premises or work, and
          are you responding to reviews &mdash; including the negative ones. A profile
          that&rsquo;s fully filled in and actively maintained consistently outperforms one that
          was set up once and forgotten, independent of how good either business actually is.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">
          What &ldquo;getting reviews&rdquo; actually means, and doesn&rsquo;t
        </h2>
        <p>
          Reviews genuinely help both rankings and conversion, but there&rsquo;s a right and
          wrong way to build them. The wrong way &mdash; offering discounts for reviews,
          filtering out unhappy customers before asking, or posting on behalf of someone &mdash;
          breaks Google&rsquo;s policies and can get a profile penalised or suspended. The
          reliable way is simpler and slower: ask every satisfied customer, right after the
          moment they were happiest with the work, with a direct link that takes them straight to
          the review box. Consistency beats any trick.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">
          When the problem really is technical SEO
        </h2>
        <p>
          If the three checks above look fine and you&rsquo;re still not appearing for the terms
          that matter, the issue is more likely to be structural: missing or duplicate page
          titles, no clear site architecture connecting your pages, missing structured data that
          helps Google understand what a page is about, or pages that are technically blocking
          search engines from indexing them at all. These are fixable, but they require an
          actual technical audit rather than guesswork &mdash; this is the kind of work covered
          under our{" "}
          <Link className="text-gold-300 hover:text-gold-400 underline underline-offset-4" href="/pricing">
            SEO plans
          </Link>
          , starting with a full technical audit on every tier.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">In short</h2>
        <p>
          Before spending money on more traffic, check whether your site can actually be found
          for the searches your customers use, whether it works properly on a real phone, and
          whether the next step is obvious once someone arrives. Then make sure your Google
          Business Profile is complete and actively maintained, and build reviews the honest,
          gradual way. If all of that checks out and visibility is still the problem, that&rsquo;s
          usually a sign of a deeper technical SEO issue worth a proper audit.
        </p>
        <p>
          Want a straight answer on which of these is actually holding your site back?{" "}
          <Link className="text-gold-300 hover:text-gold-400 underline underline-offset-4" href="/#contact">
            Get in touch
          </Link>{" "}
          and tell us your website &mdash; we&rsquo;ll tell you what we&rsquo;d fix first.
        </p>
      </div>
    </>
  );
}
