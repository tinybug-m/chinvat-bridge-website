import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { BrokenBridge } from "@/components/not-found/BrokenBridge";
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

const rise = (delay: number) => ({ "--intro-delay": `${delay}ms` }) as CSSProperties;

/** Routes that still stand, under the buttons. */
const ROUTES = [
  { label: "Services", href: "/#services" },
  { label: "Work", href: "/#work" },
  { label: "Approach", href: "/#approach" },
  { label: "Pricing", href: "/pricing" },
];

/*
 * The 404 sits outside both route groups, so it brings the new design's fonts
 * itself (as the (site) layout does). A broken link from the homepage then
 * lands on the same paper, header and footer instead of the old site.
 *
 * Text on the left, the Approach bridge on the right with its middle span
 * fallen (BrokenBridge), bleeding toward the edge like the hero's exhibit.
 */
export default function NotFound() {
  return (
    <div className={`${FONT_VARIABLES} contents font-body`}>
      <BodyFontScope className={FONT_VARIABLES} />
      <SiteShell>
        <section aria-labelledby="not-found-title" className="relative overflow-x-clip">
          <Container className="grid grid-cols-1 pt-[calc(4rem+2rem)] pb-section lg:min-h-[clamp(40rem,100svh,54rem)] lg:grid-cols-12 lg:items-center lg:gap-x-6 lg:pt-[calc(4.5rem+2rem)]">
            <div className="mt-2 lg:col-span-5 lg:mt-0 lg:pb-8">
              <p className="intro-rise text-small text-ink-muted">Error 404</p>
              <h1
                id="not-found-title"
                className="intro-rise mt-5 max-w-[12ch] font-display text-display font-medium text-balance [font-stretch:100%] lg:mt-7"
                style={rise(80)}
              >
                The bridge breaks here.
              </h1>
              <p className="intro-rise mt-6 max-w-[30rem] text-lede text-pretty text-ink-soft lg:mt-8" style={rise(160)}>
                The page you&rsquo;re looking for may have moved, or the link may be out of date.
              </p>
              <div className="intro-rise mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:mt-10" style={rise(220)}>
                <ButtonLink href="/" size="lg" arrow="right" className="w-full sm:w-auto">
                  Back to home
                </ButtonLink>
                <ButtonLink href="/insights" prefetch={false} size="lg" variant="secondary" className="w-full sm:w-auto">
                  Read insights
                </ButtonLink>
              </div>

              <nav aria-label="Other pages" className="intro-rise mt-10 border-t border-line pt-6 lg:mt-12" style={rise(280)}>
                <ul className="flex flex-wrap gap-x-6 gap-y-3 text-small">
                  {ROUTES.map((route) => (
                    <li key={route.href}>
                      <a
                        href={route.href}
                        className="text-ink underline decoration-line-strong underline-offset-[0.22em] transition-colors hover:text-cobalt-700 hover:decoration-cobalt-700"
                      >
                        {route.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-small text-ink-muted">
                  Still stuck?{" "}
                  <a
                    href={CONTACT_MAILTO}
                    className="text-cobalt-700 underline decoration-cobalt-700/35 underline-offset-[0.22em] hover:decoration-cobalt-700"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </p>
              </nav>
            </div>

            {/* First on small screens, so the break is what a phone sees before the text. */}
            <figure className="order-first -mx-2 lg:order-none lg:col-span-7 lg:col-start-6 lg:mx-0 lg:-mr-gutter lg:pl-8">
              <BrokenBridge className="mx-auto max-w-[52rem]" />
              <figcaption className="sr-only">
                A stone bridge whose middle span has fallen away, the missing slabs left as a dashed drawing.
              </figcaption>
            </figure>
          </Container>
        </section>
      </SiteShell>
    </div>
  );
}
