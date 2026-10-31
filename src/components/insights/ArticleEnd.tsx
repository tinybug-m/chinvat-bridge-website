import Link from "next/link";
import { ArrowIcon } from "@/components/system/ArrowIcon";
import { ButtonLink } from "@/components/system/Button";
import { Container } from "@/components/system/Container";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/constants";
import type { Post } from "@/lib/blog";

/** Related reading as hairline rows, then a quiet way to get in touch. */
export function ArticleEnd({ related }: { related: Post[] }) {
  return (
    <>
      {related.length > 0 ? (
        <section aria-labelledby="related-title" className="border-t border-line py-section">
          <Container className="grid grid-cols-1 gap-y-8 lg:grid-cols-12 lg:gap-x-6">
            <h2 id="related-title" className="font-display text-subheading font-medium text-ink lg:col-span-3 lg:pt-5">
              Related reading
            </h2>
            <ul className="border-b border-line lg:col-span-8 lg:col-start-4">
              {related.map((post) => (
                <li key={post.meta.slug} className="border-t border-line">
                  <Link
                    href={`/insights/${post.meta.slug}`}
                    prefetch={false}
                    className="group/row relative grid min-h-16 grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-5"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 -top-px h-px origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out-quart group-hover/row:scale-x-100 group-focus-visible/row:scale-x-100 motion-reduce:transition-none"
                    />
                    <span className="text-balance font-display text-body font-medium text-ink transition-colors duration-200 group-hover/row:text-cobalt-700 md:text-lede">
                      {post.meta.title}
                    </span>
                    <span className="col-start-1 row-start-2 text-small text-ink-muted">{post.meta.category}</span>
                    <ArrowIcon className="col-start-2 row-span-2 row-start-1 text-ink group-hover/row:translate-x-0.5 group-hover/row:text-cobalt-700" />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <section aria-labelledby="article-contact-title" className="border-t border-line bg-haze py-section">
        <Container className="grid grid-cols-1 gap-y-8 lg:grid-cols-12 lg:items-end lg:gap-x-6">
          <div className="lg:col-span-7">
            <h2 id="article-contact-title" className="max-w-[18ch] text-balance font-display text-heading font-medium text-ink">
              Build a better way forward.
            </h2>
            <p className="mt-4 max-w-measure text-body text-pretty text-ink-soft">
              Tell us what&rsquo;s slowing your business down, where you&rsquo;re trying to grow, or what you&rsquo;d
              like to build.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 lg:col-span-5 lg:items-end">
            <ButtonLink href="/#contact" prefetch={false} variant="secondary" size="lg" arrow="right" className="w-full sm:w-auto">
              Start a conversation
            </ButtonLink>
            <a
              href={CONTACT_MAILTO}
              className="inline-flex min-h-11 items-center text-small text-cobalt-700 underline decoration-cobalt-700/35 underline-offset-[0.22em] transition-[text-decoration-color] hover:decoration-cobalt-700"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
