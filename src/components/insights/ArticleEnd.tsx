import type { ReactNode } from "react";
import { ButtonLink } from "@/components/system/Button";
import { Container } from "@/components/system/Container";
import { RowLink } from "@/components/system/RowLink";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/constants";
import type { Post } from "@/lib/blog";

interface ArticleEndProps {
  related: Post[];
  /** The closing block's heading, lede and button label; articles keep the defaults, service pages say their own. */
  title?: string;
  lede?: ReactNode;
  cta?: string;
}

/** Related reading as hairline rows, then a quiet way to get in touch. */
export function ArticleEnd({
  related,
  title = "Build a better way forward.",
  lede = (
    <>
      Tell us what&rsquo;s slowing your business down, where you&rsquo;re trying to grow, or what you&rsquo;d like to
      build.
    </>
  ),
  cta = "Start a conversation",
}: ArticleEndProps) {
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
                  <RowLink href={`/insights/${post.meta.slug}`} title={post.meta.title} meta={post.meta.category} />
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
              {title}
            </h2>
            <p className="mt-4 max-w-measure text-body text-pretty text-ink-soft">{lede}</p>
          </div>
          <div className="flex flex-col items-start gap-4 lg:col-span-5 lg:items-end">
            <ButtonLink href="/#contact" prefetch={false} variant="secondary" size="lg" arrow="right" className="w-full sm:w-auto">
              {cta}
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
