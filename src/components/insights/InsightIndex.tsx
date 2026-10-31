import Link from "next/link";
import { ArrowIcon } from "@/components/system/ArrowIcon";
import { Container } from "@/components/system/Container";
import { formatPostDate, type Post } from "@/lib/blog";

/*
 * The full index in the homepage Insights rows' language: hairline rows, the
 * seam sweeping the top rule on hover, the title turning cobalt. Wider than
 * the homepage teaser, so each row also carries its description and date.
 */
export function InsightIndex({ posts }: { posts: Post[] }) {
  return (
    <div className="pb-section">
      <Container>
        <ol className="border-b border-line">
          {posts.map((post) => (
            <li key={post.meta.slug} className="border-t border-line">
              <Link
                href={`/insights/${post.meta.slug}`}
                prefetch={false}
                className="group/row relative grid grid-cols-[1fr_auto] gap-x-6 gap-y-3 py-8 lg:grid-cols-12 lg:py-10"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 -top-px h-px origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out-quart group-hover/row:scale-x-100 group-focus-visible/row:scale-x-100 motion-reduce:transition-none"
                />
                <p className="col-span-2 flex flex-wrap gap-x-3 text-small text-ink-muted lg:col-span-3 lg:flex-col lg:pt-1.5">
                  <span className="font-medium text-ink-soft">{post.meta.category}</span>
                  <time dateTime={post.meta.date}>{formatPostDate(post.meta.date)}</time>
                </p>
                <div className="col-start-1 lg:col-span-7 lg:col-start-4">
                  <h2 className="max-w-[32ch] text-balance font-display text-subheading font-medium text-ink transition-colors duration-200 group-hover/row:text-cobalt-700 lg:text-[1.75rem] lg:leading-[1.2]">
                    {post.meta.title}
                  </h2>
                  <p className="mt-3 max-w-[38rem] text-body text-pretty text-ink-soft">{post.meta.description}</p>
                </div>
                <ArrowIcon className="col-start-2 row-start-2 mt-2 text-ink group-hover/row:translate-x-0.5 group-hover/row:text-cobalt-700 lg:col-start-12 lg:row-start-1 lg:mt-3 lg:justify-self-end" />
              </Link>
            </li>
          ))}
        </ol>
      </Container>
    </div>
  );
}
