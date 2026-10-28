import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowIcon } from "@/components/system/ArrowIcon";
import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionMarker } from "@/components/system/SectionMarker";
import { TextLink } from "@/components/system/TextLink";
import { getAllPosts } from "@/lib/blog";

export function Insights() {
  const posts = getAllPosts();

  return (
    <Section id="insights" labelledBy="insights-title" ruled>
      <Container>
        <div className="grid gap-x-6 gap-y-8 md:grid-cols-12 md:items-end">
          <Reveal className="md:col-span-7">
            <SectionMarker index="06" label="Insights" />
            <h2
              id="insights-title"
              className="mt-8 max-w-[18ch] text-balance font-display text-title font-medium [font-stretch:100%] lg:[font-stretch:112%]"
            >
              Ideas and observations.
            </h2>
          </Reveal>
          <Reveal delay={80} className="md:col-span-4 md:col-start-9">
            <p className="max-w-measure text-pretty text-lede text-ink-soft">
              Practical thinking about AI, software, automation and digital growth.
            </p>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <ol className="mt-14 border-b border-line md:mt-20">
            {posts.map((post, index) => (
              <li key={post.meta.slug} className="border-t border-line">
                <Link
                  href={`/insights/${post.meta.slug}`}
                  className="group/row relative grid min-h-16 grid-cols-[3.25rem_1fr_auto] items-center gap-x-4 gap-y-1.5 py-6 md:grid-cols-[4.5rem_12rem_1fr_auto_1rem] md:gap-x-6 md:py-8"
                >
                  {/* The seam sweeps the row's top rule on hover or focus. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 -top-px h-px origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out-quart group-hover/row:scale-x-100 group-focus-visible/row:scale-x-100 motion-reduce:transition-none"
                  />
                  <span className="col-start-1 row-start-1 flex items-center gap-2 font-label text-label uppercase text-ink md:row-start-1">
                    <span
                      aria-hidden="true"
                      className="size-1.5 border border-line-strong transition-colors duration-200 group-hover/row:border-ink group-hover/row:bg-ink"
                    />
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="col-start-2 row-start-1 font-label text-label uppercase text-ink-muted md:col-start-2">
                    {post.meta.category}
                  </span>
                  <h3 className="col-start-2 row-start-2 text-balance font-display text-subheading font-medium text-ink transition-colors duration-200 group-hover/row:text-cobalt-700 md:col-start-3 md:row-start-1">
                    {post.meta.title}
                  </h3>
                  <span className="col-start-2 row-start-3 font-label text-label uppercase text-ink-muted md:col-start-4 md:row-start-1 md:whitespace-nowrap">
                    {post.meta.readingMinutes} min read
                  </span>
                  <ArrowIcon className="col-start-3 row-span-3 row-start-1 self-center text-ink transition-transform duration-200 ease-out-quart group-hover/row:translate-x-0.5 group-hover/row:text-cobalt-700 motion-reduce:transition-none md:col-start-5 md:row-span-1" />
                </Link>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={160} className="mt-8">
          <TextLink href="/insights" className="inline-flex min-h-11 items-center gap-2 text-body">
            All insights
            <ArrowIcon />
          </TextLink>
        </Reveal>
      </Container>
    </Section>
  );
}
