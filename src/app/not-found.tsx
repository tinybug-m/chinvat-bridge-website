import type { Metadata } from "next";
import { BodyFontScope } from "@/components/site/BodyFontScope";
import { SiteShell } from "@/components/site/SiteShell";
import { ButtonLink } from "@/components/system/Button";
import { Container } from "@/components/system/Container";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/constants";
import { archivo, martianMono } from "@/styles/fonts";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

const FONT_VARIABLES = `${archivo.variable} ${martianMono.variable}`;

/*
 * The 404 sits outside both route groups, so it brings the new design's fonts
 * itself (as the (site) layout does). A broken link from the homepage then
 * lands on the same paper, header and footer instead of the old site.
 */
export default function NotFound() {
  return (
    <div className={`${FONT_VARIABLES} contents font-body`}>
      <BodyFontScope className={FONT_VARIABLES} />
      <SiteShell>
        <section aria-labelledby="not-found-title" className="pt-[calc(4.5rem+5rem)] pb-section">
          <Container>
            <p className="text-small text-ink-muted">404</p>
            <h1
              id="not-found-title"
              className="mt-4 max-w-[16ch] text-balance font-display text-title font-medium [font-stretch:100%] lg:[font-stretch:112%]"
            >
              That page doesn&rsquo;t exist.
            </h1>
            <p className="mt-6 max-w-measure text-pretty text-lede text-ink-soft">
              The page you&rsquo;re looking for may have moved, or the link may be out of date.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href="/" arrow="right" className="w-full sm:w-auto">
                Back to home
              </ButtonLink>
              <ButtonLink href="/pricing" variant="secondary" className="w-full sm:w-auto">
                View plans
              </ButtonLink>
              <ButtonLink href="/insights" variant="secondary" className="w-full sm:w-auto">
                Read insights
              </ButtonLink>
            </div>
            <p className="mt-10 text-small text-ink-muted">
              Still stuck?{" "}
              <a href={CONTACT_MAILTO} className="text-cobalt-700 underline decoration-cobalt-700/35 underline-offset-[0.22em] hover:decoration-cobalt-700">
                {CONTACT_EMAIL}
              </a>
            </p>
          </Container>
        </section>
      </SiteShell>
    </div>
  );
}
