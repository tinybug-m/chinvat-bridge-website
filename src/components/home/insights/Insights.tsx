import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowIcon } from "@/components/system/ArrowIcon";
import { Container } from "@/components/system/Container";
import { Section } from "@/components/system/Section";
import { SectionHeading } from "@/components/system/SectionHeading";
import { TextLink } from "@/components/system/TextLink";
import { getAllPosts } from "@/lib/blog";

/*
 * Calmer and tighter than Capabilities: a narrow heading column beside a
 * compact index. Rows keep the hairline, since there the rule is the pattern.
 */
export function Insights() {
  const posts = getAllPosts();

  return (
    <Section id="insights" labelledBy="insights-title" className="py-16 md:py-24">
      <Container className="grid gap-x-6 gap-y-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <SectionHeading id="insights-title" measure="max-w-[12ch]">
            Ideas and observations.
          </SectionHeading>
          <p className="mt-5 max-w-[26rem] text-pretty text-body text-ink-soft">
            Practical thinking about AI, software, automation and digital growth.
          </p>
          <TextLink href="/insights" className="mt-4 inline-flex min-h-11 items-center gap-2 text-body">
            All insights
            <ArrowIcon />
          </TextLink>
        </Reveal>

        <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
          <ol className="border-b border-line">
            {posts.map((post) => (
              <li key={post.meta.slug} className="border-t border-line">
                <Link
                  href={`/insights/${post.meta.slug}`}
                  className="group/row relative grid min-h-16 grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-4 md:grid-cols-[1fr_auto_1rem] md:gap-x-6"
                >
                  {/* The seam sweeps the row's top rule on hover or focus. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 -top-px h-px origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out-quart group-hover/row:scale-x-100 group-focus-visible/row:scale-x-100 motion-reduce:transition-none"
                  />
                  <h3 className="col-start-1 row-start-1 text-balance font-display text-body font-medium text-ink transition-colors duration-200 group-hover/row:text-cobalt-700 md:text-lede">
                    {post.meta.title}
                  </h3>
                  <p className="col-start-1 row-start-2 text-small text-ink-muted md:col-start-1">
                    {post.meta.category}
                  </p>
                  <ArrowIcon className="col-start-2 row-span-2 row-start-1 self-center text-ink transition-transform duration-200 ease-out-quart group-hover/row:translate-x-0.5 group-hover/row:text-cobalt-700 motion-reduce:transition-none md:col-start-3" />
                </Link>
              </li>
            ))}
          </ol>
        </Reveal>
      </Container>
    </Section>
  );
}
